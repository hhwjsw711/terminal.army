/* The hero's session recording.
 *
 * A real asciinema cast of the real client, replayed as text. It stays
 * sharp at any size, it is a few KB against a video's megabytes, and the
 * commands in it can be selected and copied, which a video cannot offer.
 *
 * The cast is optional. If /static/demo.cast is not present the slot
 * stays hidden and the hero is exactly what it was, so a deploy without a
 * recording is never a broken deploy.
 */
const CAST = "/static/demo.cast";

const slot = document.getElementById("demo");
if (slot && window.AsciinemaPlayer) mount();

async function mount() {
  try {
    /* HEAD first: creating the player against a missing cast leaves an
       error box in the middle of the hero. */
    const probe = await fetch(CAST, { method: "HEAD" });
    if (!probe.ok) return;
  } catch {
    return;
  }

  slot.hidden = false;
  const player = window.AsciinemaPlayer.create(CAST, slot, {
    autoPlay: true,
    loop: true,
    controls: false,
    fit: "width",
    /* Long thinking pauses are honest but they are not watchable, so the
       recording's dead air is compressed rather than edited out. */
    idleTimeLimit: 1.2,
    speed: 1.25,
    terminalFontFamily: "'SF Mono', 'JetBrains Mono', Menlo, Monaco, monospace",
    theme: "tarmy",
  });

  /* The player builds its frame before it knows whether it can run: its
     terminal emulator is a WebAssembly module, and a policy or a browser
     that refuses to compile one leaves a correctly sized black rectangle
     in the middle of the hero. So wait for actual output and take the slot
     back down if none arrives. */
  const painted = await new Promise((resolve) => {
    const deadline = Date.now() + 4000;
    const poll = () => {
      const term = slot.querySelector(".ap-terminal");
      if (term && term.textContent.trim().length > 0) return resolve(true);
      if (Date.now() > deadline) return resolve(false);
      setTimeout(poll, 150);
    };
    poll();
  });

  if (!painted) {
    try {
      player.dispose();
    } catch {
      /* disposing a player that never started is not worth a report */
    }
    slot.innerHTML = "";
    slot.hidden = true;
  }
}
