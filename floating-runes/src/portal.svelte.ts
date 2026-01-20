/**
 * Portals the element as a child to another element.
 * 
 * If none is specified, it will be appended to the document body.
*/
export function portal(
	node: HTMLElement,
	/** @default document.body */
	target?: HTMLElement
) {
	// Move the node to the target immediately
	const targetElement = target ?? document.body
	node.parentElement?.removeChild(node)
	targetElement.appendChild(node)

	return {
		destroy() {
			if (node?.parentElement === targetElement) {
				targetElement.removeChild(node)
			}
		}
	}
}