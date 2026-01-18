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
    <div class="pointer-events-auto absolute left-5 top-5 z-20 md:left-8 md:top-8">
      <a
        href={resolve('/')}
        class="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/25 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/70 backdrop-blur-md transition hover:border-white/20 hover:bg-black/35 hover:text-white"
      >
        <span aria-hidden="true">←</span>
        <span>Back</span>
      </a>
    </div>

    <div class="pointer-events-auto absolute inset-0 overflow-y-auto px-6 py-16 md:py-10">
      <div class="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center">
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
              class="pointer-events-auto group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-white/8 bg-white/3 px-5 py-2.5 text-[10px] uppercase tracking-[0.3em] text-white/45 backdrop-blur-sm transition-all duration-500 hover:border-amber-400/20 hover:bg-amber-950/20 hover:text-amber-200/70"
            >
              <!-- Subtle pulse glow -->
              <span class="absolute inset-0 rounded-full bg-amber-400/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
              <span class="relative flex items-center gap-2.5">
                <span class="flex h-5 w-5 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/5">
                  <svg class="h-2.5 w-2.5 text-amber-400/60 transition-colors group-hover:text-amber-300/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <span>Family &amp; Friends</span>
                <span class="text-amber-400/30 transition-colors group-hover:text-amber-400/50">✦</span>
              </span>
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
      class="absolute inset-0 bg-black/80 backdrop-blur-md"
      onclick={closeCodeModal}
      aria-label="Close modal"
    ></button>

    <!-- Modal -->
    <div
      class="modal-enter relative w-full max-w-[340px] overflow-hidden rounded-3xl border border-white/8 bg-linear-to-b from-[#12101a] via-[#0d0b12] to-[#080710] p-1 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8)]"
    >
      <!-- Inner glow border -->
      <div class="absolute inset-0 rounded-3xl bg-linear-to-b from-amber-400/8 via-transparent to-transparent"></div>
      
      <!-- Content wrapper -->
      <div class="relative rounded-[22px] bg-linear-to-b from-white/2 to-transparent px-8 py-9">
        <!-- Close button -->
        <button
          type="button"
          onclick={closeCodeModal}
          class="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full border border-white/6 bg-white/2 text-white/30 transition-all duration-300 hover:border-white/15 hover:bg-white/5 hover:text-white/60"
          aria-label="Close"
        >
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="text-center">
          <!-- Decorative icon container -->
          <div class="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
            <!-- Outer ring -->
            <div class="absolute inset-0 rounded-full border border-amber-400/10"></div>
            <!-- Inner glow -->
            <div class="absolute inset-2 rounded-full bg-linear-to-b from-amber-400/10 to-amber-600/5"></div>
            <!-- Icon -->
            <svg class="relative h-6 w-6 text-amber-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <!-- Decorative stars -->
          <div class="mb-3 flex items-center justify-center gap-3">
            <span class="text-[10px] text-amber-400/25">✦</span>
            <span class="h-px w-8 bg-linear-to-r from-transparent via-amber-400/20 to-transparent"></span>
            <span class="text-[10px] text-amber-400/40">✦</span>
            <span class="h-px w-8 bg-linear-to-r from-transparent via-amber-400/20 to-transparent"></span>
            <span class="text-[10px] text-amber-400/25">✦</span>
          </div>

          <h3
            class="font-serif text-[22px] font-light tracking-wide text-white/95"
            style="font-family: 'Playfair Display', serif;"
          >
            Family &amp; Friends
          </h3>
          <p class="mx-auto mt-2.5 max-w-[220px] text-[11px] leading-relaxed text-white/40">
            Enter the code shared with you to view all event details
          </p>
        </div>

        <form
          class="mt-7"
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
              placeholder="• • • • • •"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              class="w-full rounded-xl border bg-black/40 px-5 py-4 text-center font-mono text-sm tracking-[0.4em] text-amber-100/90 placeholder-white/20 transition-all duration-300 focus:outline-none {codeError ? 'border-rose-400/40 shake' : 'border-white/6 focus:border-amber-400/30 focus:bg-black/50 focus:shadow-[0_0_0_4px_rgba(251,191,36,0.05)]'}"
            />
          </div>

          {#if codeError}
            <p class="mt-3 text-center text-[11px] text-rose-400/70">
              Invalid code — please try again
            </p>
          {/if}

          <button
            type="submit"
            class="group relative mt-5 w-full overflow-hidden rounded-xl border border-amber-400/20 bg-linear-to-b from-amber-500/15 to-amber-600/10 px-5 py-4 text-[11px] font-medium uppercase tracking-[0.25em] text-amber-200/90 transition-all duration-500 hover:border-amber-400/35 hover:from-amber-500/25 hover:to-amber-600/15 hover:text-amber-100 hover:shadow-[0_10px_40px_-10px_rgba(251,191,36,0.2)]"
          >
            <!-- Shimmer effect -->
            <span class="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-amber-400/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"></span>
            <span class="relative flex items-center justify-center gap-2">
              <span>Unlock Events</span>
              <svg class="h-3 w-3 text-amber-400/60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-amber-300/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </button>
        </form>
        
        <!-- Bottom decorative element -->
        <div class="mt-7 flex items-center justify-center">
          <span class="text-[9px] uppercase tracking-[0.35em] text-white/20">Private invitation</span>
        </div>
      </div>
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
  
  @keyframes modal-enter {
    0% { 
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    100% { 
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  .modal-enter {
    animation: modal-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
