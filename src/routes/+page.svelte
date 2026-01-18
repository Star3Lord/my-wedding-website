<script lang="ts">
  import { WeddingApp } from '$lib/components/wedding';

  let groom_name = $state('Nikhil');
  let bride_name = $state('Pooja');
</script>

<svelte:head>
  <title>{groom_name} & {bride_name} | Wedding Invitation</title>
  <meta name="description" content="You're invited to celebrate the wedding of {groom_name} & {bride_name}" />
</svelte:head>

<WeddingApp groomName={groom_name} brideName={bride_name} />

