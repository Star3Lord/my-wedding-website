<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
  import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
  import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
  import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
  import { Color, Vector2, type Group } from 'three';
import GalaxyParticles from './galaxy-particles.svelte';
import Couple from './couple.svelte';

  const { scene, size, camera, renderer } = useThrelte();

  // Set scene background
  scene.background = new Color('#0a0612');

  // ============================================
  // BIG BANG ANIMATION
  // ============================================
  let bigBangScale = $state(0);
  let elapsedTime = 0;
  
  // Animation phase durations (constants)
  const CHARGE_DELAY = 0.3;     // Initial wait before charging starts
  const CHARGE_DURATION = 1.2;  // Energy buildup phase
  const CRITICAL_DURATION = 1.0; // Ticking bomb countdown phase
  const EXPLOSION_DURATION = 2.0; // Main expansion phase

  // Computed phase boundaries (derived from constants - no need for $derived as they're static)
  const CHARGE_END = CHARGE_DELAY + CHARGE_DURATION;
  const CRITICAL_END = CHARGE_END + CRITICAL_DURATION;
  
  // Charging effect state
  let chargeProgress = $state(0);
  let chargeIntensity = $state(0);
  let orbScale = $state(0);
  let isCharging = $state(false);
  let isCritical = $state(false);
  let isExploding = $state(false);
  
  // Critical phase - rising temperature effect
  let heatIntensity = $state(0);
  let criticalPulse = $state(0);

  // Smooth cubic bezier approximation - ease out cubic
  function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  // Ease in cubic for charge buildup
  function easeInCubic(t: number): number {
    return t * t * t;
  }

  // Ease in-out for smooth transitions
  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Custom smooth ease-out with slight overshoot for explosion
  function explosionEasing(t: number): number {
    // Cubic ease-out with gentle overshoot
    const overshoot = 1.03;
    const base = easeOutCubic(t);
    // Very subtle settle at the end
    const settle = Math.sin(t * Math.PI) * 0.015 * (1 - t);
    return Math.min(base * overshoot - (overshoot - 1) * Math.pow(t, 2), 1) + settle;
  }

  // Bloom post-processing for the magical glow effect
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, $camera);
  const bloomPass = new UnrealBloomPass(
    new Vector2($size.width, $size.height),
    0.6,   // strength
    0.8,   // radius
    0.2    // threshold
  );
  const outputPass = new OutputPass();

  composer.addPass(renderPass);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);

  $effect(() => {
    composer.setSize($size.width, $size.height);
    bloomPass.resolution.set($size.width, $size.height);
  });

  $effect(() => {
    renderPass.camera = $camera;
  });

  // Interaction state
  let isInteracting = $state(false);
  let coupleRef = $state.raw<Group>();

  // Custom render task with Big Bang animation
  const { renderStage } = useThrelte();
  useTask(
    (delta) => {
      elapsedTime += delta;

      // Phase 1: Initial wait
      if (elapsedTime < CHARGE_DELAY) {
        bloomPass.strength = 0.3;
        orbScale = 0;
      }
      // Phase 2: Charging up - smooth energy buildup
      else if (elapsedTime < CHARGE_END) {
        isCharging = true;
        isCritical = false;
        chargeProgress = (elapsedTime - CHARGE_DELAY) / CHARGE_DURATION;
        
        // Pure smooth intensity buildup - no oscillation
        chargeIntensity = easeInOutCubic(chargeProgress);
        orbScale = chargeIntensity * 0.8;
        
        // Bloom increases smoothly as charge builds
        bloomPass.strength = 0.3 + chargeIntensity * 2.0;
      }
      // Phase 3: CRITICAL - Smooth rising temperature (one direction only)
      else if (elapsedTime < CRITICAL_END) {
        isCharging = false;
        isCritical = true;
        
        const criticalProgress = (elapsedTime - CHARGE_END) / CRITICAL_DURATION;
        
        // Pure smooth rising heat - easeInOutCubic for natural acceleration then plateau
        heatIntensity = easeInOutCubic(criticalProgress);
        
        // Orb contracts smoothly as pressure builds - no oscillation
        const contract = easeInOutCubic(criticalProgress) * 0.35;
        orbScale = 0.8 - contract;
        
        // No pulse - just smooth
        criticalPulse = 0;
        
        // Intensity builds smoothly toward the end
        chargeIntensity = 0.7 + heatIntensity * 0.5;
        
        // Bloom rises smoothly with the heat
        bloomPass.strength = 1.5 + heatIntensity * 3.0;
      }
      // Phase 4: Explosion!
      else if (bigBangScale < 1) {
        isCritical = false;
        isExploding = true;
        
        const explosionTime = elapsedTime - CRITICAL_END;
        const animProgress = Math.min(explosionTime / EXPLOSION_DURATION, 1);
        bigBangScale = explosionEasing(animProgress);
        
        // Orb expands rapidly then fades
        orbScale = (1 - easeOutCubic(animProgress)) * 3;
        
        // Bloom peaks at start of explosion then fades
        const explosionBloom = 4.5 * (1 - easeOutCubic(animProgress)) + 0.6;
        bloomPass.strength = explosionBloom;
        
        // Update intensities for the light burst
        chargeIntensity = 1 - easeOutCubic(animProgress);
        heatIntensity = chargeIntensity;
      } 
      // Phase 5: Settled
      else {
        isExploding = false;
        chargeIntensity = 0;
        heatIntensity = 0;
        orbScale = 0;
        bloomPass.strength = 0.6;
      }

      composer.render();
    },
    { stage: renderStage }
  );

  function onPointerDown() {
    isInteracting = true;
  }

  function onPointerUp() {
    isInteracting = false;
  }
</script>

<svelte:window onpointerdown={onPointerDown} onpointerup={onPointerUp} />

<!-- Camera -->
<T.PerspectiveCamera makeDefault position={[0, 8, 25]} fov={50}>
  <OrbitControls
    enableDamping
    dampingFactor={0.05}
    enableZoom={true}
    minDistance={15}
    maxDistance={50}
    enablePan={false}
    autoRotate
    autoRotateSpeed={0.3}
    target={[0, 2, 0]}
    maxPolarAngle={Math.PI * 0.6}
    minPolarAngle={Math.PI * 0.2}
  />
</T.PerspectiveCamera>

<!-- Lighting -->
<T.AmbientLight intensity={0.3} color="#ffe4d6" />

<T.DirectionalLight
  intensity={1.2}
  position={[10, 20, 10]}
  color="#fff5eb"
  castShadow
  shadow.mapSize.width={2048}
  shadow.mapSize.height={2048}
/>

<T.PointLight
  intensity={2}
  position={[0, 5, 0]}
  color="#ffd700"
  distance={20}
  decay={2}
/>

<T.SpotLight
  intensity={3}
  position={[0, 15, 5]}
  color="#ffe4c4"
  angle={0.4}
  penumbra={0.5}
  castShadow
  target.position={[0, 0, 0]}
/>

<!-- Rim lights for dramatic effect -->
<T.PointLight intensity={1} position={[-8, 3, -5]} color="#ff69b4" distance={15} />
<T.PointLight intensity={1} position={[8, 3, -5]} color="#ffd700" distance={15} />

<!-- Big Bang Container - Everything scales from 0 -->
<T.Group scale={[bigBangScale, bigBangScale, bigBangScale]}>
  <!-- Galaxy Particles -->
  <GalaxyParticles particleCount={120000} innerRadius={8} outerRadius={45} />

  <!-- Bride & Groom at Center -->
  <Couple bind:ref={coupleRef} position={[0, -1, 0]} scale={2.2} {isInteracting} />

  <!-- Ground reflection plane (subtle) -->
  <T.Mesh rotation.x={-Math.PI / 2} position.y={-3.5} receiveShadow>
    <T.CircleGeometry args={[15, 64]} />
    <T.MeshStandardMaterial
      color="#1a0a20"
      roughness={0.8}
      metalness={0.2}
      transparent
      opacity={0.5}
    />
  </T.Mesh>
</T.Group>

<!-- Charging orb - pulsing energy before explosion -->
{#if isCharging}
  <!-- Core charging light -->
  <T.PointLight
    intensity={chargeIntensity * 30}
    position={[0, 0, 0]}
    color="#ffd700"
    distance={50}
    decay={2}
  />
  <!-- Outer glow -->
  <T.PointLight
    intensity={chargeIntensity * 15}
    position={[0, 0, 0]}
    color="#ff8c00"
    distance={30}
    decay={1}
  />
  <!-- Visible charging sphere -->
  <T.Mesh scale={[orbScale, orbScale, orbScale]}>
    <T.SphereGeometry args={[1, 32, 32]} />
    <T.MeshBasicMaterial color="#ffd700" transparent opacity={chargeIntensity * 0.8} />
  </T.Mesh>
{/if}

<!-- CRITICAL PHASE - Rising temperature/intensity -->
{#if isCritical}
  <!-- Core heat light - transitions from gold to white-hot -->
  <T.PointLight
    intensity={30 + heatIntensity * 50}
    position={[0, 0, 0]}
    color={new Color('#ffd700').lerp(new Color('#ffffff'), heatIntensity * 0.8)}
    distance={60}
    decay={1.5}
  />
  <!-- Inner glow - orange to yellow transition -->
  <T.PointLight
    intensity={20 + heatIntensity * 40}
    position={[0, 0, 0]}
    color={new Color('#ff6600').lerp(new Color('#ffdd00'), heatIntensity)}
    distance={45}
    decay={2}
  />
  <!-- Outer radiance -->
  <T.PointLight
    intensity={heatIntensity * 25}
    position={[0, 0, 0]}
    color="#fff5eb"
    distance={80}
    decay={1}
  />
  <!-- Contracting heated orb -->
  {@const finalScale = orbScale + criticalPulse}
  <T.Mesh scale={[finalScale, finalScale, finalScale]}>
    <T.SphereGeometry args={[1, 32, 32]} />
    <T.MeshBasicMaterial 
      color={new Color('#ffd700').lerp(new Color('#ffffff'), heatIntensity * 0.9)} 
      transparent 
      opacity={0.75 + heatIntensity * 0.25} 
    />
  </T.Mesh>
  <!-- Heat distortion ring -->
  <T.Mesh 
    scale={[finalScale * 1.4, finalScale * 1.4, finalScale * 1.4]}
    rotation.x={Math.PI / 2}
  >
    <T.TorusGeometry args={[1, 0.04, 16, 48]} />
    <T.MeshBasicMaterial 
      color={new Color('#ff8c00').lerp(new Color('#fffaf0'), heatIntensity)} 
      transparent 
      opacity={0.4 + heatIntensity * 0.4} 
    />
  </T.Mesh>
{/if}

<!-- Central light burst effect during Big Bang explosion -->
{#if isExploding}
  <T.PointLight
    intensity={chargeIntensity * 100}
    position={[0, 0, 0]}
    color="#ffffff"
    distance={200}
    decay={1}
  />
  <!-- Secondary burst light -->
  <T.PointLight
    intensity={chargeIntensity * 50}
    position={[0, 0, 0]}
    color="#ffd700"
    distance={150}
    decay={1.5}
  />
  <!-- Expanding explosion sphere -->
  <T.Mesh scale={[orbScale, orbScale, orbScale]}>
    <T.SphereGeometry args={[1, 32, 32]} />
    <T.MeshBasicMaterial color="#ffffff" transparent opacity={chargeIntensity * 0.9} />
  </T.Mesh>
{/if}

