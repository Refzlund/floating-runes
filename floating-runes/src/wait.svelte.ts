let map = new WeakMap<Node, ReturnType<typeof wait>>()

export const wait = (ms: number) => {
	let anchor: Node | undefined
	try {
		anchor = eval('node')
	} catch (error) {
		console.error(error)
	}
	
	console.log(anchor)

	if(anchor) {
		let wait = map.get(anchor)
		if(wait) {
			return wait
		}
	}

	var awaited = $state(false)
	let cancelled = $state(false)
	let timeoutId: ReturnType<typeof setTimeout> | null = null

	const wait = {
		get awaited() {
			return awaited
		},
		get cancelled() { return cancelled },
		cancel: () => {
			cancelled = true
			if (timeoutId) {
				clearTimeout(timeoutId)
			}
		},
		promise: new Promise(res => {
			timeoutId = setTimeout(() => {
				if (cancelled) return
				res(true)
				console.log('true')
				awaited = true
			}, ms)
		})
	}

	if(anchor) {
		map.set(anchor, wait)
	}
	return wait
}