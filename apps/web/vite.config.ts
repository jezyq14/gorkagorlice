import tailwindcss from '@tailwindcss/vite';
import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        sentrySvelteKit({
            sourceMapsUploadOptions: {
                org: "szczur-sa",
                project: "gorkagorlice-frontend",
                authToken: process.env.SENTRY_AUTH_TOKEN,
            }
        }),
        tailwindcss(),
        sveltekit()
    ],
});
