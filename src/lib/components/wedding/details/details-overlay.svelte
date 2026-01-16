<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { animate } from 'motion';
  import { resolve } from '$app/paths';
  import { staggerReveal, type Direction } from '$lib/actions/motion';
  import EventDetailsCard from './event-details-card.svelte';
  import TitleStar from './title-star.svelte';
  import { weddingEvents } from './events';

  interface Props {
    groomName?: string;
    brideName?: string;
  }

  let { groomName = 'Nikhil', brideName = 'Pooja' }: Props = $props();

  let isVisible = $state(false);
  let index = $state(0);
  let direction = $state<Direction>('next');
  let isAnimating = $state(false);
  let cardWrap = $state.raw<HTMLDivElement | null>(null);

  const overlayDelayMs = 150; // quick entrance, no Big Bang on this page

  onMount(() => {
    const t = window.setTimeout(() => (isVisible = true), overlayDelayMs);
    return () => window.clearTimeout(t);
  });

  const total = weddingEvents.length;

  function wrap(i: number) {
    if (total === 0) return 0;
    return ((i % total) + total) % total;
  }

  async function go(dir: Direction) {
    if (!isVisible || isAnimating || total < 2) return;
    isAnimating = true;
    direction = dir;

    const outX = dir === 'next' ? -28 : 28;
    if (cardWrap) {
      const controls = animate(
        cardWrap,
        { opacity: [1, 0], x: [0, outX], filter: ['blur(0px)', 'blur(10px)'] } as any,
        { duration: 0.22, ease: [0.4, 0, 1, 1] }
      );
      await controls.finished;
    }

    index = wrap(index + (dir === 'next' ? 1 : -1));
    await tick();
    isAnimating = false;
  }

  function onKeydown(event: KeyboardEvent) {
    if (!isVisible) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      void go('next');
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      void go('prev');
    } else if (event.key === 'Escape') {
      history.back();
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="pointer-events-none absolute inset-0">
  <!-- readability wash -->
  <div
    class="pointer-events-none absolute inset-0 bg-linear-to-b from-black/70 via-black/25 to-black/70"
  ></div>

  {#if isVisible}
    <div class="pointer-events-auto absolute left-5 top-5 md:left-8 md:top-8">
      <a
        href={resolve('/attempt-2')}
        class="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/25 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/70 backdrop-blur-md transition hover:border-white/20 hover:bg-black/35 hover:text-white"
      >
        <span aria-hidden="true">←</span>
        <span>Back</span>
      </a>
    </div>

    <div class="absolute inset-0 flex items-center justify-center px-6 py-10">
      <div class="w-full max-w-2xl">
        <header
          {@attach staggerReveal({ selector: '[data-motion]', delay: 0.05 })}
          class="mb-6 text-center"
        >
          <div class="mx-auto mb-3 flex justify-center">
            <TitleStar />
          </div>
          <h1
            data-motion
            class="font-serif text-3xl font-light tracking-wide text-white md:text-4xl"
            style="font-family: 'Playfair Display', serif; text-shadow: 0 0 50px rgba(255, 215, 0, 0.22);"
          >
            Event Details
          </h1>
          <p data-motion class="mt-2 text-xs uppercase tracking-[0.35em] text-amber-200/70">
            {groomName} & {brideName}
          </p>
        </header>

        <div class="relative">
          <!-- Prev -->
          <button
            type="button"
            aria-label="Previous event"
            disabled={isAnimating}
            onclick={() => go('prev')}
            class="pointer-events-auto absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12 bg-black/30 p-3 text-white/80 shadow-lg backdrop-blur-md transition hover:border-white/20 hover:bg-black/45 hover:text-white disabled:opacity-40 disabled:hover:bg-black/30 md:-translate-x-2/3"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <!-- Next -->
          <button
            type="button"
            aria-label="Next event"
            disabled={isAnimating}
            onclick={() => go('next')}
            class="pointer-events-auto absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12 bg-black/30 p-3 text-white/80 shadow-lg backdrop-blur-md transition hover:border-white/20 hover:bg-black/45 hover:text-white disabled:opacity-40 disabled:hover:bg-black/30 md:translate-x-2/3"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {#key weddingEvents[index]?.id}
            <div bind:this={cardWrap}>
              <EventDetailsCard
                event={weddingEvents[index]}
                {direction}
                {index}
                total={total}
              />
            </div>
          {/key}
        </div>

        <div class="mt-6 flex items-center justify-center gap-3 text-xs text-white/45">
          <span class="rounded-full border border-white/10 bg-black/20 px-3 py-1 backdrop-blur-md"
            >{index + 1} / {total}</span
          >
        </div>
      </div>
    </div>
  {/if}
</div>

