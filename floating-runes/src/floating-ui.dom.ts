import { getComputedStyle, isHTMLElement, isElement, getWindow, isWebKit, getFrameElement, getNodeScroll, getDocumentElement, isTopLayer, getNodeName, isOverflowElement, getOverflowAncestors, getParentNode, isLastTraversableNode, isContainingBlock, isTableElement, getContainingBlock } from '@floating-ui/utils/dom'
import { round, createCoords, max, min, floor } from '@floating-ui/utils'
import { rectToClientRect, detectOverflow as detectOverflow$1, offset as offset$1, autoPlacement as autoPlacement$1, shift as shift$1, flip as flip$1, size as size$1, hide as hide$1, arrow as arrow$1, inline as inline$1, limitShift as limitShift$1, computePosition as computePosition$1 } from '@floating-ui/core'
import { Platform } from '@floating-ui/dom'

function unwrapElement(element: Element | { contextElement: Element }) {
	return !isElement(element) ? element.contextElement : element
}

function shouldAddVisualOffsets(element: Element, isFixed, floatingOffsetParent) {
	if (isFixed === void 0) {
		isFixed = false
	}
	if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
		return false
	}
	return isFixed
}

const noOffsets = /*#__PURE__*/createCoords(0)
function getVisualOffsets(element: Element) {
	const win = getWindow(element)
	if (!isWebKit() || !win.visualViewport) {
		return noOffsets
	}
	return {
		x: win.visualViewport.offsetLeft,
		y: win.visualViewport.offsetTop
	}
}

function getScale(element: Element) {
	const domElement = unwrapElement(element)
	if (!isHTMLElement(domElement)) {
		return createCoords(1)
	}
	const rect = domElement.getBoundingClientRect()
	const {
		width,
		height,
		$
	} = getCssDimensions(domElement)
	let x = ($ ? round(rect.width) : rect.width) / width
	let y = ($ ? round(rect.height) : rect.height) / height

	// 0, NaN, or Infinity should always fallback to 1.

	if (!x || !Number.isFinite(x)) {
		x = 1
	}
	if (!y || !Number.isFinite(y)) {
		y = 1
	}
	return {
		x,
		y
	}
}


function getHTMLOffset(
	documentElement: Element, 
	scroll: {
		scrollLeft: number
		scrollTop: number 
	},
	ignoreScrollbarX = false
) {
	if (ignoreScrollbarX === void 0) {
		ignoreScrollbarX = false
	}
	const htmlRect = documentElement.getBoundingClientRect()
	const x = htmlRect.left + scroll.scrollLeft - (ignoreScrollbarX ? 0 :
	// RTL <body> scrollbar.
	getWindowScrollBarX(documentElement, htmlRect))
	const y = htmlRect.top + scroll.scrollTop
	return {
		x,
		y
	}
}

function getWindowScrollBarX(element: Element, rect: DOMRect | undefined = undefined) {
	const leftScroll = getNodeScroll(element).scrollLeft
	if (!rect) {
		return getBoundingClientRect(getDocumentElement(element)).left + leftScroll
	}
	return rect.left + leftScroll
}

function getCssDimensions(element: Element) {
	const css = getComputedStyle(element)
	// In testing environments, the `width` and `height` properties are empty
	// strings for SVG elements, returning NaN. Fallback to `0` in this case.
	let width = parseFloat(css.width) || 0
	let height = parseFloat(css.height) || 0
	const hasOffset = isHTMLElement(element)
	const offsetWidth = hasOffset ? element.offsetWidth : width
	const offsetHeight = hasOffset ? element.offsetHeight : height
	const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight
	if (shouldFallback) {
		width = offsetWidth
		height = offsetHeight
	}
	return {
		width,
		height,
		$: shouldFallback
	}
}

function getBoundingClientRect(
	element: Element,
	includeScale = false,
	isFixedStrategy = false,
	offsetParent: Element | undefined = undefined
) {
	if (includeScale === void 0) {
		includeScale = false
	}
	if (isFixedStrategy === void 0) {
		isFixedStrategy = false
	}
	const clientRect = element.getBoundingClientRect()
	const domElement = unwrapElement(element)
	let scale = createCoords(1)
	if (includeScale) {
		if (offsetParent) {
			if (isElement(offsetParent)) {
				scale = getScale(offsetParent)
			}
		} else {
			scale = getScale(element)
		}
	}
	const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) 
		? getVisualOffsets(domElement) 
		: createCoords(0)
	let x = (clientRect.left + visualOffsets.x) / scale.x
	let y = (clientRect.top + visualOffsets.y) / scale.y
	let width = clientRect.width / scale.x
	let height = clientRect.height / scale.y
	if (domElement) {
		const win = getWindow(domElement)
		const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent
		let currentWin = win
		let currentIFrame = getFrameElement(currentWin)
		while (currentIFrame && offsetParent && offsetWin !== currentWin) {
			const iframeScale = getScale(currentIFrame)
			const iframeRect = currentIFrame.getBoundingClientRect()
			const css = getComputedStyle(currentIFrame)
			const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x
			const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y
			x *= iframeScale.x
			y *= iframeScale.y
			width *= iframeScale.x
			height *= iframeScale.y
			x += left
			y += top
			currentWin = getWindow(currentIFrame)
			currentIFrame = getFrameElement(currentWin)
		}
	}
	return rectToClientRect({
		width,
		height,
		x,
		y
	})
}

function getRectRelativeToOffsetParent(
	element: Element, 
	offsetParent: Element, 
	strategy: 'fixed' | 'absolute' = 'absolute'
) {
	const isOffsetParentAnElement = isHTMLElement(offsetParent)
	const documentElement = getDocumentElement(offsetParent)
	const isFixed = strategy === 'fixed'
	const rect = getBoundingClientRect(element, true, isFixed, offsetParent)
	let scroll = {
		scrollLeft: 0,
		scrollTop: 0
	}
	const offsets = createCoords(0)
	if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
		if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
			scroll = getNodeScroll(offsetParent)
		}
		if (isOffsetParentAnElement) {
			const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent)
			offsets.x = offsetRect.x + offsetParent.clientLeft
			offsets.y = offsetRect.y + offsetParent.clientTop
		} else if (documentElement) {
			// If the <body> scrollbar appears on the left (e.g. RTL systems). Use
			// Firefox with layout.scrollbar.side = 3 in about:config to test this.
			offsets.x = getWindowScrollBarX(documentElement)
		}
	}
	const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0)
	const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x
	const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y
	return {
		x,
		y,
		width: rect.width,
		height: rect.height
	}
}

function isStaticPositioned(element: Element) {
	return getComputedStyle(element).position === 'static'
}
  
function getTrueOffsetParent(element: Element, polyfill) {
	if (!isHTMLElement(element) || getComputedStyle(element).position === 'fixed') {
		return null
	}
	if (polyfill) {
		return polyfill(element)
	}
	let rawOffsetParent = element.offsetParent
  
	// Firefox returns the <html> element as the offsetParent if it's non-static,
	// while Chrome and Safari return the <body> element. The <body> element must
	// be used to perform the correct calculations even if the <html> element is
	// non-static.
	if (getDocumentElement(element) === rawOffsetParent) {
		rawOffsetParent = rawOffsetParent.ownerDocument.body
	}

	return rawOffsetParent
}

// Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.
function getOffsetParent(element: Element, polyfill) {
	const win = getWindow(element)
	if (isTopLayer(element)) {
		return win
	}
	if (!isHTMLElement(element)) {
		let svgOffsetParent = getParentNode(element)
		while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
			if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
				return svgOffsetParent
			}
			svgOffsetParent = getParentNode(svgOffsetParent)
		}
		return win
	}
	let offsetParent = getTrueOffsetParent(element, polyfill)
	while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
		offsetParent = getTrueOffsetParent(offsetParent, polyfill)
	}
	if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
		return win
	}
	return offsetParent || getContainingBlock(element) || win
}

export const getElementRects = async function(
	this: Platform, 
	data: {
		floating: Element
		reference: Element
		strategy?: 'absolute' | 'fixed'
	}
) {
	const getOffsetParentFn = this.getOffsetParent || getOffsetParent
	const getDimensionsFn = this.getDimensions
	const floatingDimensions = await getDimensionsFn(data.floating)
	const offsetParent = await getOffsetParentFn(data.floating)

	return {
		reference: getRectRelativeToOffsetParent(data.reference, offsetParent as Element, data.strategy),
		floating: {
			x: 0,
			y: 0,
			width: floatingDimensions.width,
			height: floatingDimensions.height
		}
	}
}