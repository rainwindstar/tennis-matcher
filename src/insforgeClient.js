import { createClient } from '@insforge/sdk';

export const insforge = createClient(
  import.meta.env.VITE_INSFORGE_URL,
  import.meta.env.VITE_INSFORGE_ANON_KEY
);
