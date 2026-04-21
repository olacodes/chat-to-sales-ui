'use client';

import { useEffect, useRef } from 'react';
import type * as ThreeTypes from 'three';

/**
 * Constellation particle system.
 * - Alpha renderer (transparent) — CSS background shows through in light + dark mode.
 * - Particles: brand green + purple mix, slow drift.
 * - Lines: drawn between particles within a distance threshold, fading by proximity.
 * - Mouse: gentle repulsion within 2-unit radius.
 */
export default function BlogParticleScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<ThreeTypes.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const mouseWorld = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    let cancelled = false;

    async function init() {
      const THREE = await import('three');
      if (cancelled || !mountRef.current) return;

      const W = mount.clientWidth || window.innerWidth;
      const H = mount.clientHeight || window.innerHeight;

      // ── Scene (no background — transparent) ───────────────────────────────
      const scene = new THREE.Scene();

      // ── Camera ─────────────────────────────────────────────────────────────
      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
      camera.position.z = 8;

      // ── Renderer — alpha:true makes canvas transparent ────────────────────
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      mount.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // ── Particles ──────────────────────────────────────────────────────────
      const COUNT = 90;
      const ptPos = new Float32Array(COUNT * 3);
      const ptVel = new Float32Array(COUNT * 3);
      const ptCol = new Float32Array(COUNT * 3);

      const palette = [
        new THREE.Color(0x16a34a), // brand green
        new THREE.Color(0x16a34a),
        new THREE.Color(0x8b5cf6), // purple
        new THREE.Color(0x0ea5e9), // sky blue
        new THREE.Color(0x22c55e), // lighter green
      ];

      for (let i = 0; i < COUNT; i++) {
        ptPos[i * 3 + 0] = (Math.random() - 0.5) * 16;
        ptPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
        ptPos[i * 3 + 2] = (Math.random() - 0.5) * 3;

        // Gentle random drift
        ptVel[i * 3 + 0] = (Math.random() - 0.5) * 0.005;
        ptVel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
        ptVel[i * 3 + 2] = 0;

        const col = palette[Math.floor(Math.random() * palette.length)];
        ptCol[i * 3 + 0] = col.r;
        ptCol[i * 3 + 1] = col.g;
        ptCol[i * 3 + 2] = col.b;
      }

      const ptGeo = new THREE.BufferGeometry();
      ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPos, 3));
      ptGeo.setAttribute('color', new THREE.BufferAttribute(ptCol, 3));

      const ptMat = new THREE.PointsMaterial({
        size: 0.09,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        sizeAttenuation: true,
      });
      scene.add(new THREE.Points(ptGeo, ptMat));

      // ── Lines ──────────────────────────────────────────────────────────────
      const MAX_LINES = COUNT * 6;
      const linePos = new Float32Array(MAX_LINES * 6);
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
      lineGeo.setDrawRange(0, 0);

      const lineSegs = new THREE.LineSegments(
        lineGeo,
        new THREE.LineBasicMaterial({
          color: 0x16a34a,
          transparent: true,
          opacity: 0.12,
        }),
      );
      scene.add(lineSegs);

      const CONNECT_DIST = 3.2;
      const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST;

      // ── Mouse repulsion ────────────────────────────────────────────────────
      const REPULSE_RADIUS = 2.2;
      const REPULSE_RADIUS_SQ = REPULSE_RADIUS * REPULSE_RADIUS;
      const SPEED_CAP = 0.025;

      function onMouseMove(e: MouseEvent) {
        const rect = mount.getBoundingClientRect();
        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        // Approximate world coords to z=0 plane given camera at z=8, fov=60
        const aspect = rect.width / rect.height;
        const halfH = Math.tan((60 * Math.PI) / 360) * 8;
        mouseWorld.current = { x: ndcX * halfH * aspect, y: ndcY * halfH };
      }
      mount.addEventListener('mousemove', onMouseMove);

      // ── Resize ─────────────────────────────────────────────────────────────
      function onResize() {
        const w = mount.clientWidth || window.innerWidth;
        const h = mount.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener('resize', onResize);

      // ── Animation loop ─────────────────────────────────────────────────────
      const BOUND_X = 8.5;
      const BOUND_Y = 5.5;

      function rebuildLines() {
        let lc = 0;
        for (let i = 0; i < COUNT && lc < MAX_LINES; i++) {
          for (let j = i + 1; j < COUNT && lc < MAX_LINES; j++) {
            const dx = ptPos[i * 3] - ptPos[j * 3];
            const dy = ptPos[i * 3 + 1] - ptPos[j * 3 + 1];
            const dz = ptPos[i * 3 + 2] - ptPos[j * 3 + 2];
            if (dx * dx + dy * dy + dz * dz < CONNECT_DIST_SQ) {
              const b = lc * 6;
              linePos[b] = ptPos[i * 3];
              linePos[b + 1] = ptPos[i * 3 + 1];
              linePos[b + 2] = ptPos[i * 3 + 2];
              linePos[b + 3] = ptPos[j * 3];
              linePos[b + 4] = ptPos[j * 3 + 1];
              linePos[b + 5] = ptPos[j * 3 + 2];
              lc++;
            }
          }
        }
        lineGeo.setDrawRange(0, lc * 2);
        lineGeo.attributes.position.needsUpdate = true;
      }

      function animate() {
        frameRef.current = requestAnimationFrame(animate);

        const mx = mouseWorld.current.x;
        const my = mouseWorld.current.y;

        for (let i = 0; i < COUNT; i++) {
          const ix = i * 3;

          // Mouse repulsion
          const dx = ptPos[ix] - mx;
          const dy = ptPos[ix + 1] - my;
          const dSq = dx * dx + dy * dy;
          if (dSq < REPULSE_RADIUS_SQ && dSq > 0.001) {
            const d = Math.sqrt(dSq);
            const force = ((REPULSE_RADIUS - d) / REPULSE_RADIUS) * 0.0006;
            ptVel[ix] += (dx / d) * force;
            ptVel[ix + 1] += (dy / d) * force;
          }

          // Speed cap
          const speed = Math.hypot(ptVel[ix], ptVel[ix + 1]);
          if (speed > SPEED_CAP) {
            ptVel[ix] *= SPEED_CAP / speed;
            ptVel[ix + 1] *= SPEED_CAP / speed;
          }

          // Move
          ptPos[ix] += ptVel[ix];
          ptPos[ix + 1] += ptVel[ix + 1];

          // Wrap bounds
          if (ptPos[ix] > BOUND_X) ptPos[ix] = -BOUND_X;
          else if (ptPos[ix] < -BOUND_X) ptPos[ix] = BOUND_X;
          if (ptPos[ix + 1] > BOUND_Y) ptPos[ix + 1] = -BOUND_Y;
          else if (ptPos[ix + 1] < -BOUND_Y) ptPos[ix + 1] = BOUND_Y;
        }
        ptGeo.attributes.position.needsUpdate = true;

        rebuildLines();
        renderer.render(scene, camera);
      }
      animate();

      // ── Cleanup captured in outer scope ────────────────────────────────────
      (init as unknown as { cleanup: () => void }).cleanup = () => {
        mount.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        ptGeo.dispose();
        ptMat.dispose();
        lineGeo.dispose();
        lineSegs.material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    init().catch(() => {});

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
      rendererRef.current?.dispose();
      // Remove canvas if still mounted
      mountRef.current?.querySelector('canvas')?.remove();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />;
}
