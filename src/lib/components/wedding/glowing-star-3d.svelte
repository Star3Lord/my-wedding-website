<script lang="ts">
  import { Canvas, T, useTask } from '@threlte/core';
  import { useTexture } from '@threlte/extras';
  import {
    AdditiveBlending,
    Color,
    DoubleSide,
    Mesh,
    MeshStandardMaterial,
    type Group,
  } from 'three';

  interface Props {
    class?: string;
    size?: number;
  }

  let { class: className = '', size = 72 }: Props = $props();

  let groupRef = $state<Group>();
  let haloRef = $state<Mesh>();

  const haloTexture = useTexture('/wedding/textures/star.png');

  const starMaterial = new MeshStandardMaterial({
    color: new Color('#ffd700'),
    emissive: new Color('#ffd700'),
    emissiveIntensity: 2.6,
    metalness: 0.7,
    roughness: 0.15,
  });

  let t = 0;
  useTask((delta) => {
    t += delta;

    if (groupRef) {
      groupRef.rotation.y = t * 0.9;
      groupRef.rotation.x = t * 0.55;
      groupRef.rotation.z = t * 0.18;
    }

    if (haloRef) {
      haloRef.rotation.z = -t * 0.7;
    }

    // Smooth glow breathing (kept subtle so it feels elegant, not flickery)
    starMaterial.emissiveIntensity = 2.35 + Math.sin(t * 2.0) * 0.35;
  });
</script>

<div
  class={`pointer-events-none ${className}`}
  style={`width: ${size}px; height: ${size}px;`}
  aria-hidden="true"
>
  <div class="h-full w-full">
    <Canvas>
      <T.PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />

      <T.AmbientLight intensity={0.65} />
      <T.PointLight intensity={6} position={[3, 3, 3]} color="#ffffff" />
      <T.PointLight intensity={3} position={[-3, -1, 2]} color="#ffd700" />

      <T.Group bind:ref={groupRef} scale={[1.05, 1.05, 1.05]}>
        <T.Mesh material={starMaterial}>
          <!-- Octahedron reads like a stylized 3D star -->
          <T.OctahedronGeometry args={[1, 1]} />
        </T.Mesh>

        <!-- Glow halo -->
        <svelte:boundary>
          <T.Mesh bind:ref={haloRef} scale={[2.8, 2.8, 2.8]}>
            <T.PlaneGeometry args={[2, 2]} />
            <T.MeshBasicMaterial
              alphaMap={await haloTexture}
              transparent
              opacity={0.9}
              color="#ffd700"
              blending={AdditiveBlending}
              side={DoubleSide}
              depthWrite={false}
            />
          </T.Mesh>
          {#snippet pending()}
            <div />
          {/snippet}
          {#snippet failed(error)}
            <div />
          {/snippet}
        </svelte:boundary>
      </T.Group>
    </Canvas>
  </div>
</div>

