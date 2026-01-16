<script lang="ts">
  import WeddingShell from './shell.svelte';
  import WeddingUI from './wedding-ui.svelte';

  interface Props {
    groomName?: string;
    brideName?: string;
    date?: string;
    time?: string;
  }

  let {
    groomName = 'Nikhil',
    brideName = 'Pooja',
    date = 'January 24, 2026',
    time = "Seven o'clock in the evening",
  }: Props = $props();
</script>

<WeddingShell>
  <WeddingUI {groomName} {brideName} {date} {time} />
</WeddingShell>

