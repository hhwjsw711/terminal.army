/* The black hole background: a WebGPU scene that mounts on a canvas.
 *
 * This is the only file here you call. It owns the GPU, the frame loop and
 * every listener, and it hands back one handle whose dispose() puts all of it
 * down again, so the page can switch between this scene and the planet as
 * often as someone wants to click.
 *
 * WHAT IT REFUSES TO DO. mount() returns null, synchronously and without
 * throwing, when the scene should not run at all: no WebGPU, a viewport
 * narrower than the threshold, or prefers-reduced-motion. Those are not
 * errors, they are the three cases where the still image at
 * /static/blackhole-still.webp is the right answer, and the caller can tell
 * them apart from a boot failure by the null. A failure that only shows up
 * later (an adapter that never arrives, a device lost mid-scene) cannot be
 * reported that way, so it arrives through options.onFail and through the
 * `ready` promise resolving false; by then the handle has already disposed
 * itself, and the caller shows the still.
 *
 * WHY REDUCED MOTION IS A REFUSAL. A paused first frame of a spinning
 * accretion disk is still an animation someone has to pay for, in a whole
 * WebGPU device and thirteen render passes, to look at one picture. The
 * picture is already a file. Serve the file.
 *
 * PAUSING. The loop stops when the document is hidden and when the canvas
 * scrolls off screen, which is the same contract hero.js keeps for the
 * planet: nothing renders that nobody is looking at. Both conditions have to
 * be satisfied for frames to run, and either one flipping back resumes them
 * without re-initialising anything.
 *
 * The scene itself is upstream's, unmodified, in ./pipeline.js. This file is
 * the part that is ours: the lifecycle, the refusals and the budget.
 *
 * Derived from vercel-labs/vgpu, apps/docs/examples/optimized-black-hole/
 * renderer.ts, commit f495c9948e9b5109aa486c6754ef7c1a451573f5 (2026-08-26).
 * MIT License, Copyright (c) 2025 Vercel, Inc. Full text in
 * scripts/blackhole/upstream/LICENSE.vercel.
 */
import {
  createEffects,
  createTargets,
  destroyTargets,
  prewarm,
  renderChain,
  setBakeUniforms,
  setBindings,
  setPostUniforms,
  setShadeUniforms,
} from "./pipeline.js";
import { centeredLayout, defaultHeroSettings } from "./settings.js";

/* The vgpu runtime is the heaviest thing on this path by a wide margin, about
   57 KiB over the wire against 21 for everything else here, and it is useless
   to a browser that is going to be shown the still. So it is fetched inside
   boot(), after mount() has decided to run, rather than by importing this
   module. A caller can therefore import this file to ask canMount() without
   paying for a runtime it may never use, and a failed fetch of it lands in
   onFail like any other boot failure instead of breaking the import. */
const VGPU_URL = "../vendor/vgpu.module.js";

/** Where the pre-rendered fallback lives, for callers that want one name for it. */
export const STILL_URL = "/static/blackhole-still.webp";

const DEFAULTS = {
  /* Below this many CSS pixels of viewport width, refuse. A phone gets the
     still. The number is the width at which the scene stops being a
     background and starts being the whole screen, and it is also roughly
     where the GPUs stop being desktop GPUs. */
  minWidth: 820,

  /* Device pixel ratio cap. This shader is fragment bound and pays for every
     pixel three times over (g-buffer, shade, bloom chain), so a 2x retina
     buffer is four times the work of a 1x one for a background that is
     mostly out of focus. 1.5 keeps the disk's edges clean without that.
     Upstream ships this at 1. */
  maxPixelRatio: 1.5,

  /* And a ceiling on the buffer itself, because a ratio is not a budget. A
     cap of 1.5 means 2.8 megapixels on a laptop and 7.3 on a 27 inch display,
     and the geodesic bake is linear in pixels: measured on an M-series part,
     that is a 117ms stall at the first size and a 250ms one at the second,
     paid again on every resize. This holds both to the first number. It is
     the constraint that actually binds on a wide screen; maxPixelRatio is
     what binds on a small one. */
  maxPixels: 2_600_000,

  /* Frames per second to pace to. Rendering at 120 on a ProMotion display
     doubles the cost of a background nobody is watching that closely. */
  fps: 60,

  /* Overridable so a caller can force a branch while testing. */
  reducedMotion: null,

  onReady: null,
  onFail: null,
};

/* Two milliseconds of slack, or a 60fps pace on a 60Hz display drops every
   other frame to 30 by missing the deadline by a rounding error. */
const FRAME_PACING_EPSILON_MS = 2;

/* Seconds for the pointer parallax to cover most of the distance to where the
   pointer now is. Upstream's number. */
const SCENE_YAW_TAU_S = 0.325;
const MAX_FRAME_DT_S = 0.1;

/* Upstream's breakpoint for the centred, faded framing. */
const CENTERED_QUERY = "(max-width: 767px)";

/* How long the canvas has to hold a size before the buffers are rebuilt at
   it. Dragging a window edge changes the size on every frame, and rebuilding
   means nine textures and a geodesic bake, which is the most expensive thing
   in here by two orders of magnitude. So the drag is answered by letting the
   browser stretch the old buffer, and the sharp one arrives when the dragging
   stops. */
const RESIZE_SETTLE_MS = 200;

/**
 * Can this browser, on this viewport, run the scene at all?
 *
 * Exactly the gate mount() applies before it does any work, exported so a
 * caller can decide whether to offer the toggle before there is a canvas to
 * mount on. It answers for right now: a window resize or a change to the
 * user's motion setting can change the answer, and neither is watched here.
 *
 * @param {object} [options] the same minWidth and reducedMotion as mount()
 * @returns {boolean}
 */
export function canMount(options = {}) {
  const opts = { ...DEFAULTS, ...options };
  if (typeof navigator === "undefined" || !navigator.gpu) return false;
  if (prefersReducedMotion(opts)) return false;
  return viewportWidth() >= opts.minWidth;
}

/**
 * Put the black hole on a canvas.
 *
 * The canvas is sized by CSS; this never touches its style, only its backing
 * store. Give it a width and a height in your own stylesheet before calling.
 *
 * While the scene is running the canvas carries data-blackhole="running", and
 * it does not before the first frame or after dispose(), so a stylesheet can
 * fade the canvas in over the still without any further JavaScript.
 *
 * @param {HTMLCanvasElement} canvas the canvas to render into
 * @param {object} [options]
 * @param {number} [options.minWidth=820] refuse below this viewport width, in CSS pixels
 * @param {number} [options.maxPixelRatio=1.5] cap on devicePixelRatio for the backing store
 * @param {number} [options.maxPixels=2600000] hard ceiling on the backing store's pixel count
 * @param {number} [options.fps=60] frame pacing ceiling
 * @param {boolean} [options.reducedMotion] override the prefers-reduced-motion check
 * @param {(handle: object) => void} [options.onReady] called once, after the first frame is on screen
 * @param {(error: unknown) => void} [options.onFail] called once if the scene dies; it has already disposed itself
 * @returns {null | {
 *   canvas: HTMLCanvasElement,
 *   ready: Promise<boolean>,
 *   meter: { ms: number, fps: number },
 *   running: boolean,
 *   disposed: boolean,
 *   dispose: () => void,
 * }} null when the scene must not run, in which case show the still image
 */
export function mount(canvas, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  if (!canvas || !canMount(opts)) return null;

  const settings = defaultHeroSettings();
  const wideLayout = {
    centerX: settings.centerX,
    centerY: settings.centerY,
    cameraRoll: settings.cameraRoll,
    mouseYaw: settings.mouseYaw,
    centerFade: settings.centerFade,
  };
  const centeredQuery = matchMedia(CENTERED_QUERY);
  const applyLayout = () => {
    Object.assign(settings, centeredQuery.matches ? centeredLayout() : wideLayout);
  };
  applyLayout();

  /* Bloom is authored against a 2x buffer. Rendering at less than that and
     leaving the radius alone spreads the glow over proportionally more of the
     frame, so the halo has to shrink with the pixels. */
  const dprCap = Math.max(1, opts.maxPixelRatio);
  const bloomScale = Math.min(Math.max(devicePixelRatio || 1, 1), dprCap) / 2;
  settings.bloom.radius *= bloomScale;
  settings.bloom.strength *= bloomScale;

  const minFrameIntervalMs = 1000 / Math.max(1, opts.fps) - FRAME_PACING_EPSILON_MS;

  /* One number, kept for the console, for the same reason hero.js keeps one:
     a landing page that drops frames is worse than a landing page with a flat
     image on it, and that has to be checkable without a profiler. */
  const meter = { ms: 0, fps: 0, _acc: 0, _n: 0 };

  let disposed = false;
  let vgpu, gpu, surface, effects, targets;
  let rafHandle = 0;
  let started = false;
  let firstFrameDone = false;
  let documentVisible = !document.hidden;
  let canvasIntersecting = true;
  let intersection, resizeObserver;

  let animationTime = 0;
  let lastFrameAt;
  let lastPresentedAt;
  let lastYawAt;
  let wantedSize;
  let wantedSince = 0;
  let forceBake = true;
  let pointerX = 0;
  let sceneYaw = 0;

  let resolveReady;
  const ready = new Promise((resolve) => { resolveReady = resolve; });

  const handle = {
    canvas,
    ready,
    meter,
    get running() { return Boolean(rafHandle); },
    get disposed() { return disposed; },
    dispose,
  };

  /* ---------- listeners ---------- */

  const onLayoutChange = () => { applyLayout(); forceBake = true; };
  const onPointerMove = (event) => {
    /* Mouse only. A touch is a tap, not a hover, and yawing the scene to
       wherever a finger last landed reads as a glitch. */
    if (event.pointerType !== "mouse") return;
    const width = Math.max(innerWidth, 1);
    pointerX = Math.min(1, Math.max(-1, (event.clientX / width) * 2 - 1));
  };
  const recenter = () => { pointerX = 0; };
  const onPointerOut = (event) => { if (event.relatedTarget === null) recenter(); };
  const onVisibility = () => {
    if (document.hidden) recenter();
    documentVisible = !document.hidden;
    reconcile();
  };

  centeredQuery.addEventListener("change", onLayoutChange);
  addEventListener("pointermove", onPointerMove, { passive: true });
  addEventListener("pointerout", onPointerOut, { passive: true });
  addEventListener("blur", recenter);
  document.addEventListener("visibilitychange", onVisibility);

  /* ---------- the loop ---------- */

  function reconcile() {
    if (disposed || !started) return;
    const shouldRun = documentVisible && canvasIntersecting;
    if (shouldRun === Boolean(rafHandle)) return;
    if (shouldRun) {
      /* Resuming after a pause must not fast-forward the disk by however long
         the tab was in the background. */
      lastFrameAt = undefined;
      lastYawAt = undefined;
      lastPresentedAt = undefined;
      rafHandle = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafHandle);
      rafHandle = 0;
    }
  }

  function tick(timestamp) {
    rafHandle = 0;
    if (disposed) return;
    if (lastPresentedAt === undefined || timestamp - lastPresentedAt >= minFrameIntervalMs) {
      lastPresentedAt = timestamp;
      const t0 = performance.now();
      try {
        applySettledSize(timestamp);
        vgpu.frame(gpu, renderFrame);
      } catch (error) {
        fail(error);
        return;
      }
      /* The GPU is asynchronous, so this is the cost of building and
         submitting a frame, not of drawing it. It is still the number that
         decides whether the main thread has room for anything else. */
      meter._acc += performance.now() - t0;
      if (++meter._n >= 30) {
        meter.ms = meter._acc / meter._n;
        meter.fps = Math.round(1000 / Math.max(meter.ms, 1e-3));
        meter._acc = 0;
        meter._n = 0;
      }
      if (!firstFrameDone) {
        firstFrameDone = true;
        canvas.dataset.blackhole = "running";
        resolveReady(true);
        try { opts.onReady?.(handle); } catch { /* the caller's problem, not the loop's */ }
      }
    }
    rafHandle = requestAnimationFrame(tick);
  }

  function renderFrame(frame) {
    if (disposed || !effects || !targets || !surface) return;
    const now = performance.now();
    const bake = forceBake;
    forceBake = false;
    if (bake) setBakeUniforms(effects, targets, settings);
    setShadeUniforms(effects, targets, settings, advanceTime(now), advanceYaw(now));
    renderChain(frame, effects, targets, surface, bake);
  }

  function advanceTime(now) {
    animationTime += lastFrameAt === undefined ? 0 : Math.max(0, (now - lastFrameAt) / 1000);
    lastFrameAt = now;
    return animationTime;
  }

  function advanceYaw(now) {
    if (settings.mouseYaw <= 0) {
      sceneYaw = 0;
      lastYawAt = now;
      return 0;
    }
    const dt = lastYawAt === undefined
      ? 0
      : Math.min(Math.max((now - lastYawAt) / 1000, 0), MAX_FRAME_DT_S);
    lastYawAt = now;
    const wanted = pointerX * Math.max(0, settings.mouseYaw);
    sceneYaw += (wanted - sceneYaw) * (1 - Math.exp(-dt / SCENE_YAW_TAU_S));
    return sceneYaw;
  }

  /* ---------- sizing ----------
     vgpu can size the surface from the canvas's layout box on its own, and it
     is turned off here, for two reasons. It resizes on every frame the box
     changed, which during a window drag is every frame, and each of those
     costs nine texture allocations and a bake. And its dpr is a ratio, which
     cannot express "no more than this many pixels, whatever the display
     claims" (see maxPixels).

     So the size is computed here, applied only once it has settled, and
     applied between frames: reallocating targets inside a frame callback
     would pull textures out from under passes still being recorded. In
     between, the browser stretches the last good buffer over the new box,
     which is what a resize should look like anyway. */

  function backingSize() {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    const budget = Math.sqrt(opts.maxPixels / (w * h));
    const scale = Math.max(1, Math.min(devicePixelRatio || 1, dprCap, budget));
    return [Math.max(1, Math.round(w * scale)), Math.max(1, Math.round(h * scale))];
  }

  /* Always compared against what the surface actually is, never against what
     is queued, so a box that is dragged out and back again cancels its own
     pending rebuild instead of scheduling a second one. */
  function noteSize(now) {
    const next = backingSize();
    if (!surface || (next[0] === surface.size[0] && next[1] === surface.size[1])) {
      wantedSize = undefined;
      return;
    }
    wantedSize = next;
    wantedSince = now;
  }

  function applySettledSize(now) {
    if (!wantedSize || now - wantedSince < RESIZE_SETTLE_MS) return;
    const size = wantedSize;
    wantedSize = undefined;
    if (disposed || !vgpu || !gpu || !surface || !effects || !targets) return;
    if (size[0] === surface.size[0] && size[1] === surface.size[1]) return;
    const previous = targets;
    const next = createTargets(vgpu, gpu, size);
    try {
      setBindings(effects, next);
      setPostUniforms(effects, next, settings);
    } catch (error) {
      destroyTargets(next);
      throw error;
    }
    surface.resize(size);
    targets = next;
    destroyTargets(previous);
    forceBake = true;
  }

  /* ---------- boot and teardown ---------- */

  async function boot() {
    vgpu = await import(VGPU_URL);
    if (disposed) { vgpu = undefined; return; }
    gpu = await vgpu.init();
    if (disposed) { gpu.dispose(); gpu = undefined; return; }

    /* An explicit size turns vgpu's own auto-resize off; see the sizing
       section. Everything downstream reads surface.size, so there is one
       source of truth for how big the frame is. */
    surface = vgpu.surface(gpu, canvas, { size: backingSize() });
    effects = createEffects(vgpu, gpu);
    targets = createTargets(vgpu, gpu, surface.size);
    setBindings(effects, targets);
    setPostUniforms(effects, targets, settings);

    /* Compile every pipeline before the first frame, so the scene does not
       appear one pass at a time over the following second. */
    await prewarm(effects, targets, surface);
    if (disposed) return;

    /* Its first callback reports the size the surface was just built at, and
       noteSize recognises that as a no-op, so observing costs nothing here. */
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => noteSize(performance.now()));
      resizeObserver.observe(canvas);
    }

    if (typeof IntersectionObserver !== "undefined") {
      intersection = new IntersectionObserver((entries) => {
        canvasIntersecting = entries[entries.length - 1]?.isIntersecting ?? canvasIntersecting;
        reconcile();
      }, { threshold: 0 });
      intersection.observe(canvas);
    }

    started = true;
    documentVisible = !document.hidden;
    reconcile();
  }

  function fail(error) {
    if (disposed) return;
    dispose(); // resolves `ready` false on its way out
    try { opts.onFail?.(error); } catch { /* nothing left to salvage */ }
    /* Logged rather than rethrown: this runs inside a rAF callback and inside
       a promise chain, where a throw is swallowed by one and unhandled by the
       other, and neither reaches the caller who has to draw the fallback. */
    console.error("[blackhole] scene stopped", error);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    if (rafHandle) { cancelAnimationFrame(rafHandle); rafHandle = 0; }
    centeredQuery.removeEventListener("change", onLayoutChange);
    removeEventListener("pointermove", onPointerMove);
    removeEventListener("pointerout", onPointerOut);
    removeEventListener("blur", recenter);
    document.removeEventListener("visibilitychange", onVisibility);
    intersection?.disconnect();
    resizeObserver?.disconnect();
    delete canvas.dataset.blackhole;
    /* One call takes the whole device down, and every target, effect,
       sampler, texture and the surface with it. */
    try { gpu?.dispose(); } catch { /* already gone */ }
    vgpu = gpu = surface = effects = targets = undefined;
    resolveReady(false);
  }

  boot().catch(fail);

  return handle;
}

function viewportWidth() {
  return Math.max(
    document.documentElement?.clientWidth || 0,
    typeof innerWidth === "number" ? innerWidth : 0,
  );
}

function prefersReducedMotion(opts) {
  if (typeof opts.reducedMotion === "boolean") return opts.reducedMotion;
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}
