/* Look and framing of the black hole.
 *
 * Vendored from vercel-labs/vgpu, apps/docs/examples/optimized-black-hole/
 * settings.ts, commit f495c9948e9b5109aa486c6754ef7c1a451573f5 (2026-08-26).
 * MIT License, Copyright (c) 2025 Vercel, Inc. Full text in
 * scripts/blackhole/upstream/LICENSE.vercel.
 *
 * Changed from upstream: TypeScript interfaces dropped (this file is loaded by
 * the browser as-is, there is no compile step) and the numbers are otherwise
 * untouched, so the still image and the live scene stay the same picture.
 */

/** Shared deterministic production defaults for the browser and headless renderer. */
export function defaultHeroSettings() {
  return {
    cameraY: 0.16,
    distance: 13.5,
    diskRadius: 9,
    fov: 3,
    centerX: 0.8,
    centerY: 0.3,
    cameraRoll: -0.27,
    mouseYaw: 0.15,
    centerFade: 0,
    bloom: { strength: 1, threshold: 0, knee: 0.18, radius: 1.5 },
    disk: {
      brightness: 0.75,
      speed: 0.75,
      stretch: 5.75,
      detail: 3.44,
      turbulence: 4.46,
      density: 1.38,
      doppler: 1.21,
      cloudScale: 20,
      cloudSpeed: 0.3,
      cloudStrength: 0.2,
      spare0: 0.43,
      spare1: -0.25,
      spare2: -0.67,
      spare3: 0.69,
    },
    stars: { brightness: 1, density: 1, contrast: 13, warmth: 0.5, twinkle: 0 },
  };
}

/** The framing upstream switches to on a narrow viewport: dead centre, no roll,
 *  no pointer yaw, and the disk's middle faded so text can sit on top of it. */
export function centeredLayout() {
  return { centerX: 0, centerY: 0, cameraRoll: 0, mouseYaw: 0, centerFade: 1 };
}
