/* The landing hero's world.
 *
 * A planet drawn the way this game draws everything else: out of discrete
 * points, with a war going on above its limb. Continents are a lattice of
 * lit cells, cities burn on the night side, freighters run a lane out to a
 * battle station and fighters try to stop them. Nothing is fetched. There
 * is no texture, no build step and no request that leaves the origin, which
 * is what lets the page keep a closed content policy.
 *
 * The CSS horizon in main.css is the floor under this. It renders on its
 * own, and the class this module sets on <html> is the only thing that
 * hides it, so a browser without WebGL, a blocked module and a failed boot
 * all land on the same static sky rather than an empty one. Everything that
 * can fail after that point is behind a dynamic import or a try, for the
 * same reason.
 *
 * Drag anywhere on the hero to turn the planet; the throw carries on after
 * release. Links, buttons and the install command keep their own clicks.
 */
import * as THREE from "./vendor/three.module.min.js";
import { buildPlanet, mulberry32 } from "./hero/planet.js";
import { createFleet } from "./hero/fleet.js";

const canvas = document.getElementById("sky-canvas");
const hero = document.querySelector(".hero");
if (canvas && hero) start();

function start() {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = matchMedia("(max-width: 760px)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false, // points are meant to be hard-edged cells
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    return; // no WebGL: the CSS horizon is already on screen, leave it
  }
  const dpr = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  /* Orthographic: a world seen from orbit is lit by very nearly parallel
     rays, and the silhouette is then exactly a circle of radius R in
     frustum units, so the globe can be parked at a chosen fraction of the
     frame with arithmetic rather than guesswork. */
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  camera.position.z = 60;

  const R = 1.62;                 // frustum half-height is 1
  /* Below this the bloom pass costs more than the picture it buys, and the
     parts most likely to be under it are the ones least able to pay. */
  const GLOW_MIN_WIDTH = 900;
  const SUN = new THREE.Vector3(-0.90, 0.20, 0.10).normalize();
  const uTime = { value: 0 };
  const uSun = { value: SUN };

  /* holder: axial lean and a slight roll, so the globe is not a spirit
     level. world: the spin, on its own node, so turning the planet never
     drags the poles through frame. */
  const holder = new THREE.Group();
  const world = new THREE.Group();
  holder.add(world);
  scene.add(holder);
  holder.rotation.z = -0.19;
  const BASE_TILT = 0.95; // radians: about asin(0.84), the strip's latitude
  holder.rotation.x = BASE_TILT;

  /* The fleet hangs off a node of its own, sharing only the globe's centre.
     Putting it inside `holder` meant that dragging the planet rolled the
     whole battle with it and that every heading had to be expressed in a
     frame tilted by a radian; here +Y is up the screen and +Z is toward the
     camera, which is the frame the flight model actually reasons in. The
     silhouette of a sphere does not change when you spin it, so nothing is
     lost by leaving the fleet out of the drag. */
  const sky = new THREE.Group();
  scene.add(sky);

  /* The construction runs inside a try and `has-globe` is not set until a
     frame has actually been drawn. The class is the only thing that hides
     the CSS horizon, so setting it up front means any failure between there
     and the first render leaves the visitor on a blank black band with no
     sky at all: worse than never having tried. */
  let planet, fleet;
  try {
    planet = buildPlanet({ world, R, narrow, dpr, uTime, uSun });
    fleet = createFleet({
      parent: sky, R, narrow, dpr, uSun, rand: mulberry32(0x2c9f1),
    });
  } catch {
    renderer.dispose();
    return;
  }

  /* ---------- framing ---------- */

  const box = { width: 0, height: 0, left: 0, top: 0 };

  function layout() {
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    if (!w || !h) return;

    renderer.setSize(w, h, false);
    if (bloom) {
      /* The width gate is re-tested on every layout, not only at boot. A
         window dragged down to a phone's width is a window that has stopped
         being able to afford the pass. */
      composer = w >= GLOW_MIN_WIDTH ? bloom.__composer : null;
      composer?.setSize(w, h);
      bloom.setSize(w * 0.4, h * 0.4);
    }
    const aspect = w / h;
    camera.left = -aspect;
    camera.right = aspect;
    camera.updateProjectionMatrix();

    /* Where the top of the globe sits, as a fraction of the frame height.
       Below the copy on every viewport, so the headline always reads
       against clean space. */
    const crown = w < 760 ? 0.78 : 0.72;
    holder.position.y = 1 - 2 * crown - R;
    sky.position.y = holder.position.y;

    /* The arena, handed to the flight model in its own frame. It is derived
       from the framing rather than fixed, because the globe is parked by
       frame fraction: the sky above its limb is a different shape on a
       phone than on a laptop, and orbits sized to hug a globe that mostly
       sits below the frame sit below the frame with it. */
    const f = fleet.frame;
    f.yLo = (-1 - holder.position.y) + 0.05;
    f.yHi = R + (narrow ? 0.12 : 0.20);
    /* A margin outside the frame, so traffic enters and leaves rather than
       turning around in full view. Proportional, because a fixed one is
       most of the picture on a phone: at a portrait aspect a third of a
       unit of slack is two thirds of the visible width, and the fleet
       spends its time in a wing of the stage nobody can see. */
    f.xHalf = aspect + Math.min(0.35, aspect * 0.35);
    f.xView = aspect;
    f.rLo = R * 1.08;
    f.rHi = R * 1.42;
    f.zHalf = R * 0.72;

    const r = canvas.getBoundingClientRect();
    box.width = r.width; box.height = r.height; box.left = r.left; box.top = r.top;

    /* setSize clears the buffer, so a resize while the loop is idle would
       otherwise leave the canvas blank until something else redraws. */
    present();
  }

  /* ---------- drag, throw and drift ---------- */

  let spin = 1.15;
  let tilt = 0;
  let spinVel = 0;
  let dragging = false;
  let lastX = 0, lastY = 0;
  const DRIFT = reducedMotion ? 0 : 0.026; // radians per second

  hero.addEventListener("pointerdown", (e) => {
    /* .hero-cmd by class, not by tag. The install command is a <p> in the
       markup, so the `pre` in this list never matched it and a visitor
       trying to select the line to copy it span the planet instead. */
    if (e.target.closest("a, button, input, textarea, pre, select, .hero-cmd")) return;
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
    spinVel = 0;
    hero.classList.add("dragging");
    hero.setPointerCapture?.(e.pointerId);
    request();
  });
  hero.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    const k = 0.005;
    spin += dx * k;
    spinVel = dx * k;
    tilt = Math.max(-0.55, Math.min(0.75, tilt + dy * k * 0.7));
    request();
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    hero.classList.remove("dragging");
    if (e) hero.releasePointerCapture?.(e.pointerId);
    request();
  }
  hero.addEventListener("pointerup", endDrag);
  hero.addEventListener("pointercancel", endDrag);

  /* Parallax as a slide, not a swing: rotating an orthographic camera
     shears the frame instead of shifting it. */
  let px = 0, py = 0, tx = 0, ty = 0;
  addEventListener("pointermove", (e) => {
    if (!box.width || !box.height) return;
    tx = ((e.clientX - box.left) / box.width) * 2 - 1;
    ty = -(((e.clientY - box.top) / box.height) * 2 - 1);
  }, { passive: true });

  /* ---------- the loop ---------- */

  const clock = new THREE.Clock();
  let raf = 0;
  let visible = true;
  let composer = null;
  let bloom = null;

  /* One number, kept for the console. A landing page that drops frames on
     an integrated part is worse than one with no planet on it at all, so
     the cost of everything above has to be measurable without a profiler. */
  const meter = { ms: 0, fps: 0, samples: 0, acc: 0 };

  function present() {
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  function draw(dt) {
    uTime.value = clock.elapsedTime;

    if (!dragging) {
      /* The throw decays toward the drift rather than to a stop, so
         releasing a spin settles back into the ambient rotation. */
      spin += spinVel * dt * 60;
      spinVel *= Math.pow(0.94, dt * 60);
      spin += DRIFT * dt;
    }

    holder.rotation.x = BASE_TILT + tilt;
    world.rotation.y = spin;
    /* Reduced motion means reduced motion. The fleet is not stepped at all,
       not even while dragging: a battle that only runs under the pointer is
       still a battle running for someone who asked for none. */
    if (!reducedMotion) fleet.update(dt);

    px += (tx * 0.03 - px) * Math.min(1, dt * 3);
    py += (ty * 0.02 - py) * Math.min(1, dt * 3);
    camera.position.x = px;
    camera.position.y = py;

    present();
  }

  function frame() {
    raf = 0;
    const t0 = performance.now();
    const dt = Math.min(clock.getDelta(), 1 / 30);
    draw(dt);
    meter.acc += performance.now() - t0;
    if (++meter.samples >= 30) {
      meter.ms = meter.acc / meter.samples;
      meter.fps = Math.round(1000 / Math.max(meter.ms, 1e-3));
      meter.acc = 0; meter.samples = 0;
    }
    /* Reduced motion still answers a drag; it just does not animate on
       its own, so the loop only stays alive while something moves. */
    if (visible && !reducedMotion) request();
    else if (visible && (dragging || Math.abs(spinVel) > 1e-5)) request();
  }
  function request() {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  }

  try {
    layout();
    clock.getDelta();
    draw(0);
  } catch {
    renderer.dispose();
    return;
  }
  /* One frame is on the canvas. Only now is it safe to take the CSS sky
     away. */
  document.documentElement.classList.add("has-globe");

  new ResizeObserver(layout).observe(hero);
  addEventListener("scroll", () => {
    const r = canvas.getBoundingClientRect();
    box.left = r.left; box.top = r.top;
  }, { passive: true });

  /* Stop paying for frames nobody can see. */
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) { clock.getDelta(); request(); }
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { threshold: 0 }).observe(hero);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    else { clock.getDelta(); request(); }
  });

  request();

  /* ---------- glow ----------
     Bloom is the one thing here that costs real bandwidth: a floating point
     copy of the frame plus five blurred mips of it. So it is loaded only
     after the scene is already on screen and already running, it is refused
     outright below a width where the pass costs more than the picture is
     worth, and its mips run at two fifths of the frame. A failure to load it
     loses the glow and nothing else, which is why the import is dynamic: a
     static one that threw would take the planet down with it and drop the
     page back to the CSS sky.

     BLOOM_CUT is the whole argument. The planet is a lattice of discrete
     cells and that is the point of it; a threshold low enough to catch the
     rim turns the world into a soft glowing ball and throws away the one
     idea the picture has. Set above where the lattice tops out, so what
     spills is only the superlaser, its impact and the muzzle flashes: the
     things that are supposed to be too bright to look at. */
  const BLOOM_CUT = 0.92;

  async function addGlow() {
    if (reducedMotion || hero.clientWidth < GLOW_MIN_WIDTH) return;
    try {
      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }] = await Promise.all([
        import("./vendor/three-addons/postprocessing/EffectComposer.js"),
        import("./vendor/three-addons/postprocessing/RenderPass.js"),
        import("./vendor/three-addons/postprocessing/UnrealBloomPass.js"),
      ]);
      const w = hero.clientWidth, h = hero.clientHeight;
      const c = new EffectComposer(renderer);
      /* The scene pass keeps the renderer's own ratio. Dropping it would
         cost less, but it costs the cells: they are a pixel and a half
         across, and resampling them is exactly the resolution the treatment
         cannot spare. The saving comes out of the blur instead, which
         nobody can see the resolution of. */
      c.setPixelRatio(dpr);
      c.setSize(w, h);
      c.addPass(new RenderPass(scene, camera));
      const b = new UnrealBloomPass(new THREE.Vector2(w * 0.4, h * 0.4), 0.9, 0.55, BLOOM_CUT);
      c.addPass(b);
      b.setSize(w * 0.4, h * 0.4);
      b.__composer = c;
      composer = c;
      bloom = b;
      request();
    } catch {
      composer = null;
      bloom = null;
    }
  }
  addGlow();

  /* For tuning from the console. `glow` is how the cost of the composer was
     measured against the same scene without it. */
  window.__tarmy = {
    scene, camera, renderer, fleet, meter, planet,
    glow(on) { if (!bloom) return false; composer = on ? bloom.__composer : null; return !!composer; },
    get bloom() { return bloom; },
    fire: () => fleet.fire(),
  };
}
