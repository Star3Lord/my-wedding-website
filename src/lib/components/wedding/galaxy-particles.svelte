<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import {
    BufferGeometry,
    Float32BufferAttribute,
    Vector3,
    AdditiveBlending,
    Color,
    ShaderMaterial,
  } from 'three';

  interface Props {
    particleCount?: number;
    innerRadius?: number;
    outerRadius?: number;
  }

  let { particleCount = 100000, innerRadius = 10, outerRadius = 40 }: Props = $props();

  // Time uniform for animation
  let time = $state(0);

  // Create particle geometry with positions, sizes, and shift values
  function createParticleGeometry() {
    const positions: number[] = [];
    const sizes: number[] = [];
    const shifts: number[] = [];

    // Inner sphere particles (around the groom)
    const sphereCount = Math.floor(particleCount * 0.33);
    for (let i = 0; i < sphereCount; i++) {
      const vec = new Vector3().randomDirection().multiplyScalar(Math.random() * 0.5 + 9.5);
      positions.push(vec.x, vec.y, vec.z);
      sizes.push(Math.random() * 1.5 + 0.5);
      shifts.push(
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2,
        (Math.random() * 0.9 + 0.1) * Math.PI * 0.1,
        Math.random() * 0.9 + 0.1
      );
    }

    // Disk particles (galaxy ring)
    const diskCount = particleCount - sphereCount;
    for (let i = 0; i < diskCount; i++) {
      const rand = Math.pow(Math.random(), 1.5);
      const radius = Math.sqrt(
        outerRadius * outerRadius * rand + (1 - rand) * innerRadius * innerRadius
      );
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 2;

      positions.push(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
      sizes.push(Math.random() * 1.5 + 0.5);
      shifts.push(
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2,
        (Math.random() * 0.9 + 0.1) * Math.PI * 0.1,
        Math.random() * 0.9 + 0.1
      );
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('aShift', new Float32BufferAttribute(shifts, 4));

    return geometry;
  }

  const geometry = createParticleGeometry();

  // Custom shader material for the galaxy particles
  const vertexShader = `
    uniform float uTime;
    uniform float uSize;
    
    attribute float aSize;
    attribute vec4 aShift;
    
    varying vec3 vColor;
    
    #define PI 3.14159265359
    #define PI2 6.28318530718
    
    void main() {
      vec3 pos = position;
      
      // Animated displacement
      float t = uTime;
      float moveT = mod(aShift.x + aShift.z * t, PI2);
      float moveS = mod(aShift.y + aShift.z * t, PI2);
      pos += vec3(cos(moveS) * sin(moveT), cos(moveT), sin(moveS) * sin(moveT)) * aShift.w;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = uSize * aSize * (300.0 / -mvPosition.z);
      
      // Color based on distance - warm gold to rose gold gradient
      float d = length(abs(position) / vec3(40.0, 10.0, 40.0));
      d = clamp(d, 0.0, 1.0);
      vec3 colorInner = vec3(1.0, 0.84, 0.5);   // Warm gold
      vec3 colorOuter = vec3(0.92, 0.6, 0.7);   // Rose gold/pink
      vColor = mix(colorInner, colorOuter, d);
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float alpha = smoothstep(0.5, 0.1, d);
      
      if (alpha < 0.01) discard;
      
      gl_FragColor = vec4(vColor, alpha);
    }
  `;

  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 0.15 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  let rotation = $state(0);

  useTask((delta) => {
    time += delta * 0.5;
    rotation += delta * 0.05;
    material.uniforms.uTime.value = time * Math.PI;
  });
</script>

<T.Points
  {geometry}
  {material}
  rotation.z={0.2}
  rotation.y={rotation}
  rotation.order="ZYX"
/>

