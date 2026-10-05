// Mobil klaviatura balandligini --kb CSS o'zgaruvchisiga yozadi (px).
// Android Chrome (interactive-widget=resizes-content) da sahifaning o'zi qisqaradi va --kb = 0 bo'ladi;
// iOS Safari da esa visualViewport qisqaradi, yopishqoq panellar --kb bilan klaviatura ustiga ko'tariladi.
export function trackKeyboard(): () => void {
	const vv = window.visualViewport;
	if (!vv) return () => {};
	const update = () => {
		const kb = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
		document.documentElement.style.setProperty('--kb', `${kb}px`);
		document.documentElement.style.setProperty('--safe-b', kb > 0 ? '0px' : 'env(safe-area-inset-bottom, 0px)');
	};
	update();
	vv.addEventListener('resize', update);
	vv.addEventListener('scroll', update);
	return () => {
		vv.removeEventListener('resize', update);
		vv.removeEventListener('scroll', update);
		document.documentElement.style.removeProperty('--kb');
		document.documentElement.style.removeProperty('--safe-b');
	};
}
