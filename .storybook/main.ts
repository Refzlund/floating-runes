import type { StorybookConfig } from '@storybook/svelte-vite'
import { resolve } from 'path'

const config: StorybookConfig = {
	framework: '@storybook/svelte-vite',
	stories: ['../stories/**/*.stories.svelte'],
	addons: [
		'@storybook/addon-svelte-csf',
		'@storybook/addon-docs',
		'@storybook/addon-links',
		'@storybook/addon-a11y',
	],
	async viteFinal(config) {
		const { default: tailwindcss } = await import('@tailwindcss/vite')

		config.plugins = config.plugins ?? []
		config.plugins.push(tailwindcss())

		// Resolve the workspace package
		config.resolve = config.resolve ?? {}
		config.resolve.alias = config.resolve.alias ?? {}

		// @ts-expect-error -- alias is a record
		config.resolve.alias['floating-runes'] = resolve(__dirname, '../floating-runes/src/index.ts')

		// Fix for Bun's hardlink module structure - force optimization of @storybook/svelte
		config.optimizeDeps = config.optimizeDeps ?? {}
		config.optimizeDeps.include = config.optimizeDeps.include ?? []
		config.optimizeDeps.include.push('@storybook/svelte')

		// Disable the HMR overlay to hide the errors in browser
		config.server = config.server ?? {}
		config.server.hmr = config.server.hmr === true ? {} : config.server.hmr ?? {}
		if (typeof config.server.hmr === 'object') {
			config.server.hmr.overlay = false
		}

		// Don't auto-open browser
		config.server.open = false

		return config
	}
}

export default config
