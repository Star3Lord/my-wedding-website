<script lang="ts">
  import { Canvas } from '@threlte/core';
  import Scene from './scene.svelte';
</script>

<div class="absolute inset-0">
  <Canvas autoRender={false}>
    <Scene />
  </Canvas>
</div>

