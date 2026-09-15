/* Switching the hero between the two scenes.
 *
 * The planet is the subject of this game and is what loads by default. The
 * black hole is the other one, and it costs a WebGPU context and a runtime
 * download, so it is never fetched until somebody asks for it.
 *
 * The control is built here rather than in the markup: on a browser without
 * WebGPU, on a narrow viewport, or under prefers-reduced-motion the second
 * scene refuses to run, and a switch that cannot switch is worse than no
 * switch at all.
 */
const KEY = "tarmy.scene";
const host = document.getElementById("scene-toggle");
const canvas = document.getElementById("blackhole-canvas");
const hero = document.querySelector(".hero");

if (host && canvas && hero) boot();

async function boot() {
  let api;
  try {
    api = await import("/static/blackhole/index.js");
  } catch {
    return; // the module did not load; the planet is already on screen
  }
  if (!api.canMount || !api.canMount()) return;

  const scenes = [
    { id: "planet", label: "Planet" },
    { id: "blackhole", label: "Black hole" },
  ];

  let current = "planet";
  let handle = null;

  const buttons = scenes.map((scene) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = scene.label;
    b.addEventListener("click", () => select(scene.id));
    host.appendChild(b);
    return b;
  });

  function paint() {
    buttons.forEach((b, n) => {
      const on = scenes[n].id === current;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }

  async function select(id) {
    if (id === current) return;
    current = id;
    paint();
    try {
      localStorage.setItem(KEY, id);
    } catch {
      /* a browser that refuses storage still gets to switch */
    }

    if (id === "blackhole") {
      /* The class puts the still up immediately, so the switch is answered
         at once even though the first rendered frame is a moment away. */
      document.documentElement.classList.add("scene-blackhole");
      handle = api.mount(canvas, {
        onFail: () => { handle = null; },
      });
      if (!handle) {
        /* Refused after all. The still is already showing and is a true
           picture of the scene, so leave it rather than bouncing back. */
      }
    } else {
      handle?.dispose();
      handle = null;
      document.documentElement.classList.remove("scene-blackhole");
    }
  }

  host.hidden = false;
  paint();

  let saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch {
    /* no stored preference is the same as never having chosen */
  }
  if (saved === "blackhole") select("blackhole");
}
