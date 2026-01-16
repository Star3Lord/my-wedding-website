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

  // Try to load the groom model - user needs to add their own model
  // You can download free models from Mixamo (mixamo.com) or Ready Player Me
  let gltfPromise = useGltf('/wedding/models/groom.glb');
  
  // Three.js animation objects - use regular let (not reactive, mutated in promise callback)
  let mixer: AnimationMixer | undefined;
  let idleAction: AnimationAction | undefined;
  let danceAction: AnimationAction | undefined;

  // Fallback: Create a stylized placeholder groom using simple geometry
  let showPlaceholder = $state(true);
  // Bob animation value - needs reactivity for template binding
  let placeholderBob = $state(0);

  gltfPromise.then((gltf) => {
    if (gltf) {
      showPlaceholder = false;
      mixer = new AnimationMixer(gltf.scene);
      
      // Look for animations in the model
      if (gltf.animations.length > 0) {
        // Try to find idle and dance animations by name
        const idleAnim = gltf.animations.find(
          (a) => a.name.toLowerCase().includes('idle') || a.name.toLowerCase().includes('stand')
        );
        const danceAnim = gltf.animations.find(
          (a) => a.name.toLowerCase().includes('dance') || a.name.toLowerCase().includes('move')
        );

        if (idleAnim) {
          idleAction = mixer.clipAction(idleAnim);
          idleAction.setLoop(LoopRepeat, Infinity);
          idleAction.play();
        } else if (gltf.animations[0]) {
          // Use first animation as idle
          idleAction = mixer.clipAction(gltf.animations[0]);
          idleAction.setLoop(LoopRepeat, Infinity);
          idleAction.play();
        }

        if (danceAnim) {
          danceAction = mixer.clipAction(danceAnim);
          danceAction.setLoop(LoopRepeat, Infinity);
        } else if (gltf.animations[1]) {
          // Use second animation as dance
          danceAction = mixer.clipAction(gltf.animations[1]);
          danceAction.setLoop(LoopRepeat, Infinity);
        }
      }
    }
  }).catch(() => {
    showPlaceholder = true;
  });

  // Handle animation transitions based on interaction
  $effect(() => {
    if (mixer && danceAction && idleAction) {
      if (isInteracting) {
        idleAction.fadeOut(0.5);
        danceAction.reset().fadeIn(0.5).play();
      } else {
        danceAction.fadeOut(0.5);
        idleAction.reset().fadeIn(0.5).play();
      }
    }
  });

  useTask((delta) => {
    if (mixer) {
      mixer.update(delta);
    }
    
    // Animate placeholder bob
    placeholderBob += delta * 2;
  });

  // Placeholder groom materials
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

  const skinMaterial = new MeshStandardMaterial({
    color: new Color('#d4a574'),
    roughness: 0.7,
    metalness: 0,
  });

  const hairMaterial = new MeshStandardMaterial({
    color: new Color('#2d1f1a'),
    roughness: 0.8,
    metalness: 0,
  });
</script>

<T is={group} bind:ref {position} scale={[scale, scale, scale]}>
  {#if showPlaceholder}
    <!-- Stylized Placeholder Groom -->
    <T.Group position.y={Math.sin(placeholderBob) * 0.05}>
      <!-- Body / Suit Jacket -->
      <T.Mesh position.y={0.5} material={suitMaterial} castShadow>
        <T.CapsuleGeometry args={[0.35, 0.6, 8, 16]} />
      </T.Mesh>

      <!-- Shirt / Chest -->
      <T.Mesh position={[0, 0.5, 0.18]} material={shirtMaterial} castShadow>
        <T.BoxGeometry args={[0.2, 0.5, 0.05]} />
      </T.Mesh>

      <!-- Bow tie -->
      <T.Mesh position={[0, 0.75, 0.22]} castShadow>
        <T.BoxGeometry args={[0.15, 0.06, 0.03]} />
        <T.MeshStandardMaterial color="#8b0000" roughness={0.5} />
      </T.Mesh>

      <!-- Head -->
      <T.Mesh position.y={1.15} material={skinMaterial} castShadow>
        <T.SphereGeometry args={[0.25, 16, 16]} />
      </T.Mesh>

      <!-- Hair -->
      <T.Mesh position={[0, 1.25, -0.05]} material={hairMaterial} castShadow>
        <T.SphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
      </T.Mesh>

      <!-- Left Arm -->
      <T.Mesh position={[-0.45, 0.55, 0]} rotation.z={0.3} material={suitMaterial} castShadow>
        <T.CapsuleGeometry args={[0.08, 0.4, 4, 8]} />
      </T.Mesh>

      <!-- Right Arm (waving if interacting) -->
      <T.Mesh
        position={[0.45, isInteracting ? 0.9 : 0.55, 0]}
        rotation.z={isInteracting ? -1.2 + Math.sin(placeholderBob * 3) * 0.3 : -0.3}
        material={suitMaterial}
        castShadow
      >
        <T.CapsuleGeometry args={[0.08, 0.4, 4, 8]} />
      </T.Mesh>

      <!-- Legs -->
      <T.Mesh position={[-0.12, -0.2, 0]} material={suitMaterial} castShadow>
        <T.CapsuleGeometry args={[0.1, 0.5, 4, 8]} />
      </T.Mesh>
      <T.Mesh position={[0.12, -0.2, 0]} material={suitMaterial} castShadow>
        <T.CapsuleGeometry args={[0.1, 0.5, 4, 8]} />
      </T.Mesh>

      <!-- Shoes -->
      <T.Mesh position={[-0.12, -0.55, 0.05]} castShadow>
        <T.BoxGeometry args={[0.12, 0.08, 0.22]} />
        <T.MeshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.1} />
      </T.Mesh>
      <T.Mesh position={[0.12, -0.55, 0.05]} castShadow>
        <T.BoxGeometry args={[0.12, 0.08, 0.22]} />
        <T.MeshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.1} />
      </T.Mesh>

      <!-- Eyes -->
      <T.Mesh position={[-0.08, 1.18, 0.22]}>
        <T.SphereGeometry args={[0.03, 8, 8]} />
        <T.MeshBasicMaterial color="#2d1f1a" />
      </T.Mesh>
      <T.Mesh position={[0.08, 1.18, 0.22]}>
        <T.SphereGeometry args={[0.03, 8, 8]} />
        <T.MeshBasicMaterial color="#2d1f1a" />
      </T.Mesh>

      <!-- Smile -->
      <T.Mesh position={[0, 1.08, 0.23]} rotation.x={0.2}>
        <T.TorusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
        <T.MeshBasicMaterial color="#c77d6e" />
      </T.Mesh>
    </T.Group>
  {:else}
    <!-- Actual GLTF Model -->
    <svelte:boundary>
      {@const gltf = await gltfPromise}
      <T.Primitive object={gltf.scene} />
      {#snippet failed(error)}
        <!-- Fallback to placeholder on error -->
      {/snippet}
    </svelte:boundary>
  {/if}
</T>

