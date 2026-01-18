<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { useGltf } from '@threlte/extras';
  import {
    Group,
    AnimationMixer,
    LoopRepeat,
    type AnimationAction,
    MeshStandardMaterial,
    Color,
  } from 'three';

  interface Props {
    ref?: Group;
    position?: [number, number, number];
    scale?: number;
    isInteracting?: boolean;
  }

  let {
    ref = $bindable(),
    position = [0, 0, 0],
    scale = 3,
    isInteracting = false,
  }: Props = $props();

  const group = new Group();

  // Try to load couple models
  let groomGltfPromise = useGltf('/wedding/models/groom.glb');
  let brideGltfPromise = useGltf('/wedding/models/bride.glb');
  
  // Animation mixers
  let groomMixer: AnimationMixer | undefined;
  let brideMixer: AnimationMixer | undefined;
  let groomIdleAction: AnimationAction | undefined;
  let groomDanceAction: AnimationAction | undefined;
  let brideIdleAction: AnimationAction | undefined;
  let brideDanceAction: AnimationAction | undefined;

  // Fallback: Show placeholder if models don't load
  let showPlaceholder = $state(true);
  let placeholderBob = $state(0);

  // Try loading groom
  groomGltfPromise.then((gltf) => {
    if (gltf) {
      groomMixer = new AnimationMixer(gltf.scene);
      if (gltf.animations.length > 0) {
        const idleAnim = gltf.animations.find(
          (a) => a.name.toLowerCase().includes('idle') || a.name.toLowerCase().includes('stand')
        );
        const danceAnim = gltf.animations.find(
          (a) => a.name.toLowerCase().includes('dance') || a.name.toLowerCase().includes('move')
        );
        if (idleAnim) {
          groomIdleAction = groomMixer.clipAction(idleAnim);
          groomIdleAction.setLoop(LoopRepeat, Infinity);
          groomIdleAction.play();
        } else if (gltf.animations[0]) {
          groomIdleAction = groomMixer.clipAction(gltf.animations[0]);
          groomIdleAction.setLoop(LoopRepeat, Infinity);
          groomIdleAction.play();
        }
        if (danceAnim) {
          groomDanceAction = groomMixer.clipAction(danceAnim);
          groomDanceAction.setLoop(LoopRepeat, Infinity);
        } else if (gltf.animations[1]) {
          groomDanceAction = groomMixer.clipAction(gltf.animations[1]);
          groomDanceAction.setLoop(LoopRepeat, Infinity);
        }
      }
    }
  }).catch(() => {});

  // Try loading bride
  brideGltfPromise.then((gltf) => {
    if (gltf) {
      brideMixer = new AnimationMixer(gltf.scene);
      if (gltf.animations.length > 0) {
        const idleAnim = gltf.animations.find(
          (a) => a.name.toLowerCase().includes('idle') || a.name.toLowerCase().includes('stand')
        );
        const danceAnim = gltf.animations.find(
          (a) => a.name.toLowerCase().includes('dance') || a.name.toLowerCase().includes('move')
        );
        if (idleAnim) {
          brideIdleAction = brideMixer.clipAction(idleAnim);
          brideIdleAction.setLoop(LoopRepeat, Infinity);
          brideIdleAction.play();
        } else if (gltf.animations[0]) {
          brideIdleAction = brideMixer.clipAction(gltf.animations[0]);
          brideIdleAction.setLoop(LoopRepeat, Infinity);
          brideIdleAction.play();
        }
        if (danceAnim) {
          brideDanceAction = brideMixer.clipAction(danceAnim);
          brideDanceAction.setLoop(LoopRepeat, Infinity);
        } else if (gltf.animations[1]) {
          brideDanceAction = brideMixer.clipAction(gltf.animations[1]);
          brideDanceAction.setLoop(LoopRepeat, Infinity);
        }
      }
    }
  }).catch(() => {});

  // Check if both models loaded
  Promise.all([groomGltfPromise, brideGltfPromise]).then(([groom, bride]) => {
    if (groom && bride) {
      showPlaceholder = false;
    }
  }).catch(() => {
    showPlaceholder = true;
  });

  // Handle animation transitions
  $effect(() => {
    if (groomMixer && groomDanceAction && groomIdleAction) {
      if (isInteracting) {
        groomIdleAction.fadeOut(0.5);
        groomDanceAction.reset().fadeIn(0.5).play();
      } else {
        groomDanceAction.fadeOut(0.5);
        groomIdleAction.reset().fadeIn(0.5).play();
      }
    }
    if (brideMixer && brideDanceAction && brideIdleAction) {
      if (isInteracting) {
        brideIdleAction.fadeOut(0.5);
        brideDanceAction.reset().fadeIn(0.5).play();
      } else {
        brideDanceAction.fadeOut(0.5);
        brideIdleAction.reset().fadeIn(0.5).play();
      }
    }
  });

  useTask((delta) => {
    groomMixer?.update(delta);
    brideMixer?.update(delta);
    placeholderBob += delta * 2;
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

  const lipMaterial = new MeshStandardMaterial({
    color: new Color('#c77d6e'),
    roughness: 0.6,
    metalness: 0,
  });
</script>

<T is={group} bind:ref {position} scale={[scale, scale, scale]}>
  {#if showPlaceholder}
    <!-- Stylized Placeholder Couple -->
    
    <!-- ========== GROOM (Left) ========== -->
    <T.Group position={[-0.5, 0, 0]}>
      <T.Group position.y={Math.sin(placeholderBob) * 0.05}>
        <!-- Body / Suit Jacket -->
        <T.Mesh position.y={0.5} material={suitMaterial} castShadow>
          <T.CapsuleGeometry args={[0.32, 0.55, 8, 16]} />
        </T.Mesh>

        <!-- Shirt / Chest -->
        <T.Mesh position={[0, 0.5, 0.16]} material={shirtMaterial} castShadow>
          <T.BoxGeometry args={[0.18, 0.45, 0.05]} />
        </T.Mesh>

        <!-- Bow tie -->
        <T.Mesh position={[0, 0.72, 0.2]} castShadow>
          <T.BoxGeometry args={[0.14, 0.055, 0.03]} />
          <T.MeshStandardMaterial color="#8b0000" roughness={0.5} />
        </T.Mesh>

        <!-- Head -->
        <T.Mesh position.y={1.1} material={skinMaterial} castShadow>
          <T.SphereGeometry args={[0.23, 16, 16]} />
        </T.Mesh>

        <!-- Hair -->
        <T.Mesh position={[0, 1.2, -0.04]} material={groomHairMaterial} castShadow>
          <T.SphereGeometry args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        </T.Mesh>

        <!-- Left Arm (towards bride, slightly raised) -->
        <T.Mesh 
          position={[-0.42, 0.5, 0.05]} 
          rotation.z={isInteracting ? 0.8 : 0.4} 
          rotation.x={-0.2}
          material={suitMaterial} 
          castShadow
        >
          <T.CapsuleGeometry args={[0.07, 0.35, 4, 8]} />
        </T.Mesh>

        <!-- Right Arm (waving if interacting) -->
        <T.Mesh
          position={[0.42, isInteracting ? 0.85 : 0.5, 0]}
          rotation.z={isInteracting ? -1.2 + Math.sin(placeholderBob * 3) * 0.3 : -0.35}
          material={suitMaterial}
          castShadow
        >
          <T.CapsuleGeometry args={[0.07, 0.35, 4, 8]} />
        </T.Mesh>

        <!-- Legs -->
        <T.Mesh position={[-0.11, -0.18, 0]} material={suitMaterial} castShadow>
          <T.CapsuleGeometry args={[0.09, 0.45, 4, 8]} />
        </T.Mesh>
        <T.Mesh position={[0.11, -0.18, 0]} material={suitMaterial} castShadow>
          <T.CapsuleGeometry args={[0.09, 0.45, 4, 8]} />
        </T.Mesh>

        <!-- Shoes -->
        <T.Mesh position={[-0.11, -0.5, 0.04]} castShadow>
          <T.BoxGeometry args={[0.11, 0.07, 0.2]} />
          <T.MeshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.1} />
        </T.Mesh>
        <T.Mesh position={[0.11, -0.5, 0.04]} castShadow>
          <T.BoxGeometry args={[0.11, 0.07, 0.2]} />
          <T.MeshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.1} />
        </T.Mesh>

        <!-- Eyes -->
        <T.Mesh position={[-0.07, 1.13, 0.2]}>
          <T.SphereGeometry args={[0.025, 8, 8]} />
          <T.MeshBasicMaterial color="#2d1f1a" />
        </T.Mesh>
        <T.Mesh position={[0.07, 1.13, 0.2]}>
          <T.SphereGeometry args={[0.025, 8, 8]} />
          <T.MeshBasicMaterial color="#2d1f1a" />
        </T.Mesh>

        <!-- Smile -->
        <T.Mesh position={[0, 1.03, 0.21]} rotation.x={0.2}>
          <T.TorusGeometry args={[0.055, 0.012, 8, 16, Math.PI]} />
          <T.MeshBasicMaterial color="#c77d6e" />
        </T.Mesh>
      </T.Group>
    </T.Group>

    <!-- ========== BRIDE (Right) ========== -->
    <T.Group position={[0.5, 0, 0]}>
      <T.Group position.y={Math.sin(placeholderBob + 0.5) * 0.05}>
        <!-- Dress - Main body (A-line silhouette) -->
        <T.Mesh position.y={0.35} material={dressMaterial} castShadow>
          <T.ConeGeometry args={[0.5, 1.0, 16, 1, true]} />
        </T.Mesh>
        
        <!-- Dress - Upper body/Bodice -->
        <T.Mesh position.y={0.7} material={dressMaterial} castShadow>
          <T.CapsuleGeometry args={[0.22, 0.35, 8, 16]} />
        </T.Mesh>

        <!-- Dress - Gold trim at waist -->
        <T.Mesh position={[0, 0.52, 0.12]} material={dressTrimMaterial} castShadow>
          <T.TorusGeometry args={[0.22, 0.02, 8, 16]} rotation={[Math.PI / 2, 0, 0]} />
        </T.Mesh>

        <!-- Necklace -->
        <T.Mesh position={[0, 0.82, 0.18]} castShadow>
          <T.TorusGeometry args={[0.08, 0.012, 8, 16]} rotation={[Math.PI / 2 + 0.3, 0, 0]} />
          <T.MeshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.7} />
        </T.Mesh>

        <!-- Head -->
        <T.Mesh position.y={1.1} material={skinMaterial} castShadow>
          <T.SphereGeometry args={[0.22, 16, 16]} />
        </T.Mesh>

        <!-- Hair - Main -->
        <T.Mesh position={[0, 1.18, -0.02]} material={brideHairMaterial} castShadow>
          <T.SphereGeometry args={[0.21, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
        </T.Mesh>

        <!-- Hair - Bun -->
        <T.Mesh position={[0, 1.32, -0.08]} material={brideHairMaterial} castShadow>
          <T.SphereGeometry args={[0.1, 12, 12]} />
        </T.Mesh>

        <!-- Hair accessory / Tiara -->
        <T.Mesh position={[0, 1.28, 0.08]} rotation.x={-0.3} castShadow>
          <T.TorusGeometry args={[0.12, 0.015, 8, 16, Math.PI]} />
          <T.MeshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.8} />
        </T.Mesh>

        <!-- Earrings -->
        <T.Mesh position={[-0.2, 1.05, 0.05]} castShadow>
          <T.SphereGeometry args={[0.025, 8, 8]} />
          <T.MeshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.7} />
        </T.Mesh>
        <T.Mesh position={[0.2, 1.05, 0.05]} castShadow>
          <T.SphereGeometry args={[0.025, 8, 8]} />
          <T.MeshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.7} />
        </T.Mesh>

        <!-- Left Arm (holding bouquet) -->
        <T.Mesh 
          position={[-0.32, 0.6, 0.15]} 
          rotation.z={0.6}
          rotation.x={-0.4}
          material={skinMaterial} 
          castShadow
        >
          <T.CapsuleGeometry args={[0.05, 0.3, 4, 8]} />
        </T.Mesh>

        <!-- Right Arm (towards groom, slightly raised) -->
        <T.Mesh
          position={[0.32, 0.6, 0.05]}
          rotation.z={isInteracting ? -0.9 + Math.sin(placeholderBob * 3 + 1) * 0.2 : -0.5}
          rotation.x={-0.2}
          material={skinMaterial}
          castShadow
        >
          <T.CapsuleGeometry args={[0.05, 0.3, 4, 8]} />
        </T.Mesh>

        <!-- Bouquet -->
        <T.Group position={[-0.25, 0.45, 0.3]}>
          <!-- Flowers -->
          <T.Mesh castShadow>
            <T.SphereGeometry args={[0.08, 8, 8]} />
            <T.MeshStandardMaterial color="#ff6b6b" roughness={0.7} />
          </T.Mesh>
          <T.Mesh position={[0.06, 0.03, 0]} castShadow>
            <T.SphereGeometry args={[0.06, 8, 8]} />
            <T.MeshStandardMaterial color="#ffa8a8" roughness={0.7} />
          </T.Mesh>
          <T.Mesh position={[-0.05, 0.04, 0.02]} castShadow>
            <T.SphereGeometry args={[0.055, 8, 8]} />
            <T.MeshStandardMaterial color="#ffffff" roughness={0.7} />
          </T.Mesh>
          <T.Mesh position={[0, -0.02, 0.05]} castShadow>
            <T.SphereGeometry args={[0.05, 8, 8]} />
            <T.MeshStandardMaterial color="#ffb3b3" roughness={0.7} />
          </T.Mesh>
          <!-- Stems -->
          <T.Mesh position={[0, -0.08, 0]} rotation.x={0.1} castShadow>
            <T.CylinderGeometry args={[0.015, 0.02, 0.1, 8]} />
            <T.MeshStandardMaterial color="#2d5016" roughness={0.8} />
          </T.Mesh>
        </T.Group>

        <!-- Eyes -->
        <T.Mesh position={[-0.065, 1.13, 0.19]}>
          <T.SphereGeometry args={[0.022, 8, 8]} />
          <T.MeshBasicMaterial color="#2d1f1a" />
        </T.Mesh>
        <T.Mesh position={[0.065, 1.13, 0.19]}>
          <T.SphereGeometry args={[0.022, 8, 8]} />
          <T.MeshBasicMaterial color="#2d1f1a" />
        </T.Mesh>

        <!-- Eyelashes (subtle) -->
        <T.Mesh position={[-0.065, 1.145, 0.2]} rotation.z={0.1}>
          <T.BoxGeometry args={[0.04, 0.006, 0.002]} />
          <T.MeshBasicMaterial color="#1a0f0a" />
        </T.Mesh>
        <T.Mesh position={[0.065, 1.145, 0.2]} rotation.z={-0.1}>
          <T.BoxGeometry args={[0.04, 0.006, 0.002]} />
          <T.MeshBasicMaterial color="#1a0f0a" />
        </T.Mesh>

        <!-- Lips -->
        <T.Mesh position={[0, 1.03, 0.2]} rotation.x={0.15}>
          <T.TorusGeometry args={[0.04, 0.015, 8, 16, Math.PI]} />
          <T.MeshStandardMaterial color="#d4626a" roughness={0.5} />
        </T.Mesh>

        <!-- Blush (subtle) -->
        <T.Mesh position={[-0.12, 1.07, 0.16]}>
          <T.SphereGeometry args={[0.035, 8, 8]} />
          <T.MeshStandardMaterial color="#ffb3b3" roughness={0.9} transparent opacity={0.3} />
        </T.Mesh>
        <T.Mesh position={[0.12, 1.07, 0.16]}>
          <T.SphereGeometry args={[0.035, 8, 8]} />
          <T.MeshStandardMaterial color="#ffb3b3" roughness={0.9} transparent opacity={0.3} />
        </T.Mesh>
      </T.Group>
    </T.Group>

    <!-- ========== HOLDING HANDS (between them) ========== -->
    {#if !isInteracting}
      <!-- Connected hands in the middle -->
      <T.Group position={[0, 0.4, 0.15]}>
        <T.Mesh material={skinMaterial} castShadow>
          <T.SphereGeometry args={[0.06, 8, 8]} />
        </T.Mesh>
      </T.Group>
    {/if}

  {:else}
    <!-- Actual GLTF Models -->
    <svelte:boundary>
      <!-- Groom Model -->
      {@const groomGltf = await groomGltfPromise}
      <T.Group position={[-0.5, 0, 0]}>
        <T.Primitive object={groomGltf.scene} />
      </T.Group>
      {#snippet failed(error)}
        <!-- Fallback handled by showPlaceholder -->
      {/snippet}
    </svelte:boundary>
    <svelte:boundary>
      <!-- Bride Model -->
      {@const brideGltf = await brideGltfPromise}
      <T.Group position={[0.5, 0, 0]}>
        <T.Primitive object={brideGltf.scene} />
      </T.Group>
      {#snippet failed(error)}
        <!-- Fallback handled by showPlaceholder -->
      {/snippet}
    </svelte:boundary>
  {/if}
</T>
