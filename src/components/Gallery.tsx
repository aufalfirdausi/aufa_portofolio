"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, use, useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { Card } from "@/content/cards";
import { clamp, type ScrollState } from "@/lib/scroll";

type Props = {
  cards: Card[];
  state: RefObject<ScrollState>;
  onReady?: () => void;
};

const vertexShader = /* glsl */ `
  uniform vec2 uViewport;
  uniform vec2 uCenter;
  uniform vec2 uPlaneSize;
  uniform float uShear;
  uniform float uCurve;
  uniform float uVelocity;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);

    // Lean the whole column: everything above the center slides right, below slides left.
    world.x += (world.y - uCenter.y) * uShear;

    // Bow each plane: the sides drop, the middle stays up. Scrolling exaggerates it.
    float relX = position.x * uPlaneSize.x / uViewport.x;
    float curve = uCurve * (1.0 + uVelocity * 1.4);
    world.y -= relX * relX * curve * uViewport.y;

    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uImageSize;
  uniform vec2 uPlaneSize;
  uniform vec3 uBg;
  uniform float uActive;
  uniform float uVelocity;
  uniform float uTime;
  varying vec2 vUv;

  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // object-fit: cover
    float planeRatio = uPlaneSize.x / uPlaneSize.y;
    float imageRatio = uImageSize.x / uImageSize.y;
    vec2 scale = planeRatio < imageRatio
      ? vec2(planeRatio / imageRatio, 1.0)
      : vec2(1.0, imageRatio / planeRatio);
    vec2 uv = (vUv - 0.5) * scale + 0.5;

    // Slight zoom-out on the active image
    uv = (uv - 0.5) * (1.0 - 0.08 * (1.0 - uActive)) + 0.5;

    // RGB split while moving
    float shift = clamp(uVelocity, -1.0, 1.0) * 0.012;
    vec3 color = vec3(
      texture2D(uTexture, uv + vec2(0.0, shift)).r,
      texture2D(uTexture, uv).g,
      texture2D(uTexture, uv - vec2(0.0, shift)).b
    );

    // Inactive images: desaturated and tinted towards the background
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    vec3 inactive = mix(vec3(gray), uBg, 0.45);
    color = mix(inactive, color, uActive);

    // Film grain
    color += (rand(vUv * 800.0 + fract(uTime)) - 0.5) * 0.07;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function layoutFor(width: number, height: number) {
  if (width < 768) {
    const planeW = width * 0.66;
    const planeH = Math.min(planeW * 0.82, height * 0.28);
    const y = height * 0.5 - 92 - planeH / 2;
    return { planeW, planeH, x: 0, y, gap: 14, shear: 0.14, curve: 0.22 };
  }
  let planeW = width * 0.34;
  let planeH = planeW * 0.88;
  if (planeH > height * 0.58) {
    planeH = height * 0.58;
    planeW = planeH / 0.88;
  }
  return {
    planeW,
    planeH,
    x: width * 0.18,
    y: -height * 0.01,
    gap: Math.max(16, height * 0.03),
    shear: 0.24,
    curve: 0.42,
  };
}

const textureCache = new Map<string, Promise<THREE.Texture[]>>();

// A missing image becomes a gray placeholder instead of crashing the whole canvas.
function loadTextures(urls: string[]) {
  const key = urls.join("|");
  let promise = textureCache.get(key);
  if (!promise) {
    const loader = new THREE.TextureLoader();
    promise = Promise.all(
      urls.map((url) =>
        loader.loadAsync(url).catch(() => {
          console.warn(`[portfolio] Gambar tidak ditemukan: ${url}`);
          const fallback = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1);
          fallback.needsUpdate = true;
          return fallback as THREE.Texture;
        }),
      ),
    );
    textureCache.set(key, promise);
  }
  return promise;
}

function Planes({ cards, state, onReady }: Props) {
  const textures = use(loadTextures(cards.map((c) => c.image)));
  const size = useThree((s) => s.size);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 48, 48), []);
  const materials = useMemo(
    () =>
      textures.map((texture) => {
        // Keep raw sRGB values so colors match the CSS background exactly.
        texture.colorSpace = THREE.NoColorSpace;
        const image = texture.image as { width: number; height: number };
        return new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms: {
            uTexture: { value: texture },
            uImageSize: { value: new THREE.Vector2(image.width, image.height) },
            uPlaneSize: { value: new THREE.Vector2(1, 1) },
            uViewport: { value: new THREE.Vector2(1, 1) },
            uCenter: { value: new THREE.Vector2() },
            uBg: { value: new THREE.Color() },
            uShear: { value: 0 },
            uCurve: { value: 0 },
            uActive: { value: 0 },
            uVelocity: { value: 0 },
            uTime: { value: 0 },
          },
        });
      }),
    [textures],
  );

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(
    () => () => {
      geometry.dispose();
      materials.forEach((m) => m.dispose());
    },
    [geometry, materials],
  );

  useFrame(({ clock }) => {
    const s = state.current;
    if (!s) return;
    const layout = layoutFor(size.width, size.height);
    const spacing = layout.planeH + layout.gap;
    const velocity = clamp(s.velocity, -1, 1);

    meshes.current.forEach((mesh, i) => {
      if (!mesh) return;
      const rel = i - s.current;
      mesh.visible = Math.abs(rel) < 3.5;
      if (!mesh.visible) return;

      mesh.position.set(layout.x, layout.y - rel * spacing, 0);
      mesh.scale.set(layout.planeW, layout.planeH, 1);

      const t = 1 - Math.min(1, Math.abs(rel));
      const u = (mesh.material as THREE.ShaderMaterial).uniforms;
      u.uActive.value = t * t * (3 - 2 * t);
      u.uVelocity.value = velocity;
      u.uTime.value = clock.elapsedTime;
      u.uShear.value = layout.shear;
      u.uCurve.value = layout.curve;
      u.uViewport.value.set(size.width, size.height);
      u.uCenter.value.set(layout.x, layout.y);
      u.uPlaneSize.value.set(layout.planeW, layout.planeH);
      u.uBg.value.setRGB(s.bg[0] / 255, s.bg[1] / 255, s.bg[2] / 255);
    });
  });

  return (
    <>
      {cards.map((card, i) => (
        <mesh
          key={card.slug}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          geometry={geometry}
          material={materials[i]}
        />
      ))}
    </>
  );
}

export default function Gallery(props: Props) {
  return (
    <Canvas
      orthographic
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 500], near: 0.1, far: 2000, zoom: 1 }}
    >
      <Suspense fallback={null}>
        <Planes {...props} />
      </Suspense>
    </Canvas>
  );
}
