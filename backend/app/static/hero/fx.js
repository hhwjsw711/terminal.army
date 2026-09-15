/* Everything transient: bolts, sparks, engine trails, wreckage and the
 * shockwave the superlaser leaves on the surface.
 *
 * All of it is pooled. A battle that allocates a mesh per shot spends its
 * frame budget in the garbage collector rather than on the GPU, and the
 * stutter that produces on an integrated part is exactly the thing a
 * landing page cannot afford. So each effect is one buffer of a fixed size
 * with a free list over it, which also means each is one draw call no
 * matter how much is happening.
 */
import * as THREE from "../vendor/three.module.min.js";

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();

/* ---------------------------------------------------------------- *
 *  Sparks: muzzle flash, hit flash, the core of an explosion, ejecta.
 *
 *  Round rather than square, which is the one place the page departs
 *  from its own cell language on purpose: matter is countable, light
 *  is not.
 * ---------------------------------------------------------------- */
export function makeSparks(parent, count, dpr) {
  const pos = new Float32Array(count * 3);
  const data = new Float32Array(count * 3); // size, alpha, warmth
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aData", new THREE.BufferAttribute(data, 3));

  const points = new THREE.Points(geo, new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uPixel: { value: dpr } },
    vertexShader: /* glsl */ `
      attribute vec3 aData;
      uniform float uPixel;
      varying float vAlpha;
      varying float vWarm;
      void main() {
        vAlpha = aData.y;
        vWarm = aData.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aData.x * uPixel;
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float;
      varying float vAlpha;
      varying float vWarm;
      void main() {
        vec2 d = gl_PointCoord - 0.5;
        float r = dot(d, d) * 4.0;
        float fall = exp(-r * 3.2) * (1.0 - smoothstep(0.75, 1.0, r));
        float a = fall * vAlpha;
        vec3 col = mix(vec3(0.42, 0.72, 1.0), vec3(1.0, 0.99, 0.92), vWarm);
        gl_FragColor = vec4(col * a, a);
      }
    `,
  }));
  points.frustumCulled = false;
  parent.add(points);

  const pool = [];
  for (let i = 0; i < count; i++) pool.push({ life: 0, ttl: 1, size: 8, warm: 0, drag: 1, vel: new THREE.Vector3(), pos: new THREE.Vector3() });
  let cursor = 0;

  /* Oldest slot wins when the pool is full. A burst that silently drops
     half its particles reads as a weaker explosion, which is wrong; a
     burst that steals from a dying one does not read at all. */
  function take() {
    for (let i = 0; i < count; i++) {
      const s = pool[cursor];
      cursor = (cursor + 1) % count;
      if (s.life <= 0) return s;
    }
    const s = pool[cursor];
    cursor = (cursor + 1) % count;
    return s;
  }

  return {
    object: points,
    /* One spark. `spread` is how far off `dir` it may fly, in radians. */
    emit(at, dir, speed, ttl, size, warm, spread = 0) {
      const s = take();
      s.pos.copy(at);
      s.vel.copy(dir);
      if (spread > 0) {
        s.vel.x += (Math.random() - 0.5) * spread;
        s.vel.y += (Math.random() - 0.5) * spread;
        s.vel.z += (Math.random() - 0.5) * spread;
      }
      s.vel.normalize().multiplyScalar(speed * (0.6 + Math.random() * 0.8));
      s.life = s.ttl = ttl;
      s.size = size;
      s.warm = warm;
      s.drag = 1.9;
      return s;
    },
    burst(at, n, speed, ttl, size, warm) {
      for (let i = 0; i < n; i++) {
        _a.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
        if (_a.lengthSq() < 1e-6) _a.set(0, 1, 0);
        this.emit(at, _a, speed, ttl * (0.5 + Math.random()), size * (0.6 + Math.random() * 0.8), warm);
      }
    },
    update(dt) {
      for (let i = 0; i < count; i++) {
        const s = pool[i];
        const o = i * 3;
        if (s.life <= 0) { data[o + 1] = 0; continue; }
        s.life -= dt;
        const k = Math.exp(-s.drag * dt);
        s.vel.multiplyScalar(k);
        s.pos.addScaledVector(s.vel, dt);
        const t = Math.max(0, s.life / s.ttl);
        pos[o] = s.pos.x; pos[o + 1] = s.pos.y; pos[o + 2] = s.pos.z;
        data[o] = s.size * (0.35 + 0.65 * t);
        data[o + 1] = t * t;
        data[o + 2] = s.warm;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aData.needsUpdate = true;
    },
  };
}

/* ---------------------------------------------------------------- *
 *  Bolts: real projectiles, with a flight time and somewhere to be.
 * ---------------------------------------------------------------- */
export function makeBolts(parent, count) {
  const pos = new Float32Array(count * 2 * 3);
  const col = new Float32Array(count * 2 * 4); // rgb + alpha
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(col, 4));

  const seg = new THREE.LineSegments(geo, new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec4 aColor;
      varying vec4 vColor;
      void main() {
        vColor = aColor;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float;
      varying vec4 vColor;
      void main() { gl_FragColor = vec4(vColor.rgb * vColor.a, vColor.a); }
    `,
  }));
  seg.frustumCulled = false;
  parent.add(seg);

  const pool = [];
  for (let i = 0; i < count; i++) {
    pool.push({
      live: false, life: 0, speed: 0, len: 0.1, warm: 0,
      pos: new THREE.Vector3(), dir: new THREE.Vector3(),
      target: null, shooter: null, damage: 1,
    });
  }

  return {
    object: seg,
    pool,
    fire(from, dir, opts) {
      const b = pool.find((p) => !p.live);
      if (!b) return null;
      b.live = true;
      b.pos.copy(from);
      b.dir.copy(dir).normalize();
      b.life = opts.life;
      b.speed = opts.speed;
      b.len = opts.len;
      b.warm = opts.warm;
      b.target = opts.target || null;
      b.shooter = opts.shooter || null;
      b.damage = opts.damage || 1;
      return b;
    },
    /* Steps every bolt and reports the first thing each one runs into.
       `onHit(bolt)` is called with the bolt still holding its target. */
    update(dt, onHit) {
      let v = 0;
      for (const b of pool) {
        if (!b.live) {
          for (let k = 0; k < 2; k++) {
            pos[v * 3] = 0; pos[v * 3 + 1] = 0; pos[v * 3 + 2] = 0;
            col[v * 4 + 3] = 0; v++;
          }
          continue;
        }
        b.life -= dt;
        const step = b.speed * dt;
        _a.copy(b.pos);                       // where it was
        b.pos.addScaledVector(b.dir, step);   // where it is

        /* Point to segment, not point to point: at 1/30 of a second a bolt
           travels further than a fighter is wide, so a bolt tested only at
           its endpoints passes straight through the ship it was aimed at. */
        const t = b.target;
        if (t && t.alive) {
          _b.copy(t.pos).sub(_a);
          _c.copy(b.pos).sub(_a);
          const seglen2 = _c.lengthSq();
          const u = seglen2 > 1e-9 ? Math.max(0, Math.min(1, _b.dot(_c) / seglen2)) : 0;
          _c.multiplyScalar(u).add(_a);
          if (_c.distanceToSquared(t.pos) < t.hitR * t.hitR) {
            b.pos.copy(_c);
            onHit(b);
            b.live = false;
          }
        }
        if (b.life <= 0) b.live = false;

        const a = b.live ? Math.min(1, b.life * 6) : 0;
        const tailx = b.pos.x - b.dir.x * b.len;
        const taily = b.pos.y - b.dir.y * b.len;
        const tailz = b.pos.z - b.dir.z * b.len;
        const r = 0.42 + b.warm * 0.35, g = 0.62 + b.warm * 0.36, bl = 1.0;
        pos[v * 3] = tailx; pos[v * 3 + 1] = taily; pos[v * 3 + 2] = tailz;
        col[v * 4] = r; col[v * 4 + 1] = g; col[v * 4 + 2] = bl; col[v * 4 + 3] = a * 0.12; v++;
        pos[v * 3] = b.pos.x; pos[v * 3 + 1] = b.pos.y; pos[v * 3 + 2] = b.pos.z;
        col[v * 4] = r; col[v * 4 + 1] = g; col[v * 4 + 2] = bl; col[v * 4 + 3] = a; v++;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aColor.needsUpdate = true;
    },
  };
}

/* ---------------------------------------------------------------- *
 *  Engine trails.
 *
 *  A ring buffer of past positions per ship, all of them in one Points
 *  object. The alternative, a ribbon mesh per ship, is a draw call per
 *  ship and a geometry rebuild per frame for a line nobody looks at
 *  directly.
 * ---------------------------------------------------------------- */
export function makeTrails(parent, ships, perShip, dpr) {
  const count = ships * perShip;
  const pos = new Float32Array(count * 3);
  const age = new Float32Array(count);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aAge", new THREE.BufferAttribute(age, 1));

  const points = new THREE.Points(geo, new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uPixel: { value: dpr } },
    vertexShader: /* glsl */ `
      attribute float aAge;
      uniform float uPixel;
      varying float vA;
      void main() {
        vA = aAge;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = (0.6 + 2.0 * aAge) * uPixel;
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float;
      varying float vA;
      void main() {
        float a = vA * vA * 0.55;
        gl_FragColor = vec4(vec3(0.36, 0.74, 1.0) * a, a);
      }
    `,
  }));
  points.frustumCulled = false;
  parent.add(points);

  const heads = new Int32Array(ships);
  const fill = new Int32Array(ships);

  return {
    object: points,
    /* Called at a fixed cadence rather than every frame: a trail sampled
       per frame is denser on a fast machine than a slow one, which makes
       the exhaust look like a framerate readout. */
    push(slot, p) {
      const h = heads[slot];
      const i = slot * perShip + h;
      pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
      heads[slot] = (h + 1) % perShip;
      if (fill[slot] < perShip) fill[slot]++;
      geo.attributes.position.needsUpdate = true;
    },
    clear(slot) {
      fill[slot] = 0;
      for (let k = 0; k < perShip; k++) age[slot * perShip + k] = 0;
      geo.attributes.aAge.needsUpdate = true;
    },
    /* Age is recomputed from the head so the newest sample is brightest,
       which is what makes the plume look like it is coming out of the
       engine rather than going into it. */
    restamp(slot, strength) {
      const h = heads[slot];
      for (let k = 0; k < perShip; k++) {
        const idx = (h - 1 - k + perShip * 2) % perShip;
        age[slot * perShip + idx] = k < fill[slot] ? strength * (1 - k / perShip) : 0;
      }
      geo.attributes.aAge.needsUpdate = true;
    },
  };
}

/* ---------------------------------------------------------------- *
 *  Wreckage.
 *
 *  Shards as raw line triangles written straight into one buffer, so a
 *  dozen tumbling pieces stay a single draw call. Each shard carries its
 *  own spin, and the whole set fades as it disperses.
 * ---------------------------------------------------------------- */
export function makeDebris(parent, count) {
  const SEGS = 3;                       // a triangle, drawn as three segments
  const verts = count * SEGS * 2;
  const pos = new Float32Array(verts * 3);
  const alpha = new Float32Array(verts);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));

  const seg = new THREE.LineSegments(geo, new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aAlpha;
      varying float vA;
      void main() {
        vA = aAlpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float;
      varying float vA;
      void main() { gl_FragColor = vec4(vec3(0.50, 0.78, 0.98) * vA, vA); }
    `,
  }));
  seg.frustumCulled = false;
  parent.add(seg);

  const pool = [];
  for (let i = 0; i < count; i++) {
    pool.push({
      life: 0, ttl: 1, size: 0.02,
      pos: new THREE.Vector3(), vel: new THREE.Vector3(),
      spin: new THREE.Vector3(), rot: new THREE.Euler(),
      quat: new THREE.Quaternion(),
    });
  }
  const local = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const world = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

  return {
    object: seg,
    scatter(at, n, speed, size) {
      let made = 0;
      for (const d of pool) {
        if (d.life > 0) continue;
        d.pos.copy(at);
        d.vel.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
          .normalize().multiplyScalar(speed * (0.4 + Math.random()));
        d.spin.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(7);
        d.rot.set(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28);
        d.size = size * (0.5 + Math.random());
        d.life = d.ttl = 2.4 + Math.random() * 2.6;
        if (++made >= n) break;
      }
    },
    update(dt) {
      let v = 0;
      for (const d of pool) {
        if (d.life <= 0) {
          for (let k = 0; k < SEGS * 2; k++) { alpha[v] = 0; pos[v * 3] = 0; pos[v * 3 + 1] = 0; pos[v * 3 + 2] = 0; v++; }
          continue;
        }
        d.life -= dt;
        d.pos.addScaledVector(d.vel, dt);
        d.vel.multiplyScalar(Math.exp(-0.35 * dt));
        d.rot.x += d.spin.x * dt; d.rot.y += d.spin.y * dt; d.rot.z += d.spin.z * dt;
        d.quat.setFromEuler(d.rot);

        local[0].set(d.size, 0, 0);
        local[1].set(-d.size * 0.5, d.size * 0.72, 0);
        local[2].set(-d.size * 0.4, -d.size * 0.5, d.size * 0.5);
        for (let k = 0; k < 3; k++) world[k].copy(local[k]).applyQuaternion(d.quat).add(d.pos);

        const t = d.life / d.ttl;
        const a = Math.min(1, t * 2.2) * 0.8;
        for (let k = 0; k < 3; k++) {
          const p0 = world[k], p1 = world[(k + 1) % 3];
          pos[v * 3] = p0.x; pos[v * 3 + 1] = p0.y; pos[v * 3 + 2] = p0.z; alpha[v] = a; v++;
          pos[v * 3] = p1.x; pos[v * 3 + 1] = p1.y; pos[v * 3 + 2] = p1.z; alpha[v] = a; v++;
        }
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aAlpha.needsUpdate = true;
    },
  };
}

/* ---------------------------------------------------------------- *
 *  The shockwave.
 *
 *  A ring travelling outward from the point the beam struck. Drawn on a
 *  shell just outside the surface and cut out in the fragment shader by
 *  the angle from the impact axis, because a flat ring laid on a sphere
 *  at this scale is visibly flat the moment it grows past a few degrees,
 *  and the impact is deliberately placed near the limb where that shows
 *  most. Depth against the body hides the half of the shell facing away.
 * ---------------------------------------------------------------- */
export function makeShock(parent, R) {
  const uHit = { value: new THREE.Vector3(0, 1, 0) };
  const uAngle = { value: 0 };
  const uFade = { value: 0 };

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.004, 72, 48),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uHit, uAngle, uFade },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;
        uniform vec3 uHit;
        uniform float uAngle;
        uniform float uFade;
        varying vec3 vDir;
        void main() {
          float ang = acos(clamp(dot(normalize(vDir), uHit), -1.0, 1.0));
          float d = abs(ang - uAngle);
          /* Two rings: a bright crest and a slower one behind it, which is
             what stops the wave reading as a single expanding circle. */
          float crest = exp(-d * 46.0);
          float wake = exp(-abs(ang - uAngle * 0.62) * 26.0) * 0.35;
          float scorch = smoothstep(uAngle * 0.9, 0.0, ang) * 0.22;
          float a = (crest + wake + scorch) * uFade;
          vec3 col = mix(vec3(0.30, 0.78, 1.00), vec3(0.88, 0.99, 1.00), crest);
          gl_FragColor = vec4(col * a, a);
        }
      `,
    })
  );
  mesh.visible = false;
  parent.add(mesh);

  return {
    object: mesh,
    strike(dirLocal) { uHit.value.copy(dirLocal).normalize(); uAngle.value = 0; uFade.value = 1; mesh.visible = true; },
    update(dt) {
      if (!mesh.visible) return;
      uAngle.value += dt * 0.62;
      uFade.value -= dt * 0.52;
      if (uFade.value <= 0) { uFade.value = 0; mesh.visible = false; }
    },
  };
}

/* ---------------------------------------------------------------- *
 *  A debris belt.
 *
 *  Static geometry on a slowly turning node. It costs one draw call and
 *  it is the cheapest thing on this page that makes the sky look
 *  inhabited rather than empty.
 * ---------------------------------------------------------------- */
export function makeBelt(parent, { count, radius, spread, tilt, dpr, rand }) {
  const pos = new Float32Array(count * 3);
  const siz = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const r = radius + (rand() - 0.5) * spread;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = (rand() - 0.5) * spread * 0.35;
    pos[i * 3 + 2] = Math.sin(a) * r;
    siz[i] = 0.7 + rand() * 2.1;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(siz, 1));

  const node = new THREE.Group();
  node.rotation.x = tilt;
  const points = new THREE.Points(geo, new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uPixel: { value: dpr } },
    vertexShader: /* glsl */ `
      attribute float aSize;
      uniform float uPixel;
      varying float vS;
      void main() {
        vS = aSize;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPixel;
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float;
      varying float vS;
      void main() {
        float a = 0.16 + vS * 0.085;
        gl_FragColor = vec4(vec3(0.46, 0.62, 0.80) * a, a);
      }
    `,
  }));
  node.add(points);
  parent.add(node);
  return { object: node, update(dt) { node.rotation.y += dt * 0.014; } };
}
