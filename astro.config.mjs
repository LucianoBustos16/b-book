import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import clerk from '@clerk/astro'; // Import Clerk
import node from '@astrojs/node'; // Import an SSR adapter (Node.js in this case)

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    clerk() // Add Clerk integration
  ],
  adapter: node({ // Add SSR adapter
    mode: 'standalone'
  }),
  output: 'server' // Set output to server
});