<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { resolve } from '$app/paths';
  import { animate } from 'motion';

  interface Props {
    groomName: string;
    brideName: string;
    date: string;
    time: string;
  }

  let {
    groomName,
    brideName,
    date,
    time,
  }: Props = $props();

  let isVisible = $state(false);
  let isHovered = $state(false);

  // Element refs for Motion animations
  let dividerEl = $state.raw<HTMLDivElement | null>(null);
  let timeEl = $state.raw<HTMLSpanElement | null>(null);
  let btnEl = $state.raw<HTMLAnchorElement | null>(null);
  let btnTextEl = $state.raw<HTMLSpanElement | null>(null);

  // Smooth ease-out curve for elegant feel
  const easeOut = [0.16, 1, 0.3, 1] as const;
  const easeIn = [0.4, 0, 0.2, 1] as const;

  onMount(() => {
    setTimeout(() => (isVisible = true), 4000);
  });

  async function handleMouseEnter() {
    if (!isVisible) return;
    isHovered = true;

    const duration = 0.5;
    const isMobile = window.innerWidth < 640;

    await tick();

    // Smooth expansion - all in sync
    if (timeEl) {
      animate(timeEl, { opacity: 1, maxWidth: isMobile ? '160px' : '220px' }, { duration, ease: easeOut });
    }
    // Button expands, text fades in smoothly
    if (btnEl) {
      animate(btnEl, { width: isMobile ? '72px' : '90px' }, { duration, ease: easeOut });
    }
    if (btnTextEl) {
      animate(btnTextEl, { opacity: 1 }, { duration: duration * 0.8, ease: easeOut });
    }
  }

  async function handleMouseLeave() {
    isHovered = false;

    const duration = 0.3;
    const isMobile = window.innerWidth < 640;

    await tick();

    // Text fades out first, then button collapses
    if (btnTextEl) {
      animate(btnTextEl, { opacity: 0 }, { duration: duration * 0.6, ease: easeIn });
    }
    if (btnEl) {
      animate(btnEl, { width: isMobile ? '24px' : '28px' }, { duration, ease: easeIn });
    }
    if (timeEl) {
      animate(timeEl, { opacity: 0, maxWidth: '0px' }, { duration, ease: easeIn });
    }
  }
</script>

<div
  class="pointer-events-none absolute inset-0 flex flex-col items-center justify-between px-4 py-6 sm:px-6 sm:py-8 md:py-12"
>
  <!-- Top Section - Names -->
  <div
    class="w-full text-center transition-all duration-1000 ease-out {isVisible
      ? 'translate-y-0 opacity-100'
      : '-translate-y-10 opacity-0'}"
  >
    <p
      class="mx-auto mb-3 max-w-[280px] font-sans text-[10px] font-light uppercase leading-relaxed tracking-[0.25em] text-amber-200/70 sm:mb-4 sm:max-w-none sm:text-xs sm:tracking-[0.4em] md:mb-8 md:text-sm"
    >
      You are cordially invited to celebrate the wedding of
    </p>
    <h1
      class="font-serif text-4xl font-light tracking-wide text-white drop-shadow-[0_0_40px_rgba(255,215,0,0.25)] sm:text-5xl sm:drop-shadow-[0_0_60px_rgba(255,215,0,0.3)] md:text-7xl lg:text-8xl"
    >
      <span class="block">{groomName}</span>
      <span
        class="my-1 block font-sans text-base font-extralight tracking-[0.4em] text-amber-300/60 sm:my-2 sm:text-xl sm:tracking-[0.5em] md:my-4 md:text-2xl"
        >&</span
      >
      <span class="block">{brideName}</span>
    </h1>
  </div>

  <!-- Middle Section - Interaction Hint -->
  <div
    class="text-center transition-all delay-500 duration-1000 ease-out {isVisible
      ? 'scale-100 opacity-100'
      : 'scale-95 opacity-0'}"
  >
    <div class="relative">
      <div
        class="absolute -inset-4 animate-pulse rounded-full bg-linear-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 blur-xl"
      ></div>
      <p class="relative font-sans text-xs font-light tracking-widest text-white/40 sm:text-sm md:text-base">
        ✦ Click & hold to celebrate ✦
      </p>
    </div>
  </div>

  <!-- Bottom Section - Compact Expandable Card -->
  <div class="pointer-events-auto flex flex-col items-center gap-3 px-4 sm:gap-4 sm:px-6">
    <!-- Compact Card -->
    <div
      role="group"
      onmouseenter={handleMouseEnter}
      onmouseleave={handleMouseLeave}
      class="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2.5 shadow-2xl backdrop-blur-md transition-all delay-700 duration-1000 ease-out backface-hidden sm:gap-3 sm:px-5 sm:py-3 {isVisible
        ? 'translate-y-0 opacity-100'
        : 'translate-y-10 opacity-[0.01]'}"
    >
      <!-- Date (always visible) -->
      <span class="whitespace-nowrap font-serif text-sm font-light leading-none tracking-wide text-amber-100 -translate-y-0.5">
        {date}
      </span>

      <!-- Divider (hidden by default, expands via width) -->
      <div
        bind:this={dividerEl}
        class={{"h-3.5 origin-center bg-amber-400/40 sm:h-4 w-px ": true }}
      ></div>

      <!-- Time (hidden by default, expands via max-width) -->
      {#if isHovered && isVisible}
      <span
        bind:this={timeEl}
        class="overflow-hidden whitespace-nowrap text-[11px] font-light leading-none tracking-wider text-white/60 sm:text-xs"
        style="max-width: 0; opacity: 0;"
      >
        {time}
      </span>
      {/if}

      <!-- Compact Details Button -->
      <a
        bind:this={btnEl}
        href={resolve('/details')}
        class="relative flex h-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-400/30 bg-amber-400/5 text-amber-200/80 transition-colors duration-200 hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-200 sm:h-7"
        style="width: 24px;"
      >
        <!-- Text positioned to left of icon, hidden by default -->
        <span
          bind:this={btnTextEl}
          class="absolute inset-y-0 left-2 flex items-center whitespace-nowrap text-[9px] font-medium uppercase tracking-widest sm:left-2.5 sm:text-[10px] sm:tracking-[0.12em]"
          style="opacity: 0;"
        >
          Details
        </span>
        <!-- Icon always visible, centered when collapsed, right when expanded -->
        <span class="absolute inset-y-0 right-1 flex items-center sm:right-1.5">
          <svg
            class="h-2.5 w-2.5 sm:h-3 sm:w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </a>
    </div>

    <!-- Decorative Elements -->
    <div
      class="flex items-center justify-center gap-3 transition-opacity delay-700 duration-1000 sm:gap-4 {isVisible
        ? 'opacity-100'
        : 'opacity-0'}"
    >
      <span class="text-base text-amber-400/30 sm:text-lg">✦</span>
      <span class="font-sans text-[8px] uppercase tracking-[0.25em] text-white/30 sm:text-[9px] sm:tracking-[0.3em]"
        >Forever begins here</span
      >
      <span class="text-base text-amber-400/30 sm:text-lg">✦</span>
    </div>
  </div>
</div>

