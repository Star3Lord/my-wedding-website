<script lang="ts">
  import { Canvas } from '@threlte/core';
  import Scene from './scene.svelte';

  let { children } = $props();
</script>

<div class="relative h-screen w-screen overflow-hidden bg-[#0a0612]">
  <!-- 3D Canvas -->
  <div class="absolute inset-0">
    <Canvas autoRender={false}>
      <Scene />
    </Canvas>
  </div>

  <!-- Overlay -->
  {@render children?.()}
</div>

