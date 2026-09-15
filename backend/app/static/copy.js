/* Copy buttons for the shell commands.
 *
 * The button is created here rather than sitting in the markup, because a
 * copy control that cannot copy is worse than none at all: if this module is
 * blocked, or the clipboard API is unavailable, no button ever appears and
 * the command stays selectable by hand, which is what it was before.
 *
 * The label text comes from data attributes so the module needs no catalogue
 * of its own and the page stays translated.
 */
const targets = document.querySelectorAll("[data-copy]");
if (targets.length && navigator.clipboard && window.isSecureContext) {
  targets.forEach(setup);
}

function setup(block) {
  const source = block.querySelector("code");
  if (!source) return;

  const label = block.dataset.copyLabel || "Copy";
  const done = block.dataset.copyDone || "Copied";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "copy-btn";
  button.textContent = label;
  /* The command is already on screen; announcing the button's own state is
     what a screen reader needs, not the text it copied. */
  button.setAttribute("aria-live", "polite");

  let resetAt = 0;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(source.textContent.trim());
    } catch {
      /* A denied clipboard is not worth an error banner on a landing page.
         Saying nothing leaves the visitor with the text they can still
         select, which is the same place they started. */
      return;
    }
    button.textContent = done;
    button.classList.add("is-done");
    const mine = Date.now();
    resetAt = mine;
    setTimeout(() => {
      if (resetAt !== mine) return; // a later click owns the label now
      button.textContent = label;
      button.classList.remove("is-done");
    }, 1600);
  });

  block.appendChild(button);
  block.classList.add("has-copy");
}
