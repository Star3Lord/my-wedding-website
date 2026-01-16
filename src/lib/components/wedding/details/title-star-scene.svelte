<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core';
  import { useTexture } from '@threlte/extras';
  import { AdditiveBlending, Color } from 'three';

  const { scene, renderer } = useThrelte();

  // Transparent canvas background so this can sit nicely above text.
  scene.background = null;
  renderer.setClearColor(0x000000, 0);

  const glowMap = useTexture('/wedding/textures/star.png');

  let rot = $state(0);
  let pulse = $state(0);

  useTask((delta) => {
    rot += delta * 1.2;
    pulse += delta * 2.0;
  });

  const gold = new Color('#ffd700');
  const white = new Color('#ffffff');
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 4]} fov={38} />

<T.AmbientLight intensity={0.8} />
<T.PointLight intensity={3.5} position={[2, 2, 4]} color="#ffffff" />
<T.PointLight intensity={2} position={[-2, -1, 3]} color="#ffd700" />

<T.Group
  rotation={[rot * 0.35, rot * 0.75, rot * 0.15]}
  scale={1 + Math.sin(pulse) * 0.04}
>
  <!-- Star core -->
  <T.Mesh>
    <T.OctahedronGeometry args={[1, 0]} />
    <T.MeshStandardMaterial
      color={gold}
      emissive={gold}
      emissiveIntensity={2.2}
      roughness={0.18}
      metalness={0.85}
    />
  </T.Mesh>

  <!-- Soft glow sprite -->
  <svelte:boundary>
    <T.Sprite scale={[3.4, 3.4, 1]}>
      <T.SpriteMaterial
        map={await glowMap}
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
        opacity={0.55}
        color={white}
      />
    </T.Sprite>
    {#snippet pending()}
      <!-- No-op: keep UI clean while texture loads -->
      <span></span>
    {/snippet}
  </svelte:boundary>
</T.Group>

