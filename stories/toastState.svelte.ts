/**
 * Toast state management using Svelte 5 runes
 * 
 * This file uses .svelte.ts extension to enable rune reactivity at module level.
 */

export type ToastType = 'info' | 'success' | 'error' | 'warning'

export interface Toast {
	id: number
	message: string
	type: ToastType
	duration: number
}

export interface ToastOptions {
	type?: ToastType
	duration?: number
}

// Reactive state using $state rune (works in .svelte.ts files)
let toasts = $state<Toast[]>([])
let nextId = 0

/**
 * Create a toast notification
 */
function createToast(message: string, options: ToastOptions = {}) {
	const { type = 'info', duration = 3000 } = options
	
	const id = nextId++
	const newToast: Toast = { id, message, type, duration }
	
	// Direct mutation works with $state in .svelte.ts
	toasts.push(newToast)
	
	if (duration > 0) {
		setTimeout(() => {
			dismiss(id)
		}, duration)
	}
	
	return id
}

function dismiss(id: number) {
	const index = toasts.findIndex(t => t.id === id)
	if (index !== -1) {
		toasts.splice(index, 1)
	}
}

function dismissAll() {
	toasts.length = 0
}

export const toast = Object.assign(createToast, {
	success: (message: string, options?: Omit<ToastOptions, 'type'>) => 
		createToast(message, { ...options, type: 'success' }),
	error: (message: string, options?: Omit<ToastOptions, 'type'>) => 
		createToast(message, { ...options, type: 'error' }),
	warning: (message: string, options?: Omit<ToastOptions, 'type'>) => 
		createToast(message, { ...options, type: 'warning' }),
	info: (message: string, options?: Omit<ToastOptions, 'type'>) => 
		createToast(message, { ...options, type: 'info' }),
	dismiss,
	dismissAll,
	/** Reactive getter for current toasts */
	get items() { return toasts }
})
