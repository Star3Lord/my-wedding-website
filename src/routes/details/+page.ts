import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
  const groomName = url.searchParams.get('groom') ?? 'Nikhil';
  const brideName = url.searchParams.get('bride') ?? 'Pooja';

  return {
    groomName,
    brideName,
  };
};

