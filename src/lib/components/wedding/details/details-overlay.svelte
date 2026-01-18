<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { animate } from 'motion';
  import { resolve } from '$app/paths';
  import { staggerReveal, type Direction } from '$lib/actions/motion';
  import EventDetailsCard from './event-details-card.svelte';
  import TitleCouple from './title-couple.svelte';
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

  // Code-gated events
  const SECRET_CODE = 'eef478';
  let isUnlocked = $state(false);
  let showCodeModal = $state(false);
  let codeInput = $state('');
  let codeError = $state(false);
  let codeInputEl = $state.raw<HTMLInputElement | null>(null);

  // Filter events based on unlock status
  const visibleEvents = $derived(
    isUnlocked ? weddingEvents : weddingEvents.filter((e) => e.id === 'Reception')
  );
  const total = $derived(visibleEvents.length);

  const overlayDelayMs = 150; // quick entrance, no Big Bang on this page

  onMount(() => {
    // Check if already unlocked from localStorage
    const stored = localStorage.getItem('wedding-unlocked');
    if (stored === 'true') {
      isUnlocked = true;
    }
    const t = window.setTimeout(() => (isVisible = true), overlayDelayMs);
    return () => window.clearTimeout(t);
  });

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

  function openCodeModal() {
    showCodeModal = true;
    codeInput = '';
    codeError = false;
    tick().then(() => codeInputEl?.focus());
  }

  function closeCodeModal() {
    showCodeModal = false;
    codeInput = '';
    codeError = false;
  }

  function submitCode() {
    if (codeInput.toLowerCase().trim() === SECRET_CODE.toLowerCase()) {
      isUnlocked = true;
      localStorage.setItem('wedding-unlocked', 'true');
      closeCodeModal();
      index = 0; // Reset to first event
    } else {
      codeError = true;
      codeInput = '';
      codeInputEl?.focus();
    }
  }

  function onKeydown(event: KeyboardEvent) {
    if (showCodeModal) {
      if (event.key === 'Escape') {
        closeCodeModal();
      }
      return;
    }
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
        href={resolve('/')}
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
          <div class="mx-auto mb-2 flex justify-center">
            <TitleCouple />
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
          {#if total > 1}
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
          {/if}

          {#key visibleEvents[index]?.id}
            <div bind:this={cardWrap}>
              <EventDetailsCard
                event={visibleEvents[index]}
                {direction}
                {index}
                total={total}
              />
            </div>
          {/key}
        </div>

        <div class="mt-6 flex items-center justify-center gap-3 text-xs text-white/45">
          {#if total > 1}
            <span class="rounded-full border border-white/10 bg-black/20 px-3 py-1 backdrop-blur-md"
              >{index + 1} / {total}</span
            >
          {/if}
        </div>

        <!-- Code unlock button -->
        {#if !isUnlocked}
          <div class="mt-6 flex justify-center">
            <button
              type="button"
              onclick={openCodeModal}
              class="pointer-events-auto group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-white/50 backdrop-blur-md transition hover:border-amber-400/30 hover:bg-black/30 hover:text-amber-200/80"
            >
              <svg class="h-3.5 w-3.5 transition group-hover:text-amber-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Family &amp; Friends</span>
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Code Entry Modal -->
{#if showCodeModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <button
      type="button"
      class="absolute inset-0 bg-black/70 backdrop-blur-sm"
      onclick={closeCodeModal}
      aria-label="Close modal"
    ></button>

    <!-- Modal -->
    <div
      class="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-b from-[#1a1425] to-[#0f0a17] p-8 shadow-2xl"
    >
      <!-- Close button -->
      <button
        type="button"
        onclick={closeCodeModal}
        class="absolute right-4 top-4 rounded-full p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white/70"
        aria-label="Close"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
          <svg class="h-7 w-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h3
          class="font-serif text-xl font-light tracking-wide text-white"
          style="font-family: 'Playfair Display', serif;"
        >
          Family &amp; Friends
        </h3>
        <p class="mt-2 text-xs leading-relaxed text-white/50">
          Enter the code shared with you to view all event details.
        </p>
      </div>

      <form
        class="mt-6"
        onsubmit={(e) => {
          e.preventDefault();
          submitCode();
        }}
      >
        <div class="relative">
          <input
            bind:this={codeInputEl}
            bind:value={codeInput}
            type="text"
            placeholder="Enter code"
            autocomplete="off"
            autocapitalize="off"
            class="w-full rounded-lg border bg-black/30 px-4 py-3 text-center text-sm tracking-widest text-white placeholder-white/30 transition focus:outline-none focus:ring-2 focus:ring-amber-400/50 {codeError ? 'border-rose-400/50 shake' : 'border-white/12 focus:border-amber-400/30'}"
          />
        </div>

        {#if codeError}
          <p class="mt-2 text-center text-xs text-rose-400/80">
            Invalid code. Please try again.
          </p>
        {/if}

        <button
          type="submit"
          class="mt-4 w-full rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-amber-500/40"
        >
          Unlock Events
        </button>
      </form>
    </div>
  </div>
{/if}

<style>
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }
  .shake {
    animation: shake 0.5s ease-in-out;
  }
</style>
