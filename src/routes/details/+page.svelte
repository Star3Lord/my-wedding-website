<script lang="ts">
  import DetailsOverlay from '$lib/components/wedding/details/details-overlay.svelte';

  let { data } = $props();
</script>

<svelte:head>
  <title>{data.groomName} &amp; {data.brideName} | Event Details</title>
  <meta
    name="description"
    content="Event details for the wedding celebration of {data.groomName} & {data.brideName}"
  />
</svelte:head>

<div class="relative h-screen w-screen overflow-hidden bg-[#0a0612]">
  <DetailsOverlay groomName={data.groomName} brideName={data.brideName} />
</div>

