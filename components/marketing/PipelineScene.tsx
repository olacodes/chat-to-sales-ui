'use client';

import { useEffect, useRef } from 'react';
import type * as ThreeTypes from 'three';

interface CardConfig {
  label: string;
  color: number;
  glowColor: string;
  x: number;
  y: number;
  z: number;
  delay: number;
}

const CARDS: CardConfig[] = [
  { label: 'Chat', color: 0x00d4ff, glowColor: '#00d4ff', x: -2.6, y: 0.3, z: 0.8, delay: 0.0 },
  { label: 'Lead', color: 0x22c55e, glowColor: '#22c55e', x: -0.8, y: 0.6, z: 1.8, delay: 0.3 },
  { label: 'Qualified', color: 0xf59e0b, glowColor: '#f59e0b', x: 1.0, y: 0.2, z: 0.8, delay: 0.6 },
  {
    label: 'Demo Booked',
    color: 0xa855f7,
    glowColor: '#a855f7',
    x: -1.6,
    y: -0.4,
    z: -0.8,
    delay: 0.9,
  },
  {
    label: 'Closed Won',
    color: 0xf59e0b,
    glowColor: '#fbbf24',
    x: 0.4,
    y: 0.1,
    z: -1.4,
    delay: 1.2,
  },
];

export function PipelineScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<ThreeTypes.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Dynamically import Three.js to avoid SSR issues
    let cancelled = false;

    async function init() {
      const THREE = await import('three');

      if (cancelled || !mountRef.current) return;

      const width = mount!.clientWidth;
      const height = mount!.clientHeight;

      // ── Scene ──────────────────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x080810);
      scene.fog = new THREE.FogExp2(0x080810, 0.06);

      // ── Camera ─────────────────────────────────────────────────────────────
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 3.5, 8);
      camera.lookAt(0, 0, 0);

      // ── Renderer ───────────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      mount!.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // ── Ambient light ──────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0x1a1a2e, 8));

      // ── Key light (top-left) ───────────────────────────────────────────────
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
      keyLight.position.set(-4, 6, 3);
      keyLight.castShadow = true;
      scene.add(keyLight);

      // ── Ground plane (receives shadows) ───────────────────────────────────
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.ShadowMaterial({ opacity: 0.25 }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -1.8;
      ground.receiveShadow = true;
      scene.add(ground);

      // ── Cards ──────────────────────────────────────────────────────────────
      const cardMeshes: ThreeTypes.Mesh[] = [];
      const glowLights: ThreeTypes.PointLight[] = [];
      const baseY: number[] = [];

      CARDS.forEach((cfg) => {
        // Card body
        const geo = new THREE.BoxGeometry(1.4, 0.18, 1.0);
        const mat = new THREE.MeshPhongMaterial({
          color: 0xf5f5ff,
          emissive: 0x111122,
          shininess: 12,
          specular: 0x222244,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(cfg.x, cfg.y, cfg.z);
        mesh.rotation.x = -0.12;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        cardMeshes.push(mesh);
        baseY.push(cfg.y);

        // Glow point light beneath card
        const light = new THREE.PointLight(cfg.color, 18, 3.2);
        light.position.set(cfg.x, cfg.y - 0.24, cfg.z);
        scene.add(light);
        glowLights.push(light);

        // Thin emissive glow slab under card
        const glowGeo = new THREE.BoxGeometry(1.2, 0.04, 0.85);
        const glowMat = new THREE.MeshBasicMaterial({
          color: cfg.color,
          transparent: true,
          opacity: 0.55,
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        glowMesh.position.set(cfg.x, cfg.y - 0.13, cfg.z);
        glowMesh.rotation.x = -0.12;
        scene.add(glowMesh);

        // Thin connecting line (streak) — horizontal bar
        const streakGeo = new THREE.BoxGeometry(0.02, 0.015, 0.0);
        const streakMat = new THREE.MeshBasicMaterial({
          color: cfg.color,
          transparent: true,
          opacity: 0.3,
        });
        const streak = new THREE.Mesh(streakGeo, streakMat);
        streak.position.set(cfg.x, cfg.y - 0.05, cfg.z);
        scene.add(streak);
      });

      // ── Particle field (depth) ─────────────────────────────────────────────
      const particleCount = 180;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 14;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0x4f8ef7,
        size: 0.025,
        transparent: true,
        opacity: 0.5,
      });
      scene.add(new THREE.Points(particleGeo, particleMat));

      // ── Grid helper ────────────────────────────────────────────────────────
      const grid = new THREE.GridHelper(18, 24, 0x1a1a3a, 0x1a1a3a);
      (grid.material as ThreeTypes.Material).opacity = 0.35;
      (grid.material as ThreeTypes.Material).transparent = true;
      grid.position.y = -1.8;
      scene.add(grid);

      // ── Animate ────────────────────────────────────────────────────────────
      const clock = new THREE.Clock();

      function animate() {
        frameRef.current = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        cardMeshes.forEach((mesh, i) => {
          const delay = CARDS[i].delay;
          const bob = Math.sin(t * 0.8 + delay * 2.1) * 0.12;
          mesh.position.y = baseY[i] + bob;
          glowLights[i].position.y = baseY[i] + bob - 0.24;
          // Subtle tilt
          mesh.rotation.z = Math.sin(t * 0.5 + delay) * 0.025;
        });

        // Very slow camera orbit
        camera.position.x = Math.sin(t * 0.04) * 0.6;
        camera.position.y = 3.5 + Math.sin(t * 0.03) * 0.2;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      }
      animate();

      // ── Resize ────────────────────────────────────────────────────────────
      function handleResize() {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frameRef.current);
        renderer.dispose();
        if (mountRef.current?.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };
    }

    const cleanup = init();
    return () => {
      cancelled = true;
      cleanup.then((fn) => fn?.());
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{ minHeight: '480px' }}
      aria-hidden="true"
    />
  );
}
