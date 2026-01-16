<script lang="ts">
  import { Canvas } from '@threlte/core';
  import Scene from './scene.svelte';
</script>

<div class="h-full w-full">
  <Canvas autoRender={false}>
    <Scene />
  </Canvas>
</div>
