<script lang="ts">
  import type { Direction } from '$lib/actions/motion';
  import { detailsCardEnter } from '$lib/actions/motion';
  import type { WeddingEvent } from './events';

  interface Props {
    event: WeddingEvent;
    direction?: Direction;
    index: number;
    total: number;
  }

  let { event, direction = 'next', index, total }: Props = $props();
</script>

<div
  {@attach detailsCardEnter({ direction })}
  class="card-enter relative overflow-hidden rounded-2xl border border-white/12 bg-black/35 px-7 py-7 shadow-2xl backdrop-blur-md md:px-10 md:py-9"
>
  <!-- subtle sheen -->
  <div
    class="pointer-events-none absolute inset-0 bg-linear-to-b from-white/10 via-white/0 to-transparent opacity-60"
  ></div>

  <div class="relative">
    <div data-motion class="flex items-start justify-between gap-4">
      <div>
        <h2
          class="font-serif text-2xl font-light tracking-wide text-white md:text-3xl"
          style="font-family: 'Playfair Display', serif;"
        >
          {event.title}
        </h2>
        <p class="mt-1 text-xs uppercase tracking-[0.28em] text-amber-200/70">
          Event {index + 1} of {total}
        </p>
      </div>
    </div>

    <div class="mt-6 grid gap-4">
      <div data-motion class="flex items-start gap-3">
        <span class="mt-0.5 text-amber-400">🗓️</span>
        <div>
          <p class="text-sm font-medium text-white/85">{event.date}</p>
          <p class="text-xs text-white/55">{event.time}</p>
        </div>
      </div>

      <div data-motion class="flex items-start gap-3">
        <span class="mt-0.5 text-amber-400">📍</span>
        <div>
          <p class="text-sm font-medium text-white/85">{event.venue}</p>
          {#if event.address}
            <p class="text-xs text-white/55">{event.address}</p>
          {/if}
        </div>
      </div>

      {#if event.dressCode}
        <div data-motion class="flex items-start gap-3">
          <span class="mt-0.5 text-amber-400">👗</span>
          <div>
            <p class="text-sm font-medium text-white/85">Dress code</p>
            <p class="text-xs text-white/55">{event.dressCode}</p>
          </div>
        </div>
      {/if}
    </div>

    {#if event.note || (event.highlights && event.highlights.length > 0)}
      <div data-motion class="mt-6 border-t border-white/10 pt-6">
        {#if event.note}
          <p class="text-sm leading-relaxed text-white/70">{event.note}</p>
        {/if}

        {#if event.highlights && event.highlights.length > 0}
          <ul class="mt-4 space-y-2 text-xs leading-relaxed text-white/60">
            {#each event.highlights as item (item)}
              <li data-motion class="flex gap-2">
                <span class="text-amber-400/80">✦</span>
                <span>{item}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}

    <div data-motion class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {#if event.mapUrl}
        <a
          href={event.mapUrl}
          target="_blank"
          rel="noreferrer"
          class="inline-flex items-center justify-center rounded-lg bg-linear-to-r from-amber-500 to-rose-500 px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-amber-500/40"
        >
          Open in Maps
        </a>
      {/if}

      <p class="text-center text-[10px] uppercase tracking-[0.3em] text-white/35 sm:text-right">
        Use ← → keys or the arrows
      </p>
    </div>
  </div>
</div>

<style>
  /* Prevent flash before Motion animation kicks in */
  .card-enter {
    opacity: 0;
  }
  .card-enter :global([data-motion]) {
    opacity: 0;
  }
</style>

