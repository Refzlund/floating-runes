export interface OverlayOptions {
	/**
	 * Whether to lock body scroll when the overlay is mounted.
	 * @default true
	 */
	lockScroll?: boolean
}

/**
 * Creates an overlay backdrop with optional scroll locking.
 * Useful for modals and dialogs to dim content and prevent scroll.
 * 
 * @example
 * ```svelte
 * <div use:overlay class="backdrop"></div>
 * <div use:float>Modal content</div>
 * ```
 */
export function overlay(
	node: HTMLElement,
	options: OverlayOptions = {}
) {
	const { lockScroll = true } = options

	let scrollbarWidth = 0
	let originalStyles: {
		overflow: string
		paddingRight: string
	} | undefined

	function lock() {
		if (!lockScroll) return

		// Calculate scrollbar width to prevent layout shift
		scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

		// Store original styles
		originalStyles = {
			overflow: document.body.style.overflow,
			paddingRight: document.body.style.paddingRight
		}

		// Apply scroll lock
		document.body.style.overflow = 'hidden'
		if (scrollbarWidth > 0) {
			document.body.style.paddingRight = `${scrollbarWidth}px`
		}
	}

	function unlock() {
		if (!lockScroll || !originalStyles) return

		// Restore original styles
		document.body.style.overflow = originalStyles.overflow
		document.body.style.paddingRight = originalStyles.paddingRight
		originalStyles = undefined
	}

	// Apply base overlay styles if not already set
	if (!node.style.position) {
		Object.assign(node.style, {
			position: 'fixed',
			inset: '0'
		})
	}

	lock()

	const destroy = () => {
		unlock()
	}

	return { destroy }
}
