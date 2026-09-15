/* The world itself: terrain, the lattice it is drawn with, the fleet arcs
 * that cross it and the shell of air around it.
 *
 * Everything here is resolved once at boot. The land mask decides which
 * cells exist at all, so it is not something to recompute for every point
 * on every frame; the lattice that survives is uploaded and then only ever
 * transformed. Nothing in this file is fetched and nothing leaves the
 * origin, which is what lets the page keep a closed content policy.
 */
import * as THREE from "../vendor/three.module.min.js";

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash3(x, y, z) {
  let px = x * 0.3183099 + 0.71, py = y * 0.3183099 + 0.113, pz = z * 0.3183099 + 0.419;
  px -= Math.floor(px); py -= Math.floor(py); pz -= Math.floor(pz);
  px *= 17; py *= 17; pz *= 17;
  const v = px * py * pz * (px + py + pz);
  return v - Math.floor(v);
}

function vnoise(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = x - ix, fy = y - iy, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), uz = fz * fz * (3 - 2 * fz);
  const lerp = (a, b, t) => a + (b - a) * t;
  return lerp(
    lerp(lerp(hash3(ix, iy, iz), hash3(ix + 1, iy, iz), ux),
         lerp(hash3(ix, iy + 1, iz), hash3(ix + 1, iy + 1, iz), ux), uy),
    lerp(lerp(hash3(ix, iy, iz + 1), hash3(ix + 1, iy, iz + 1), ux),
         lerp(hash3(ix, iy + 1, iz + 1), hash3(ix + 1, iy + 1, iz + 1), ux), uy),
    uz);
}

function fbm(x, y, z) {
  let s = 0, a = 0.5;
  for (let i = 0; i < 5; i++) {
    s += a * vnoise(x, y, z);
    x *= 2.07; y *= 2.07; z *= 2.07;
    a *= 0.5;
  }
  return s;
}

/* Height at a direction on the unit sphere. The field is warped by a
   sample of itself, which is what stops the continents reading as a mat
   of identical blobs. */
export function heightAt(x, y, z) {
  const f = 2.6;
  const w = fbm(x * f + 11.3, y * f + 4.7, z * f + 2.1);
  return fbm(x * f + w * 1.6, y * f + w * 1.6, z * f + w * 1.6);
}

export const SEA_LEVEL = 0.515;

/* Builds the planet into `world`, the node that carries the spin. Nothing
   in here reacts to the fleet: the two only meet in the depth buffer. */
export function buildPlanet({ world, R, narrow, dpr, uTime, uSun }) {
  /* ---------- the dark body ----------
     An opaque sphere just inside the lattice, so the far side of the
     planet is occluded by depth instead of showing through. It is also
     what makes a ship passing behind the world disappear behind it. */
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.988, 64, 48),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.004, 0.008, 0.015) })
  );
  world.add(body);

  /* ---------- the lattice ----------
     Rings at a constant angular step, each carrying a count proportional
     to its circumference, which keeps the cells the same size everywhere
     instead of crowding them at the poles. */
  const STEP = narrow ? 0.020 : 0.0125; // radians between rings
  const positions = [];
  const flags = [];   // x: land, y: city intensity, z: per-cell jitter

  const rand = mulberry32(0x7a12d);
  const rings = Math.floor(Math.PI / STEP);
  for (let i = 1; i < rings; i++) {
    const phi = (i / rings) * Math.PI;          // 0 at the north pole
    const sinPhi = Math.sin(phi);
    const y = Math.cos(phi);
    const count = Math.max(4, Math.round((2 * Math.PI * sinPhi) / STEP));
    for (let j = 0; j < count; j++) {
      const theta = (j / count) * Math.PI * 2;
      const x = sinPhi * Math.cos(theta);
      const z = sinPhi * Math.sin(theta);

      const h = heightAt(x, y, z);
      const land = h > SEA_LEVEL ? 1 : 0;
      /* Ocean keeps a sparse scatter: enough to give the sphere a body
         and a dense rim, not enough to compete with the continents. */
      if (!land && rand() > 0.16) continue;

      let city = 0;
      if (land) {
        const c = fbm(x * 22, y * 22, z * 22);
        /* fbm here lands around 0.48, so a 0.54 gate left almost nothing
           above it. Sit the gate under the mean and let the divisor do the
           shaping. Population thins toward the poles, as on any world. */
        city = Math.max(0, (c - 0.44) / 0.20) * Math.max(0, 1 - Math.abs(y) / 0.86);
        city = Math.min(1, city);
      }

      positions.push(x * R, y * R, z * R);
      flags.push(land, city, rand());
    }
  }

  const latticeGeo = new THREE.BufferGeometry();
  latticeGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  latticeGeo.setAttribute("aFlags", new THREE.Float32BufferAttribute(flags, 3));

  const lattice = new THREE.Points(
    latticeGeo,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime, uSun, uPixel: { value: dpr } },
      vertexShader: /* glsl */ `
        attribute vec3 aFlags;
        uniform vec3 uSun;
        uniform float uTime;
        uniform float uPixel;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float land = aFlags.x;
          float city = aFlags.y;
          float jitter = aFlags.z;

          vec3 n = normalize(mat3(modelMatrix) * position);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vec3 viewDir = normalize(cameraPosition - wp.xyz);

          float lambert = dot(n, uSun);
          float day = smoothstep(-0.10, 0.32, lambert);
          /* Cells crowd together toward the silhouette, so the rim reads
             as a bright ring on its own. Lifting it further is what makes
             the planet read as a sphere rather than a disc of dots. */
          float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);

          vec3 sea  = vec3(0.18, 0.46, 0.72);
          vec3 soil = vec3(0.55, 0.93, 1.00);
          vec3 col = mix(sea, soil, land);

          float a = mix(0.22, 0.92, land) * (0.13 + 0.95 * day);
          a += rim * mix(0.35, 0.60, land);

          /* Night side: the cities are the only thing burning, in a hot
             white that keeps the whole frame in the cold end of the
             spectrum where the rest of the page now sits. */
          float night = 1.0 - day;
          float pulse = 0.72 + 0.28 * sin(uTime * 1.7 + jitter * 43.0);
          float lamp = city * night * pulse;
          col = mix(col, vec3(0.88, 0.97, 1.00), clamp(lamp * 2.2, 0.0, 1.0));
          a += lamp * 1.35;

          gl_Position = projectionMatrix * viewMatrix * wp;
          /* Square cells, sized in device pixels: the point of the
             treatment is that the planet is made of countable things. */
          gl_PointSize = (1.05 + land * 0.75 + rim * 1.0) * uPixel;

          vColor = col;
          vAlpha = clamp(a, 0.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          gl_FragColor = vec4(vColor * vAlpha, vAlpha);
        }
      `,
    })
  );
  world.add(lattice);

  /* ---------- fleet arcs ----------
     Great-circle hops between two points on the surface, lifted into a
     bell so they arc over the limb. These are civilian traffic: they run
     whatever the fleet above them is doing. */
  const ARCS = narrow ? 10 : 20;
  const arcs = [];
  const arcRand = mulberry32(0x51f3a);

  for (let i = 0; i < ARCS; i++) {
    const a = surfacePoint(arcRand);
    const b = surfacePoint(arcRand);
    const angle = a.angleTo(b);
    if (angle < 0.5) { continue; }

    const SEGS = 96;
    const pts = [];
    const ts = [];
    for (let k = 0; k <= SEGS; k++) {
      const t = k / SEGS;
      const p = a.clone().lerp(b, t).normalize();
      /* Height follows a sine bell, scaled by how far the hop is, so a
         short hop skims and a long one climbs. */
      const lift = 1 + Math.sin(t * Math.PI) * (0.05 + angle * 0.075);
      pts.push(p.multiplyScalar(R * lift));
      ts.push(t);
    }

    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    geo.setAttribute("aT", new THREE.Float32BufferAttribute(ts, 1));

    const line = new THREE.Line(geo, new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime,
        uOffset: { value: arcRand() },
        uSpeed: { value: 0.10 + arcRand() * 0.12 },
      },
      vertexShader: /* glsl */ `
        attribute float aT;
        varying float vT;
        void main() {
          vT = aT;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;
        uniform float uTime;
        uniform float uOffset;
        uniform float uSpeed;
        varying float vT;
        void main() {
          /* A standing trace, plus a head travelling along it dragging a
             tail. The tail is behind the head, so the falloff is steep
             ahead of it (head - vT < 0) and long behind. */
          float head = fract(uTime * uSpeed + uOffset);
          float d = head - vT;
          float tail = d >= 0.0 ? exp(-d * 11.0) : exp(d * 90.0);
          float base = 0.22 * smoothstep(0.0, 0.05, vT) * smoothstep(1.0, 0.95, vT);
          float a = base + tail * 0.85;
          vec3 col = mix(vec3(0.28, 0.66, 0.92), vec3(0.80, 0.98, 1.00), tail);
          gl_FragColor = vec4(col * a, a);
        }
      `,
    }));
    world.add(line);
    arcs.push(line);
  }

  /* ---------- atmosphere ----------
     A thin shell drawn on its inside and added to what is behind it, so
     the rim reaches past the silhouette into space instead of stopping
     at it. */
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.022, 96, 64),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uSun },
      vertexShader: /* glsl */ `
        varying vec3 vWorldNormal;
        varying vec3 vViewDir;
        void main() {
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vViewDir = normalize(cameraPosition - wp.xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;
        uniform vec3 uSun;
        varying vec3 vWorldNormal;
        varying vec3 vViewDir;
        void main() {
          vec3 n = normalize(vWorldNormal);
          float rim = pow(max(1.0 - abs(dot(n, vViewDir)), 0.0), 5.0);
          float lit = smoothstep(-0.25, 0.45, dot(-n, uSun));
          vec3 tint = mix(vec3(0.20, 0.46, 0.86), vec3(0.52, 0.76, 1.0), rim);
          gl_FragColor = vec4(tint * rim * lit * 1.9, rim * lit * 0.75);
        }
      `,
    })
  );
  world.add(atmosphere);

  return { body, lattice, atmosphere, cells: positions.length / 3, arcs: arcs.length };
}

/* Uniform on the sphere, biased toward land, because a fleet leaves from
   somewhere. */
export function surfacePoint(rand) {
  for (let attempt = 0; attempt < 24; attempt++) {
    const u = rand() * 2 - 1;
    const t = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const p = new THREE.Vector3(s * Math.cos(t), u, s * Math.sin(t));
    if (attempt > 16 || heightAt(p.x, p.y, p.z) > SEA_LEVEL) return p;
  }
  return new THREE.Vector3(0, 1, 0);
}
