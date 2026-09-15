/* Hulls.
 *
 * Every ship is built the way the planet is built: a dark solid with its
 * own edges drawn over it, so you can see the wireframe of the thing. The
 * shapes are assembled from primitives and then welded into one geometry
 * before the edges are extracted, for two reasons. A ship made of six
 * separate meshes costs twelve draw calls and shows the seams where the
 * parts intersect; welded first, it costs two and the silhouette is the
 * outline of the whole craft rather than of each lump in it.
 *
 * Everything points its nose along local +Z, which is the travel axis the
 * flight model writes into.
 */
import * as THREE from "../vendor/three.module.min.js";

/* Concatenating raw position arrays is all the merge that is needed here,
   and it avoids vendoring BufferGeometryUtils for one function. EdgesGeometry
   welds by rounded position, so an unindexed input is fine: it still finds
   the shared edges between the parts. */
function weld(parts) {
  let total = 0;
  const flat = parts.map((g) => {
    const ng = g.index ? g.toNonIndexed() : g;
    if (ng !== g) g.dispose();
    total += ng.attributes.position.count;
    return ng;
  });
  const out = new Float32Array(total * 3);
  let o = 0;
  for (const g of flat) {
    out.set(g.attributes.position.array, o);
    o += g.attributes.position.count * 3;
    g.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(out, 3));
  /* Flat normals fall out of this for free: the buffer is unindexed, so no
     vertex is shared and every face gets its own. That is the shading a
     low poly hull wants anyway, and without it the fill is a silhouette
     with no facets and the plating on the station reads as decals. */
  merged.computeVertexNormals();
  return merged;
}

function place(geo, { rx = 0, ry = 0, rz = 0, x = 0, y = 0, z = 0, s = 1 } = {}) {
  if (s !== 1) geo.scale(s, s, s);
  if (rx) geo.rotateX(rx);
  if (ry) geo.rotateY(ry);
  if (rz) geo.rotateZ(rz);
  if (x || y || z) geo.translate(x, y, z);
  return geo;
}

/* A flat triangle in the XZ plane, lifted by `dihedral` at the tip. Wings
   are the whole reason a fighter reads as a fighter at forty pixels, and a
   box will not do it. */
function fin(root, mid, tip) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array([
    root[0], root[1], root[2], mid[0], mid[1], mid[2], tip[0], tip[1], tip[2],
    root[0], root[1], root[2], tip[0], tip[1], tip[2], mid[0], mid[1], mid[2],
  ]), 3));
  return g;
}

export function makePalette(uSun) {
  return {
    /* Hulls are lit, barely. The planet's own shading comes from the same
       sun vector, so a ship crossing the terminator turns with the world
       under it rather than staying a flat cutout on top of it. One dot
       product, no lights in the scene, nothing to shadow. */
    hull: new THREE.ShaderMaterial({
      uniforms: { uSun },
      vertexShader: /* glsl */ `
        /* Declared, not just supplied. ShaderMaterial passes the uniform
           object through but GLSL still needs the declaration, and without
           it the program fails to link: the hulls vanish, only their edges
           render, and the console fills with one INVALID_OPERATION per draw
           call per frame. */
        uniform vec3 uSun;
        varying float vLit;
        void main() {
          vLit = dot(normalize(mat3(modelMatrix) * normal), uSun);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;
        varying float vLit;
        void main() {
          float d = smoothstep(-0.35, 0.75, vLit);
          gl_FragColor = vec4(mix(vec3(0.006, 0.011, 0.020), vec3(0.048, 0.080, 0.112), d), 1.0);
        }
      `,
    }),
    /* Two allegiances, both kept in the cold half of the spectrum the rest
       of the page lives in. The hostiles are steel indigo rather than the
       warm colour the genre expects, because one warm accent on this page
       would be the only warm thing on it. */
    friend: new THREE.LineBasicMaterial({
      color: new THREE.Color(0.55, 0.95, 1.00), transparent: true, opacity: 0.95,
    }),
    hostile: new THREE.LineBasicMaterial({
      color: new THREE.Color(0.44, 0.56, 0.98), transparent: true, opacity: 0.92,
    }),
    civil: new THREE.LineBasicMaterial({
      color: new THREE.Color(0.36, 0.68, 0.84), transparent: true, opacity: 0.80,
    }),
    /* The far contact is drawn faint on purpose: an orthographic camera
       gives nothing away for free, so distance has to be spent in value. */
    distant: new THREE.LineBasicMaterial({
      color: new THREE.Color(0.22, 0.36, 0.52), transparent: true, opacity: 0.62,
    }),
  };
}

function shell(geometry, hullMat, edgeMat, angle = 24) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geometry, hullMat));
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, angle), edgeMat));
  return g;
}

/* ---- interceptor ----
   A dart with swept wings, canted engines and a single fin. Length is the
   scale: everything else is a fraction of it. */
export function interceptor(len, pal, edge) {
  const w = len * 0.46;   // half span at the tip
  const parts = [
    // fuselage: a four sided spike, flats up, so the top face catches light
    place(new THREE.CylinderGeometry(len * 0.015, len * 0.10, len * 0.86, 4),
      { rx: -Math.PI / 2, ry: Math.PI / 4, z: -len * 0.06 }),
    // spine, a thin raised block that gives the cockpit somewhere to sit
    place(new THREE.BoxGeometry(len * 0.10, len * 0.07, len * 0.34),
      { y: len * 0.055, z: -len * 0.10 }),
    // wings, swept back and dropped at the tip
    fin([-len * 0.06, 0, len * 0.10], [-w, -len * 0.05, -len * 0.30], [-len * 0.09, 0, -len * 0.40]),
    fin([len * 0.06, 0, len * 0.10], [len * 0.09, 0, -len * 0.40], [w, -len * 0.05, -len * 0.30]),
    // fin
    fin([0, len * 0.07, -len * 0.16], [0, len * 0.30, -len * 0.40], [0, len * 0.07, -len * 0.42]),
    // engines
    place(new THREE.CylinderGeometry(len * 0.055, len * 0.045, len * 0.20, 6),
      { rx: Math.PI / 2, x: -len * 0.11, z: -len * 0.38 }),
    place(new THREE.CylinderGeometry(len * 0.055, len * 0.045, len * 0.20, 6),
      { rx: Math.PI / 2, x: len * 0.11, z: -len * 0.38 }),
  ];
  return shell(weld(parts), pal.hull, edge, 20);
}

/* ---- freighter ----
   A spine with containers slung along it and a bridge up front. Blunt on
   purpose: it is the thing the rest of it is fought over. */
export function freighter(len, pal, edge) {
  const parts = [
    // spine
    place(new THREE.BoxGeometry(len * 0.11, len * 0.11, len * 0.74), { z: -len * 0.06 }),
    // bridge, offset up and forward so the profile is not symmetric
    place(new THREE.BoxGeometry(len * 0.17, len * 0.13, len * 0.20),
      { y: len * 0.09, z: len * 0.30 }),
    place(new THREE.CylinderGeometry(len * 0.03, len * 0.06, len * 0.12, 5),
      { rx: Math.PI / 2, y: len * 0.09, z: len * 0.43 }),
    /* Two containers a side, not six. At the size this ship is actually
       drawn, more of them stopped reading as cargo and started reading as
       a solid block: every extra box is twelve more edges in forty pixels. */
    ...[0, 1].flatMap((i) => [-1, 1].map((s) => place(
      new THREE.BoxGeometry(len * 0.15, len * 0.19, len * 0.28),
      { x: s * len * 0.17, y: -len * 0.02, z: len * (0.13 - i * 0.32) }
    ))),
    // engine block and two bells
    place(new THREE.BoxGeometry(len * 0.24, len * 0.16, len * 0.14), { z: -len * 0.40 }),
    place(new THREE.CylinderGeometry(len * 0.085, len * 0.055, len * 0.14, 7),
      { rx: Math.PI / 2, x: -len * 0.09, z: -len * 0.50 }),
    place(new THREE.CylinderGeometry(len * 0.085, len * 0.055, len * 0.14, 7),
      { rx: Math.PI / 2, x: len * 0.09, z: -len * 0.50 }),
  ];
  return shell(weld(parts), pal.hull, edge || pal.civil, 26);
}

/* ---- the battle station ----
   A sphere with an equatorial trench and a dish sunk into one face. Not a
   replica of anyone's: the shape is the genre's, and the point of it here
   is that the beam has somewhere to come from.

   Returns its moving parts, because the dish has to be seen spinning up
   before the beam arrives or the shot has no anticipation. */
export function station(r, pal) {
  const group = new THREE.Group();

  /* Hull and greebles in one weld. The plates are what stop a sphere at
     this size reading as a bare ball: they give the edge pass something to
     find away from the silhouette. */
  const greebles = [];
  let seed = 4;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 17; i++) {
    /* Fibonacci placement, so the plates never clump the way a uniform
       random scatter on a sphere does. */
    const y = 1 - (i / 16) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const th = i * 2.399963;
    const n = new THREE.Vector3(Math.cos(th) * rad, y, Math.sin(th) * rad);
    if (Math.abs(y) < 0.10) continue; // the trench owns the equator
    const size = r * (0.13 + rnd() * 0.20);
    const g = new THREE.BoxGeometry(size, size * (0.45 + rnd() * 0.9), r * 0.07);
    const m = new THREE.Matrix4().lookAt(n, new THREE.Vector3(), new THREE.Vector3(0, 1, 0));
    g.applyMatrix4(m);
    g.translate(n.x * r * 0.93, n.y * r * 0.93, n.z * r * 0.93);
    greebles.push(g);
  }
  const plates = weld(greebles.map((g) => g.clone()));
  const hull = weld([new THREE.IcosahedronGeometry(r, 2), ...greebles]);
  group.add(new THREE.Mesh(hull, pal.hull));
  group.add(new THREE.LineSegments(new THREE.EdgesGeometry(plates, 30), pal.civil));

  /* The sphere needs its own wireframe. An edge pass over a subdivided
     icosahedron finds nothing: every dihedral on it is under twenty degrees,
     so at any sane threshold the ball comes out with no edges at all and the
     station reads as a handful of plates floating in a void with a band
     through them. A coarse geodesic drawn at every edge gives it back its
     mass, and it is the same countable construction the planet under it is
     made of. */
  group.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(r * 1.004, 1), 1),
    /* Dimmer than the plating it sits under. At the station's full brightness
       a geodesic of eighty faces is the loudest object in the frame, and the
       headline has to be the loudest object in the frame. */
    pal.distant
  ));

  /* The trench: a dark recess with a lit lip above and below it, which is
     what makes it read as cut into the sphere rather than painted on. */
  const trenchDark = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.995, r * 0.995, r * 0.16, 40, 1, true),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.02, 0.035, 0.05), side: THREE.DoubleSide })
  );
  group.add(trenchDark);
  for (const s of [-1, 1]) {
    const lip = new THREE.Mesh(
      new THREE.TorusGeometry(r * 1.0, r * 0.012, 4, 44),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.20, 0.52, 0.66), transparent: true, opacity: 0.85,
      })
    );
    lip.rotation.x = Math.PI / 2;
    lip.position.y = s * r * 0.08;
    group.add(lip);
  }

  /* The dish, as an emplacement standing on the surface rather than a bowl
     cut into it. Sinking it was the obvious reading of the shape and it does
     not survive contact with an opaque sphere: sunk far enough to sit inside
     the hull the whole assembly is hidden by it, and sunk any less the rim
     hoop pokes through the silhouette somewhere else on the sphere and reads
     as a stray arc floating beside the station. Standing proud of the hull,
     every part of it is where it looks like it is. */
  const axis = new THREE.Vector3(0, 0.42, 0.91).normalize();
  const dish = new THREE.Group();
  dish.position.copy(axis).multiplyScalar(r * 0.86);
  dish.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), axis);

  const capGeo = new THREE.SphereGeometry(r * 0.34, 20, 8, 0, Math.PI * 2, 0, Math.PI * 0.46);
  capGeo.rotateX(Math.PI / 2);   // the bowl opens along +Z, which is the beam
  const cap = new THREE.Mesh(capGeo, new THREE.MeshBasicMaterial({
    color: new THREE.Color(0.02, 0.05, 0.07), side: THREE.DoubleSide,
  }));
  dish.add(cap);
  const capWire = new THREE.SphereGeometry(r * 0.34, 10, 4, 0, Math.PI * 2, 0, Math.PI * 0.46);
  capWire.rotateX(Math.PI / 2);
  dish.add(new THREE.LineSegments(new THREE.EdgesGeometry(capWire, 1), pal.civil));

  const dishRing = new THREE.Mesh(
    new THREE.RingGeometry(r * 0.31, r * 0.37, 30),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(0.52, 0.95, 1.00), transparent: true, opacity: 0.4,
      depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    })
  );
  dishRing.position.z = r * 0.15;
  dish.add(dishRing);

  /* Three focusing prongs on their own node: this is the part that spins
     up, and it has to be separate from the dish so the dish can stay put
     while it does. */
  const prongs = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const g = new THREE.CylinderGeometry(r * 0.012, r * 0.024, r * 0.30, 4);
    g.rotateX(Math.PI / 2);   // along the beam
    g.rotateX(-0.34);         // splayed, so the three read as three
    g.rotateZ(a);
    /* Translated last. Rotating a geometry that has already been moved off
       the origin swings it around the origin instead of spinning it in
       place, which put the three prongs in one heap on one side. */
    g.translate(-Math.sin(a) * r * 0.26, Math.cos(a) * r * 0.26, r * 0.13);
    prongs.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 20), pal.friend));
  }
  dish.add(prongs);
  group.add(dish);

  return { group, dish, dishRing, prongs };
}

/* ---- the far contact ----
   A capital ship crossing well behind everything else. It never fights and
   nothing ever reaches it; it is there so the sky has a horizon of its own
   and the near action has something to be near. */
export function capital(len, pal) {
  const w = len * 0.30;
  const parts = [
    // hull, a long flattened wedge, built as an explicit prism
    (() => {
      const v = [
        [0, 0, len * 0.5],                 // bow
        [-w, len * 0.035, -len * 0.5], [w, len * 0.035, -len * 0.5],
        [-w * 0.86, -len * 0.045, -len * 0.5], [w * 0.86, -len * 0.045, -len * 0.5],
      ];
      const tri = (a, b, c) => [...v[a], ...v[b], ...v[c]];
      const arr = new Float32Array([
        ...tri(0, 1, 2), ...tri(0, 4, 3), ...tri(0, 3, 1), ...tri(0, 2, 4),
        ...tri(1, 3, 4), ...tri(1, 4, 2),
      ]);
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
      return g;
    })(),
    // superstructure and tower
    place(new THREE.BoxGeometry(len * 0.16, len * 0.05, len * 0.22), { y: len * 0.05, z: -len * 0.28 }),
    place(new THREE.BoxGeometry(len * 0.09, len * 0.06, len * 0.09), { y: len * 0.10, z: -len * 0.30 }),
    // engines
    ...[-1, 0, 1].map((i) => place(new THREE.CylinderGeometry(len * 0.045, len * 0.038, len * 0.08, 6),
      { rx: Math.PI / 2, x: i * len * 0.13, z: -len * 0.53 })),
  ];
  return shell(weld(parts), pal.hull, pal.distant, 22);
}
