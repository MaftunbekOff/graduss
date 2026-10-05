import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// ssr=false (faqat klient): statik SPA, barcha yo'llar index.html'ga qaytadi (nginx try_files).
			adapter: adapter({ fallback: 'index.html' })
		})
	],
	server: {
		// Dev rejimda (VITE_API=1) /api so'rovlari lokal backendga boradi; production'da nginx shuni qiladi.
		proxy: { '/api': 'http://127.0.0.1:8095' }
	}
});
