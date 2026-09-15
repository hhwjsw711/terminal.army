/* The fleet: how it flies and who it shoots.
 *
 * Nothing here rides a circle. A ship carries a position, a velocity and a
 * turn rate, and every frame it is handed a direction it would like to be
 * going; it rotates its heading toward that direction as fast as it is
 * allowed to, banks by however much it had to turn, and integrates. What
 * comes out is acceleration, overshoot and a held heading, which is the
 * whole difference between a fleet and a mobile.
 *
 * The one thing the flight model is not free to do is leave the picture.
 * The globe sits mostly below the frame and the copy sits above it, so the
 * band of sky the visitor can actually see is thin, and a ship that flies a
 * physically honest orbit spends most of it somewhere nobody is looking.
 * Containment is therefore part of steering rather than a correction after
 * it: the desired heading is bent back toward the frame before the turn
 * limit is applied, so a ship never holds a heading it is not allowed to
 * hold and never snaps.
 */
import * as THREE from "../vendor/three.module.min.js";
import * as Hulls from "./hulls.js";
import { makeSparks, makeBolts, makeTrails, makeDebris, makeShock, makeBelt } from "./fx.js";
import { heightAt, SEA_LEVEL } from "./planet.js";

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const ZAXIS = new THREE.Vector3(0, 0, 1);

const _f = new THREE.Vector3();
const _r = new THREE.Vector3();
const _u = new THREE.Vector3();
const _w = new THREE.Vector3();
const _p = new THREE.Vector3();
const _q = new THREE.Vector3();
const _prev = new THREE.Vector3();
const _pred = new THREE.Vector3();
/* Firing happens in the middle of steering, so it gets scratch of its own.
   Reusing the steering vectors here silently overwrote the heading a
   fighter had just computed, and the ship flinched sideways on every shot. */
const _g1 = new THREE.Vector3();
const _g2 = new THREE.Vector3();
const _g3 = new THREE.Vector3();
const _g4 = new THREE.Vector3();
const _aim = new THREE.Vector3();
const _mat = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _roll = new THREE.Quaternion();

const BOLT_SPEED = 3.1;

export function createFleet({ parent, R, narrow, dpr, rand, uSun }) {
  const pal = Hulls.makePalette(uSun);
  const group = new THREE.Group();
  parent.add(group);

  /* The visible band, in the fleet's own frame. hero.js rewrites these on
     every layout because the globe is parked by frame fraction, so the sky
     above its limb changes shape with the viewport. */
  const frame = {
    rLo: R * 1.10, rHi: R * 1.56,
    yLo: R * 0.70, yHi: R * 1.48,
    xHalf: R * 1.30, zHalf: R * 0.80, xView: R * 1.10,
  };

  const S = narrow ? 0.76 : 1;           // everything scales off the frame width
  const sparks = makeSparks(group, narrow ? 120 : 240, dpr);
  const bolts = makeBolts(group, narrow ? 16 : 34);
  const debris = makeDebris(group, narrow ? 10 : 20);
  const shock = makeShock(group, R);

  const ships = [];
  const wings = [];

  /* ---------------------------------------------------------------- *
   *  Construction
   * ---------------------------------------------------------------- */

  function edgeFor(team, kind) {
    const base = kind === "freighter" ? pal.civil : (team === 0 ? pal.friend : pal.hostile);
    /* Cloned per ship so a hit can flash one hull and a wreck can dim one
       hull. A shared material would flash the whole side at once. */
    return base.clone();
  }

  function addShip(kind, team) {
    const edge = edgeFor(team, kind);
    const len = kind === "fighter" ? R * 0.076 * S : R * 0.132 * S;
    const obj = kind === "fighter"
      ? Hulls.interceptor(len, pal, edge)
      : Hulls.freighter(len, pal, edge);
    group.add(obj);

    const s = {
      kind, team, obj, edge, len,
      pos: new THREE.Vector3(), vel: new THREE.Vector3(0, 0, 1),
      speed: 0.2, targetSpeed: 0.2,
      maxSpeed: kind === "fighter" ? 0.78 : 0.26,
      /* A freighter turns slowly, but not as slowly as a real one would.
         At three quarters of a radian a second it needs four seconds to come
         about, and four seconds of a wrong heading is most of the way across
         the frame: it would spend a third of every lane recovering from the
         last correction, in the part of the sky the headline is in. */
      turn: kind === "fighter" ? 2.5 : 1.45,
      accel: kind === "fighter" ? 1.5 : 0.55,
      bank: 0, bankTo: 0,
      hp: kind === "fighter" ? 3 : 9,
      maxHp: kind === "fighter" ? 3 : 9,
      alive: true, hitR: kind === "fighter" ? len * 0.55 : len * 0.42,
      respawn: 0, flash: 0,
      slot: ships.length, phase: rand() * 6.283,
      gun: { cool: rand() * 2, burst: 0 },
      target: null, evade: 0,
      wing: null, seat: 0,
      lane: null,
      /* Freighters keep to the lower sky. They are the biggest silhouettes
         out there and the slowest to turn, so the same ceiling that a
         fighter grazes for half a second a freighter parks across, right
         through the headline. */
      yTrim: kind === "freighter" ? 0.24 : 0,
      /* Where the ship has been told to go, when that is higher than its
         own ceiling. A ceiling below the destination is not a ceiling, it
         is a tug of war: the lane pulls the freighter up toward the station
         and containment pushes it down, and it flies the whole leg wedged
         between the two, which is exactly where the copy is. */
      yGoal: 0,
    };
    ships.push(s);
    return s;
  }

  /* ---- the battle station ----
     Built first because it is the anchor: the freight lanes end at it and
     the friendly squadrons launch from it. */
  const stationR = R * 0.125 * (narrow ? 0.62 : 1);
  const stn = Hulls.station(stationR, pal);
  group.add(stn.group);
  const stationPos = new THREE.Vector3();
  const stationSeed = rand() * 100;

  /* ---- the far contact ----
     Crosses behind the world, so it goes in at the limb and comes out the
     other side. Nothing shoots at it and it shoots at nothing. */
  let capital = null;
  if (!narrow) {
    capital = {
      obj: Hulls.capital(R * 0.46, pal),
      x: -3.4, y: R * 0.76, z: -R * 0.70, dir: 1, wait: 0,
    };
    group.add(capital.obj);
    capital.obj.rotation.y = Math.PI / 2;
  }

  /* A ring of rubble, steeply inclined on purpose. A belt lying near the
     equatorial plane is a belt lying below the frame with the rest of the
     globe; tipped up toward the camera it crosses the visible sky on both
     sides of the limb instead. */
  const belt = narrow ? null : makeBelt(group, {
    count: 280, radius: R * 1.92, spread: R * 0.40, tilt: 1.16, dpr, rand,
  });
  if (belt) belt.object.rotation.z = -0.24;

  /* ---- fighters, in wings ----
     Two or three to a wing. A wing is the unit that decides to fight; the
     ships inside it only decide who to shoot at. */
  function addWing(team, size) {
    const w = {
      team, members: [], mode: "patrol", timer: 3 + rand() * 5,
      waypoint: new THREE.Vector3(), enemy: null,
    };
    for (let i = 0; i < size; i++) {
      const s = addShip("fighter", team);
      s.wing = w;
      s.seat = i;
      w.members.push(s);
    }
    wings.push(w);
    pickWaypoint(w);
    return w;
  }

  const WINGS = narrow ? [[0, 2], [1, 2]] : [[0, 3], [0, 2], [1, 2], [1, 2]];
  for (const [team, size] of WINGS) addWing(team, size);

  /* ---- freighters ----
     They run the lane the fighting is about. */
  const FREIGHTERS = narrow ? 2 : 3;
  for (let i = 0; i < FREIGHTERS; i++) {
    const s = addShip("freighter", 0);
    s.lane = { phase: "outbound", hold: 0, port: new THREE.Vector3(), fade: 1 };
    newPort(s);
    /* Staggered around the lane at boot so they are not a convoy of three
       nose to tail on first paint. */
    s.pos.copy(s.lane.port).multiplyScalar(R * 1.16);
    s.pos.x += (i - 1) * 0.55;
    s.pos.y = Math.max(s.pos.y, frame.yLo + 0.1);
    s.vel.set(0.4, 0.05, 0.3).normalize();
    s.lane.phase = ["outbound", "berth", "descend"][i % 3];
    s.lane.hold = 3 + i * 3;
  }

  const trails = makeTrails(group, ships.length, narrow ? 9 : 14, dpr);

  /* Everything gets a plausible starting pose, because reduced motion
     renders exactly one frame of this and it has to be a composed one. */
  seed();

  /* ---------------------------------------------------------------- *
   *  Flight
   * ---------------------------------------------------------------- */

  /* Containment is evaluated twice: once where the ship is and once where
     it will be a turn from now.

     The prediction alone is not enough, and the way it fails is worth
     naming. A ship steered only on its predicted position settles exactly
     where the prediction sits on the boundary, which is a whole turn's
     travel outside it: a freighter takes four seconds to come about and
     covers a unit doing it, so it flies the entire leg a unit above the
     ceiling, descending the whole way and never arriving. That put three
     cargo ships permanently across the headline.

     The present position alone is not enough either, and it fails the
     other way: the push only starts once the line is crossed, and by then
     the ship needs a third of the frame to turn around in.

     Both, and the ship turns early and still ends up inside.

     Returns how far out of bounds it is, which the caller spends on the
     throttle: a ship correcting hard should not also be at full power
     heading the wrong way. */
  function contain(s, want) {
    _pred.copy(s.pos).addScaledVector(s.vel, Math.PI / s.turn);
    /* The present is weighted above the forecast, so a ship that is
       genuinely outside is not talked out of coming back by a prediction
       that says it will be fine. */
    return bend(s, want, s.pos, 1.3) + bend(s, want, _pred, 1.0);
  }

  function bend(s, want, p, k) {
    let over = 0;

    const d = Math.max(p.length(), 1e-4);
    if (d < frame.rLo) {
      over += frame.rLo - d;
      want.addScaledVector(p, (frame.rLo - d) * 3.4 * k / d);
    } else if (d > frame.rHi) {
      over += d - frame.rHi;
      want.addScaledVector(p, -(d - frame.rHi) * 3.4 * k / d);
    }

    const yHi = Math.max(frame.yHi - s.yTrim, s.yGoal);
    if (p.y < frame.yLo) {
      over += frame.yLo - p.y;
      want.y += (frame.yLo - p.y) * 4.5 * k;
    } else if (p.y > yHi) {
      over += p.y - yHi;
      want.y -= (p.y - yHi) * 5.2 * k;
    }

    if (p.x < -frame.xHalf) want.x += (-frame.xHalf - p.x) * 2.8 * k;
    else if (p.x > frame.xHalf) want.x -= (p.x - frame.xHalf) * 2.8 * k;

    if (Math.abs(p.z) > frame.zHalf) {
      want.z -= Math.sign(p.z) * (Math.abs(p.z) - frame.zHalf) * 2.8 * k;
    }
    return over;
  }

  function fly(s, want, dt) {
    const over = contain(s, want);
    if (over > 0.05) s.targetSpeed /= 1 + over * 1.5;
    if (want.lengthSq() < 1e-9) want.copy(s.vel);
    want.normalize();

    _f.copy(s.vel);
    if (_f.lengthSq() < 1e-9) _f.copy(want); else _f.normalize();
    _prev.copy(_f);

    const ang = Math.acos(Math.max(-1, Math.min(1, _f.dot(want))));
    if (ang > 1e-4) {
      _f.lerp(want, Math.min(1, (s.turn * dt) / ang)).normalize();
    }

    /* Bank out of how much the nose actually swung about the ship's own up,
       not out of the heading it wanted: a fighter pinned against the top of
       the frame is turning hard and should look like it. */
    _r.crossVectors(_prev, _f);
    const yaw = _r.dot(WORLD_UP) / Math.max(dt, 1e-4);
    s.bankTo = Math.max(-1.15, Math.min(1.15, -yaw * 0.62));
    s.bank += (s.bankTo - s.bank) * Math.min(1, dt * 5.5);

    s.speed += (s.targetSpeed - s.speed) * Math.min(1, dt * s.accel);
    s.vel.copy(_f).multiplyScalar(s.speed);
    s.pos.addScaledVector(s.vel, dt);

    /* Last resort. Steering is a suggestion and a hard enough turn into the
       planet can still cross the surface for a frame; a ship inside the
       globe pops out of the far side of it and reads as a glitch. */
    const d = s.pos.length();
    if (d < R * 1.045) s.pos.multiplyScalar((R * 1.045) / d);

    orient(s);
  }

  function orient(s) {
    _f.copy(s.vel);
    if (_f.lengthSq() < 1e-9) _f.set(0, 0, 1); else _f.normalize();
    _r.crossVectors(WORLD_UP, _f);
    if (_r.lengthSq() < 1e-8) _r.set(1, 0, 0);
    _r.normalize();
    _u.crossVectors(_f, _r);
    _mat.makeBasis(_r, _u, _f);
    _quat.setFromRotationMatrix(_mat);
    _roll.setFromAxisAngle(ZAXIS, s.bank);
    s.obj.quaternion.copy(_quat).multiply(_roll);
    s.obj.position.copy(s.pos);
  }

  /* ---------------------------------------------------------------- *
   *  Wings
   * ---------------------------------------------------------------- */

  function pickWaypoint(w) {
    const a = rand() * Math.PI * 2;
    const rr = frame.rLo + rand() * (frame.rHi - frame.rLo);
    const y = frame.yLo + rand() * (frame.yHi - frame.yLo);
    const flat = Math.sqrt(Math.max(0.04, rr * rr - y * y));
    w.waypoint.set(
      Math.cos(a) * flat * 0.92,
      y,
      Math.sin(a) * flat * 0.55   // shallower in z: the camera is orthographic
    );
    w.waypoint.x = Math.max(-frame.xHalf, Math.min(frame.xHalf, w.waypoint.x));
  }

  /* The leader is simply the first member still flying, so a wing that
     loses its lead promotes rather than losing its formation. */
  function leaderOf(w) {
    for (const m of w.members) if (m.alive) return m;
    return null;
  }

  function updateWing(w, dt) {
    w.timer -= dt;
    if (w.mode === "patrol") {
      const lead = leaderOf(w);
      if (lead && lead.pos.distanceTo(w.waypoint) < 0.34) pickWaypoint(w);
      if (w.timer <= 0) {
        /* Look for someone to fight. A wing commits to another wing rather
           than to a ship, which is what makes the exchange read as two
           formations meeting instead of six duels. */
        const lead2 = leaderOf(w);
        let best = null, bestD = 3.0;
        if (lead2) {
          for (const o of wings) {
            if (o.team === w.team) continue;
            const ol = leaderOf(o);
            if (!ol) continue;
            const d = ol.pos.distanceTo(lead2.pos);
            if (d < bestD) { bestD = d; best = o; }
          }
        }
        if (best) {
          w.enemy = best;
          w.mode = "attack";
          w.timer = 7 + rand() * 6;
        } else {
          pickWaypoint(w);
          w.timer = 3 + rand() * 4;
        }
      }
    } else if (w.mode === "attack") {
      if (!w.enemy || !leaderOf(w.enemy) || w.timer <= 0) {
        w.mode = "break";
        w.timer = 2.2 + rand() * 1.8;
        for (const m of w.members) m.evade = w.timer;
      }
    } else if (w.mode === "break") {
      if (w.timer <= 0) {
        w.mode = "patrol";
        w.enemy = null;
        w.timer = 4 + rand() * 5;
        pickWaypoint(w);
      }
    }
  }

  /* Formation slots, in the leader's frame. Wide and slightly low, so a
     turning wing fans rather than stacks. */
  const SLOTS = [
    [0, 0, 0],
    [-0.9, -0.16, -0.85],
    [0.95, -0.10, -1.05],
  ];

  function steerFighter(s, dt, t) {
    const w = s.wing;
    _w.set(0, 0, 0);

    if (s.evade > 0) {
      /* Breaking off: away from whatever it was pointed at, and up, which
         reads as a climb out rather than a retreat. */
      s.evade -= dt;
      if (s.target) _w.copy(s.pos).sub(s.target.pos).normalize();
      else _w.copy(s.vel).normalize();
      _w.y += 0.55;
      _w.x += Math.sin(t * 1.3 + s.phase) * 0.5;
      s.targetSpeed = s.maxSpeed;
      fly(s, _w, dt);
      return;
    }

    if (w.mode === "attack") {
      if (!s.target || !s.target.alive) s.target = pickTarget(s);
      const t2 = s.target;
      if (t2) {
        const dist = s.pos.distanceTo(t2.pos);
        /* Lead the shot, not the ship: aim at where the target will be when
           a bolt would get there. A fighter that flies at where its enemy
           is never closes. */
        _q.copy(t2.vel).multiplyScalar(Math.min(0.9, dist / BOLT_SPEED));
        _p.copy(t2.pos).add(_q);
        _w.copy(_p).sub(s.pos);
        const to = _w.length();
        _w.normalize();

        /* A weave, so two fighters on the same target do not converge into
           one silhouette. */
        _r.crossVectors(WORLD_UP, _w).normalize();
        _w.addScaledVector(_r, Math.sin(t * 1.9 + s.phase) * 0.22);

        s.targetSpeed = s.maxSpeed * (to > 0.8 ? 1 : 0.82);

        /* The firing solution is against the real bearing to the target, not
           against the weaved heading the ship is flying. Tested against the
           heading, a fighter fires whenever it is on its own weave, and the
           bolt leaves at up to twenty degrees off the nose. */
        _f.copy(s.vel).normalize();
        _g1.copy(t2.pos).sub(s.pos).normalize();
        if (_f.dot(_g1) > 0.985 && to < 1.2 && s.gun.cool <= 0) shoot(s, t2, to);

        if (to < 0.30) { s.evade = 1.4 + rand() * 1.0; }
        fly(s, _w, dt);
        return;
      }
    }

    /* Patrol. The lead flies the waypoint; the rest hold a slot behind it,
       matching speed off how far ahead or behind the slot they are. */
    const lead = leaderOf(w);
    if (lead === s || !lead) {
      _w.copy(w.waypoint).sub(s.pos);
      _w.y += Math.sin(t * 0.6 + s.phase) * 0.12;
      s.targetSpeed = s.maxSpeed * 0.62;
    } else {
      const slot = SLOTS[Math.min(s.seat, SLOTS.length - 1)];
      _f.copy(lead.vel).normalize();
      _r.crossVectors(WORLD_UP, _f).normalize();
      _u.crossVectors(_f, _r);
      _p.copy(lead.pos)
        .addScaledVector(_r, slot[0] * lead.len * 2.4)
        .addScaledVector(_u, slot[1] * lead.len * 2.4)
        .addScaledVector(_f, slot[2] * lead.len * 2.4);
      _w.copy(_p).sub(s.pos);
      const gap = _w.length();
      _w.addScaledVector(_f, 0.45);
      s.targetSpeed = Math.max(0.12, lead.speed + Math.max(-0.2, Math.min(0.34, (gap - 0.05) * 1.6)));
    }
    fly(s, _w, dt);
  }

  function pickTarget(s) {
    const enemy = s.wing.enemy;
    let best = null, bestD = Infinity;
    const pool = enemy ? enemy.members : ships;
    for (const o of pool) {
      if (!o.alive || o.team === s.team) continue;
      const d = o.pos.distanceToSquared(s.pos);
      if (d < bestD) { bestD = d; best = o; }
    }
    /* Hostiles will take a freighter if one is closer than the escort. That
       is the whole reason the freighters are worth escorting. */
    if (s.team === 1) {
      for (const o of ships) {
        if (!o.alive || o.kind !== "freighter") continue;
        const d = o.pos.distanceToSquared(s.pos) * 1.8;
        if (d < bestD) { bestD = d; best = o; }
      }
    }
    return best;
  }

  function shoot(s, target, dist) {
    s.gun.burst = s.gun.burst > 0 ? s.gun.burst - 1 : 2;
    s.gun.cool = s.gun.burst > 0 ? 0.11 : 1.6 + rand() * 2.4;

    _g1.copy(s.vel).normalize();
    /* Aim error grows with range and with how fast the target is crossing,
       which is what makes a miss look like a miss rather than a dice roll.
       Most shots should miss; the ones that land are the event. */
    const cross = _g2.copy(target.vel).projectOnPlane(_g1).length();
    const err = 0.012 + dist * 0.030 + cross * 0.075;
    _g3.copy(target.pos).sub(s.pos).normalize();
    _g3.x += (rand() - 0.5) * err;
    _g3.y += (rand() - 0.5) * err;
    _g3.z += (rand() - 0.5) * err;
    _g3.normalize();

    /* Leaves from the wingtips, alternating, so the fire has a rhythm. */
    _g2.crossVectors(WORLD_UP, _g1).normalize();
    _g4.copy(s.pos).addScaledVector(_g2, (s.gun.burst % 2 ? 1 : -1) * s.len * 0.42)
      .addScaledVector(_g1, s.len * 0.45);

    bolts.fire(_g4, _g3, {
      life: 0.62, speed: BOLT_SPEED, len: s.len * 0.9,
      warm: s.team === 0 ? 0.55 : 0.0,
      target, shooter: s, damage: 1,
    });
    sparks.emit(_g4, _g1, 0.12, 0.10, 7, s.team === 0 ? 0.7 : 0.2);
  }

  function onHit(b) {
    const t = b.target;
    sparks.burst(b.pos, 4, 0.32, 0.30, 8, 0.65);
    t.hp -= b.damage;
    t.flash = 0.22;
    if (t.hp <= 0) kill(t, b.dir);
  }

  function kill(s, dir) {
    s.alive = false;
    s.obj.visible = false;
    s.respawn = 5 + rand() * 9;
    s.target = null;
    trails.clear(s.slot);
    sparks.burst(s.pos, s.kind === "fighter" ? 16 : 26, 0.55, 0.7, 16, 0.95);
    debris.scatter(s.pos, s.kind === "fighter" ? 4 : 7, 0.30, s.len * 0.30);
    /* A shove along the killing shot, so the wreck carries the momentum of
       whatever ended it. */
    if (dir) sparks.emit(s.pos, dir, 0.5, 0.5, 26, 1.0);
    for (const o of ships) if (o.target === s) o.target = null;
  }

  function revive(s) {
    s.alive = true;
    s.hp = s.maxHp;
    s.obj.visible = true;
    s.flash = 0;
    s.evade = 0;
    if (s.kind === "freighter") {
      newPort(s);
      s.lane.phase = "outbound";
      s.lane.fade = 1;
      s.pos.copy(s.lane.port).multiplyScalar(R * 1.14);
      s.obj.scale.setScalar(1);
    } else if (s.team === 0) {
      /* Friendly squadrons launch from the station, which is the one place
         on this page where a thing appears for a reason. */
      s.pos.copy(stationPos);
      s.pos.x += (rand() - 0.5) * stationR;
      s.pos.y += (rand() - 0.5) * stationR;
      s.pos.z += stationR * 1.2;
      sparks.burst(s.pos, 8, 0.4, 0.4, 11, 0.8);
    } else {
      /* Hostiles come in from off frame. */
      const side = rand() < 0.5 ? -1 : 1;
      const y = frame.yLo + rand() * (frame.yHi - frame.yLo);
      const z = (rand() - 0.5) * frame.zHalf;
      /* On the arena's own shell rather than at a corner of its bounding
         box, or the arrival spends its first seconds hauling itself back
         inside a limit it was placed outside of. */
      const xm = Math.sqrt(Math.max(0.09, frame.rHi * frame.rHi - y * y - z * z));
      s.pos.set(side * Math.min(frame.xHalf + 0.2, xm), y, z);
    }
    s.speed = s.maxSpeed * 0.5;
    /* Away from the surface and across it, never toward it: a ship that
       enters pointed at the planet spends its first two seconds hauling out
       of a dive it had no reason to be in. */
    _g1.copy(s.pos).normalize();
    _g2.crossVectors(WORLD_UP, _g1);
    if (_g2.lengthSq() < 1e-8) _g2.set(1, 0, 0);
    _g2.normalize().multiplyScalar(rand() < 0.5 ? -1 : 1);
    s.vel.copy(_g2).addScaledVector(_g1, 0.35).setLength(s.speed);
    s.bank = 0;
    orient(s);
  }

  /* ---------------------------------------------------------------- *
   *  Freight
   * ---------------------------------------------------------------- */

  function newPort(s) {
    /* A port is over land, on the half of the world facing the camera, and
       high enough up the limb to be above the frame's bottom edge. Picking
       it by rejection is fine: this runs a handful of times a minute. */
    for (let i = 0; i < 40; i++) {
      const uy = 0.72 + rand() * 0.16;
      const flat = Math.sqrt(Math.max(0, 1 - uy * uy));
      const a = (rand() - 0.5) * 1.7;
      const p = _p.set(flat * Math.sin(a), uy, flat * Math.cos(a));
      if (i > 30 || heightAt(p.x, p.y, p.z) > SEA_LEVEL) {
        s.lane.port.copy(p);
        return;
      }
    }
    s.lane.port.set(0, 1, 0);
  }

  function steerFreighter(s, dt) {
    const L = s.lane;
    _w.set(0, 0, 0);
    const toStation = _q.copy(stationPos).sub(s.pos);
    const dStation = toStation.length();
    const inbound = L.phase === "outbound" || L.phase === "approach" || L.phase === "berth";
    s.yGoal = inbound ? stationPos.y + s.len * 0.5 : 0;

    if (L.phase === "outbound") {
      _w.copy(toStation).normalize();
      s.targetSpeed = s.maxSpeed;
      if (dStation < 0.85) L.phase = "approach";
    } else if (L.phase === "approach") {
      _w.copy(toStation).normalize();
      /* Decelerate on a curve rather than a switch, so the arrival has a
         shape. Everything else on this page arrives at a constant rate. */
      s.targetSpeed = Math.max(0.05, s.maxSpeed * (dStation / 0.85) * 0.9);
      if (dStation < stationR * 2.0) {
        L.phase = "berth";
        L.hold = 5 + rand() * 7;
      }
    } else if (L.phase === "berth") {
      L.hold -= dt;
      /* Holding station: a slow drift around the docking side rather than a
         freeze, so it still reads as a ship under power. */
      _r.crossVectors(WORLD_UP, toStation).normalize();
      _w.copy(_r).addScaledVector(toStation.normalize(), 0.25);
      s.targetSpeed = 0.055;
      if (L.hold <= 0) {
        newPort(s);
        L.phase = "depart";
        L.hold = 3.5;
        sparks.burst(s.pos, 5, 0.25, 0.5, 9, 0.5);
      }
    } else if (L.phase === "depart") {
      L.hold -= dt;
      _w.copy(L.port).multiplyScalar(frame.rLo + 0.16).sub(s.pos).normalize();
      s.targetSpeed = s.maxSpeed;
      if (L.hold <= 0) L.phase = "descend";
    } else if (L.phase === "descend") {
      _w.copy(L.port).multiplyScalar(R * 1.02).sub(s.pos).normalize();
      s.targetSpeed = s.maxSpeed * 0.7;
      const alt = s.pos.length();
      /* Into the air, and gone. There is nowhere on this page to draw a
         landing, so the atmosphere takes it. */
      if (alt < R * 1.20) {
        L.fade -= dt * 0.9;
        s.obj.scale.setScalar(Math.max(0.001, L.fade));
        if (L.fade <= 0) {
          newPort(s);
          L.phase = "outbound";
          L.fade = 1;
          s.obj.scale.setScalar(1);
          s.pos.copy(L.port).multiplyScalar(R * 1.16);
          s.vel.copy(s.pos).normalize().multiplyScalar(0.1);
          s.speed = 0.1;
          return;
        }
      }
    }

    if (L.phase !== "descend") {
      L.fade = 1;
      s.obj.scale.setScalar(1);
    }
    fly(s, _w, dt);
  }

  /* ---------------------------------------------------------------- *
   *  The station and its beam
   * ---------------------------------------------------------------- */

  const BEAM = { state: "rest", t: narrow ? 10 : 7, struck: false };

  const beamCore = beamMesh(R * 0.0055, new THREE.Color(0.72, 0.99, 1.0), 1.0);
  const beamHalo = beamMesh(R * 0.022, new THREE.Color(0.20, 0.72, 1.0), 0.5);
  const beamTarget = new THREE.Vector3(0, 1, 0);

  function beamMesh(radius, color, opacity) {
    const g = new THREE.CylinderGeometry(radius, radius * 0.55, 1, 9, 1, true);
    g.translate(0, 0.5, 0); // grows from the base, so scale.y is length
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    }));
    m.userData.peak = opacity;
    m.visible = false;
    group.add(m);
    return m;
  }

  function updateStation(dt, t) {
    /* Two incommensurate periods rather than an orbit. An orbit sized to
       clear the globe carries the anchor of the whole scene off frame for
       minutes at a time; this wanders and never repeats. */
    const k = t * 0.055 + stationSeed;
    /* The station is the only thing here that must never be half off the
       edge: it is the anchor the lanes end at and the beam comes from. So
       its wander is bounded by the frame the visitor sees, not by the
       arena the fighters are allowed to leave. */
    const sway = Math.min(frame.xHalf * 0.72, frame.xView - stationR * 1.5);
    const x = Math.sin(k * 0.79) * sway + Math.sin(k * 0.31) * 0.16 * Math.min(1, sway);

    /* Height is not free either. The globe is wider than a phone's frame, so
       the only sky on one is the strip above the crown; a station parked at
       a fixed height in the band spends its whole life buried in the
       lattice. Riding a fixed clearance over whatever the limb happens to be
       under it keeps it on the sky wherever it has drifted to, and turns its
       wander into something that reads as an orbit. The ceiling is the same
       one the fighters have: above that is the headline. */
    const limb = Math.sqrt(Math.max(0, R * R - x * x));
    const band = frame.yLo + (frame.yHi - frame.yLo) * 0.64 + Math.sin(k * 0.53) * 0.09;
    /* Kept a little under the fighters' ceiling. The freight lanes end
       here, and a berth at the ceiling means every approach overshoots
       above it. */
    const y = Math.min(frame.yHi - stationR * 0.9, Math.max(band, limb + stationR * 0.95));

    stationPos.set(x, y, Math.cos(k * 0.61) * frame.zHalf * 0.55);
    stn.group.position.copy(stationPos);
    stn.group.rotation.y += dt * 0.055;
    stn.group.rotation.z = Math.sin(k * 0.4) * 0.06;
  }

  function updateBeam(dt, t) {
    BEAM.t -= dt;
    const dish = stn.dish;

    if (BEAM.state === "rest") {
      stn.dishRing.material.opacity = 0.28 + 0.06 * Math.sin(t * 1.1);
      stn.prongs.rotation.z += dt * 0.25;
      if (BEAM.t <= 0) {
        BEAM.state = "charge";
        BEAM.t = 3.1;
      }
      return;
    }

    dish.getWorldPosition(_p);
    group.worldToLocal(_p);

    if (BEAM.state === "charge") {
      const k = 1 - BEAM.t / 3.1;
      stn.prongs.rotation.z += dt * (0.25 + k * k * 22);
      stn.dishRing.material.opacity = 0.28 + 0.72 * k;
      /* Charge is drawn as light falling in, not light leaking out: the
         sparks are emitted out at the rim and pulled toward the throat. */
      if (rand() < 0.55) {
        _q.set(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
        _w.copy(_p).addScaledVector(_q, stationR * (0.8 + rand() * 0.9));
        _q.copy(_p).sub(_w).normalize();
        sparks.emit(_w, _q, 0.5 + k * 0.9, 0.4, 5 + k * 9, 0.5);
      }
      if (BEAM.t <= 0) {
        /* Aimed now, not when the charge started. The station drifts, and
           three seconds of drift is enough to turn a clean shot into one
           that clips the globe. */
        aimBeam();
        BEAM.state = "fire";
        BEAM.t = 1.25;
        beamCore.visible = beamHalo.visible = true;
        sparks.burst(_p, 10, 0.5, 0.4, 16, 0.9);
      }
      return;
    }

    if (BEAM.state === "fire") {
      const k = 1 - BEAM.t / 1.25;
      stn.prongs.rotation.z += dt * 16;
      stn.dishRing.material.opacity = 1;

      _w.copy(beamTarget).sub(_p);
      const len = _w.length();
      _w.normalize();
      for (const m of [beamCore, beamHalo]) {
        m.position.copy(_p);
        m.scale.set(1, len, 1);
        m.quaternion.setFromUnitVectors(WORLD_UP, _w);
        /* Snap on, hold, taper: the taper is what sells it as a discharge
           running out rather than a switch being thrown. */
        m.material.opacity = Math.min(1, k / 0.05) * (1 - Math.pow(k, 2.4)) * m.userData.peak;
      }
      /* The strike lands a beat after the beam appears, not with it. */
      if (k > 0.10 && !BEAM.struck) {
        BEAM.struck = true;
        shock.strike(_q.copy(beamTarget).normalize());
        sparks.burst(beamTarget, 22, 0.55, 1.0, 22, 1.0);
      }
      if (BEAM.struck && rand() < 0.7) {
        _q.copy(beamTarget).normalize();
        sparks.emit(beamTarget, _q, 0.45, 0.9, 10, 0.85, 0.8);
      }
      if (BEAM.t <= 0) {
        BEAM.state = "rest";
        BEAM.struck = false;
        BEAM.t = (narrow ? 20 : 15) + rand() * 12;
        beamCore.visible = beamHalo.visible = false;
        beamCore.material.opacity = beamHalo.material.opacity = 0;
      }
    }
  }

  function aimBeam() {
    /* Two constraints, and the second one is not obvious.

       The strike has to land on the sliver of the world the visitor can
       actually see: the frame cuts the globe about seven tenths of its
       radius up from the centre and the crown is the top of that, so
       anything aimed lower lands below the bottom edge of the page and the
       whole event happens off screen.

       And the beam has to reach it without going through the planet. A
       straight line from a station in high orbit to a point on the near
       face crosses the sphere's interior whenever the two are close
       together in angle, and the opaque body then eats the middle of the
       beam: what renders is a bright bar that stops dead at the limb and a
       shockwave a third of a frame away from where it stopped. The segment
       stays outside exactly when dot(target, station) is at most R squared,
       so the shot is always a glancing one across the limb, which is the
       better picture anyway.

       Sampled rather than solved: the station wanders, so the admissible
       set moves with it, and twenty candidates cost nothing once a minute.
       The best of them is taken even if none clears the margin, because a
       slightly clipped beam beats no beam. */
    const limit = R * R * 0.86;
    let bestDot = Infinity;
    for (let i = 0; i < 20; i++) {
      const uy = 0.74 + rand() * 0.20;
      const flat = Math.sqrt(Math.max(0, 1 - uy * uy));
      const a = (rand() * 2 - 1) * 1.35;
      _aim.set(flat * Math.sin(a), uy, flat * Math.cos(a)).multiplyScalar(R * 0.995);
      const d = _aim.dot(stationPos);
      if (d < bestDot) { bestDot = d; beamTarget.copy(_aim); }
      if (d <= limit) break;
    }
  }

  /* ---------------------------------------------------------------- *
   *  The far contact
   * ---------------------------------------------------------------- */

  function updateCapital(dt) {
    if (!capital) return;
    if (capital.wait > 0) { capital.wait -= dt; return; }
    capital.x += dt * 0.055 * capital.dir;
    capital.obj.position.set(capital.x, capital.y, capital.z);
    capital.obj.rotation.y = capital.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    capital.obj.rotation.z = Math.sin(capital.x * 0.4) * 0.02;
    if (Math.abs(capital.x) > 3.4) {
      capital.dir *= -1;
      capital.wait = 25 + rand() * 30;
      capital.y = R * (0.62 + rand() * 0.30);
      capital.z = -R * (0.55 + rand() * 0.35);
    }
  }

  /* ---------------------------------------------------------------- *
   *  Seeding, so the first frame is already a scene
   * ---------------------------------------------------------------- */

  function seed() {
    for (const w of wings) pickWaypoint(w);
    for (const s of ships) {
      if (s.kind === "freighter") continue;
      const w = s.wing;
      s.pos.copy(w.waypoint);
      s.pos.x += (s.seat - 1) * s.len * 2.6;
      s.pos.z += s.seat * s.len * 1.4;
      s.vel.set(rand() - 0.5, (rand() - 0.5) * 0.2, rand() - 0.5).normalize().multiplyScalar(s.maxSpeed * 0.6);
      s.speed = s.maxSpeed * 0.6;
      orient(s);
    }
    updateStation(0, 0);
    for (const s of ships) orient(s);
    if (capital) capital.obj.position.set(capital.x, capital.y, capital.z);
  }

  /* ---------------------------------------------------------------- *
   *  The tick
   * ---------------------------------------------------------------- */

  let trailClock = 0;
  let clock = 0;

  function update(dt) {
    clock += dt;
    const t = clock;

    updateStation(dt, t);
    updateCapital(dt);
    belt?.update(dt);

    for (const w of wings) updateWing(w, dt);

    for (const s of ships) {
      if (!s.alive) {
        s.respawn -= dt;
        if (s.respawn <= 0) revive(s);
        continue;
      }
      s.gun.cool -= dt;
      if (s.flash > 0) s.flash -= dt;

      if (s.kind === "fighter") steerFighter(s, dt, t);
      else steerFreighter(s, dt);

      /* Damage is worn, not reported. A hull down to its last hit flickers
         and sheds sparks, which is the only warning the visitor gets that
         something is about to come apart. */
      const wear = s.hp / s.maxHp;
      const flash = s.flash > 0 ? 1.6 : 0;
      s.edge.opacity = Math.min(1, 0.34 + wear * 0.58 + flash);
      if (wear <= 0.4 && rand() < dt * 6) {
        _q.copy(s.vel).normalize().negate();
        sparks.emit(s.pos, _q, 0.14, 0.55, 6, 0.9, 0.7);
      }
    }

    /* Trails are sampled on a clock of their own. Sampled per frame they
       would be denser on a fast machine than a slow one, which turns the
       exhaust plume into a framerate readout. */
    trailClock += dt;
    if (trailClock > 0.05) {
      trailClock = 0;
      for (const s of ships) {
        if (!s.alive) continue;
        _f.copy(s.vel).normalize();
        _p.copy(s.pos).addScaledVector(_f, -s.len * 0.55);
        trails.push(s.slot, _p);
        trails.restamp(s.slot, Math.min(1, s.speed / s.maxSpeed) * (s.kind === "fighter" ? 1 : 0.7));
      }
    }

    bolts.update(dt, onHit);
    sparks.update(dt);
    debris.update(dt);
    shock.update(dt);
    updateBeam(dt, t);
  }

  return {
    group, frame, ships, wings, station: stn, stationPos, beam: BEAM, belt, capital,
    update,
    /* Handy from the console when tuning the framing. */
    fire() { BEAM.t = 0.01; BEAM.state = "rest"; },
  };
}
