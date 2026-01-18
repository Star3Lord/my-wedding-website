<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core';
  import { Group, MeshStandardMaterial, Color } from 'three';

  const { scene, renderer } = useThrelte();

  // Transparent canvas background
  scene.background = null;
  renderer.setClearColor(0x000000, 0);

  let rot = $state(0);
  let bob = $state(0);

  useTask((delta) => {
    rot += delta * 0.4;
    bob += delta * 2;
  });

  // Groom materials
  const suitMaterial = new MeshStandardMaterial({
    color: new Color('#1a1a2e'),
    roughness: 0.4,
    metalness: 0.1,
  });

  const shirtMaterial = new MeshStandardMaterial({
    color: new Color('#f8f8ff'),
    roughness: 0.6,
    metalness: 0,
  });

  // Bride materials
  const dressMaterial = new MeshStandardMaterial({
    color: new Color('#faf8f5'),
    roughness: 0.5,
    metalness: 0.05,
  });

  const dressTrimMaterial = new MeshStandardMaterial({
    color: new Color('#ffd700'),
    roughness: 0.3,
    metalness: 0.4,
  });

  // Shared materials
  const skinMaterial = new MeshStandardMaterial({
    color: new Color('#d4a574'),
    roughness: 0.7,
    metalness: 0,
  });

  const groomHairMaterial = new MeshStandardMaterial({
    color: new Color('#2d1f1a'),
    roughness: 0.8,
    metalness: 0,
  });

  const brideHairMaterial = new MeshStandardMaterial({
    color: new Color('#1a0f0a'),
    roughness: 0.7,
    metalness: 0.05,
  });
</script>

<T.PerspectiveCamera makeDefault position={[0, 0.6, 4]} fov={32} />

<T.AmbientLight intensity={0.5} />
<T.PointLight intensity={2} position={[2, 3, 4]} color="#ffffff" />
<T.PointLight intensity={1.5} position={[-2, 1, 3]} color="#ffd700" />
<T.PointLight intensity={1} position={[0, -1, 2]} color="#ff69b4" />

<!-- Rotating group with couple -->
<T.Group rotation.y={rot}>
  <!-- ========== GROOM (Left) ========== -->
  <T.Group position={[-0.35, 0, 0]}>
    <T.Group position.y={Math.sin(bob) * 0.03}>
      <!-- Body / Suit Jacket -->
      <T.Mesh position.y={0.5} material={suitMaterial} castShadow>
        <T.CapsuleGeometry args={[0.25, 0.45, 8, 16]} />
      </T.Mesh>

      <!-- Shirt / Chest -->
      <T.Mesh position={[0, 0.5, 0.13]} material={shirtMaterial} castShadow>
        <T.BoxGeometry args={[0.14, 0.35, 0.04]} />
      </T.Mesh>

      <!-- Bow tie -->
      <T.Mesh position={[0, 0.68, 0.16]} castShadow>
        <T.BoxGeometry args={[0.1, 0.04, 0.02]} />
        <T.MeshStandardMaterial color="#8b0000" roughness={0.5} />
      </T.Mesh>

      <!-- Head -->
      <T.Mesh position.y={0.95} material={skinMaterial} castShadow>
        <T.SphereGeometry args={[0.18, 16, 16]} />
      </T.Mesh>

      <!-- Hair -->
      <T.Mesh position={[0, 1.03, -0.03]} material={groomHairMaterial} castShadow>
        <T.SphereGeometry args={[0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
      </T.Mesh>

      <!-- Left Arm (towards bride) -->
      <T.Mesh 
        position={[-0.32, 0.45, 0.04]} 
        rotation.z={0.5} 
        rotation.x={-0.15}
        material={suitMaterial} 
        castShadow
      >
        <T.CapsuleGeometry args={[0.055, 0.28, 4, 8]} />
      </T.Mesh>

      <!-- Right Arm -->
      <T.Mesh
        position={[0.32, 0.45, 0]}
        rotation.z={-0.4}
        material={suitMaterial}
        castShadow
      >
        <T.CapsuleGeometry args={[0.055, 0.28, 4, 8]} />
      </T.Mesh>

      <!-- Legs -->
      <T.Mesh position={[-0.08, -0.1, 0]} material={suitMaterial} castShadow>
        <T.CapsuleGeometry args={[0.07, 0.35, 4, 8]} />
      </T.Mesh>
      <T.Mesh position={[0.08, -0.1, 0]} material={suitMaterial} castShadow>
        <T.CapsuleGeometry args={[0.07, 0.35, 4, 8]} />
      </T.Mesh>

      <!-- Eyes -->
      <T.Mesh position={[-0.055, 0.98, 0.16]}>
        <T.SphereGeometry args={[0.02, 8, 8]} />
        <T.MeshBasicMaterial color="#2d1f1a" />
      </T.Mesh>
      <T.Mesh position={[0.055, 0.98, 0.16]}>
        <T.SphereGeometry args={[0.02, 8, 8]} />
        <T.MeshBasicMaterial color="#2d1f1a" />
      </T.Mesh>

      <!-- Smile -->
      <T.Mesh position={[0, 0.9, 0.17]} rotation.x={0.2}>
        <T.TorusGeometry args={[0.04, 0.01, 8, 16, Math.PI]} />
        <T.MeshBasicMaterial color="#c77d6e" />
      </T.Mesh>
    </T.Group>
  </T.Group>

  <!-- ========== BRIDE (Right) ========== -->
  <T.Group position={[0.35, 0, 0]}>
    <T.Group position.y={Math.sin(bob + 0.5) * 0.03}>
      <!-- Dress - Main body (A-line silhouette) -->
      <T.Mesh position.y={0.28} material={dressMaterial} castShadow>
        <T.ConeGeometry args={[0.38, 0.75, 16, 1, true]} />
      </T.Mesh>
      
      <!-- Dress - Upper body/Bodice -->
      <T.Mesh position.y={0.55} material={dressMaterial} castShadow>
        <T.CapsuleGeometry args={[0.17, 0.28, 8, 16]} />
      </T.Mesh>

      <!-- Dress - Gold trim at waist -->
      <T.Mesh position={[0, 0.42, 0.1]} material={dressTrimMaterial} castShadow>
        <T.TorusGeometry args={[0.17, 0.015, 8, 16]} rotation={[Math.PI / 2, 0, 0]} />
      </T.Mesh>

      <!-- Necklace -->
      <T.Mesh position={[0, 0.68, 0.14]} castShadow>
        <T.TorusGeometry args={[0.06, 0.01, 8, 16]} rotation={[Math.PI / 2 + 0.3, 0, 0]} />
        <T.MeshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.7} />
      </T.Mesh>

      <!-- Head -->
      <T.Mesh position.y={0.92} material={skinMaterial} castShadow>
        <T.SphereGeometry args={[0.17, 16, 16]} />
      </T.Mesh>

      <!-- Hair - Main -->
      <T.Mesh position={[0, 0.99, -0.02]} material={brideHairMaterial} castShadow>
        <T.SphereGeometry args={[0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
      </T.Mesh>

      <!-- Hair - Bun -->
      <T.Mesh position={[0, 1.1, -0.06]} material={brideHairMaterial} castShadow>
        <T.SphereGeometry args={[0.075, 12, 12]} />
      </T.Mesh>

      <!-- Hair accessory / Tiara -->
      <T.Mesh position={[0, 1.06, 0.06]} rotation.x={-0.3} castShadow>
        <T.TorusGeometry args={[0.09, 0.012, 8, 16, Math.PI]} />
        <T.MeshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.8} />
      </T.Mesh>

      <!-- Earrings -->
      <T.Mesh position={[-0.15, 0.88, 0.04]} castShadow>
        <T.SphereGeometry args={[0.02, 8, 8]} />
        <T.MeshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.7} />
      </T.Mesh>
      <T.Mesh position={[0.15, 0.88, 0.04]} castShadow>
        <T.SphereGeometry args={[0.02, 8, 8]} />
        <T.MeshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.7} />
      </T.Mesh>

      <!-- Left Arm (holding bouquet) -->
      <T.Mesh 
        position={[-0.24, 0.48, 0.12]} 
        rotation.z={0.5}
        rotation.x={-0.3}
        material={skinMaterial} 
        castShadow
      >
        <T.CapsuleGeometry args={[0.04, 0.22, 4, 8]} />
      </T.Mesh>

      <!-- Right Arm (towards groom) -->
      <T.Mesh
        position={[0.24, 0.48, 0.04]}
        rotation.z={-0.5}
        rotation.x={-0.15}
        material={skinMaterial}
        castShadow
      >
        <T.CapsuleGeometry args={[0.04, 0.22, 4, 8]} />
      </T.Mesh>

      <!-- Bouquet -->
      <T.Group position={[-0.18, 0.35, 0.24]}>
        <!-- Flowers -->
        <T.Mesh castShadow>
          <T.SphereGeometry args={[0.06, 8, 8]} />
          <T.MeshStandardMaterial color="#ff6b6b" roughness={0.7} />
        </T.Mesh>
        <T.Mesh position={[0.045, 0.02, 0]} castShadow>
          <T.SphereGeometry args={[0.045, 8, 8]} />
          <T.MeshStandardMaterial color="#ffa8a8" roughness={0.7} />
        </T.Mesh>
        <T.Mesh position={[-0.04, 0.03, 0.015]} castShadow>
          <T.SphereGeometry args={[0.04, 8, 8]} />
          <T.MeshStandardMaterial color="#ffffff" roughness={0.7} />
        </T.Mesh>
      </T.Group>

      <!-- Eyes -->
      <T.Mesh position={[-0.05, 0.95, 0.15]}>
        <T.SphereGeometry args={[0.017, 8, 8]} />
        <T.MeshBasicMaterial color="#2d1f1a" />
      </T.Mesh>
      <T.Mesh position={[0.05, 0.95, 0.15]}>
        <T.SphereGeometry args={[0.017, 8, 8]} />
        <T.MeshBasicMaterial color="#2d1f1a" />
      </T.Mesh>

      <!-- Lips -->
      <T.Mesh position={[0, 0.87, 0.16]} rotation.x={0.15}>
        <T.TorusGeometry args={[0.03, 0.012, 8, 16, Math.PI]} />
        <T.MeshStandardMaterial color="#d4626a" roughness={0.5} />
      </T.Mesh>
    </T.Group>
  </T.Group>

  <!-- ========== HOLDING HANDS (between them) ========== -->
  <T.Group position={[0, 0.32, 0.12]}>
    <T.Mesh material={skinMaterial} castShadow>
      <T.SphereGeometry args={[0.045, 8, 8]} />
    </T.Mesh>
  </T.Group>
</T.Group>
