function overlayToggle() {
	overlay.classList.toggle('--active')
	document.documentElement.classList.toggle('overflow-hidden')
	if (overlay.classList.contains('--active')) {
		overlay.style.zIndex = '9'
	} else {
		drawer.classList.remove('--active')
		burger.classList.remove('--active')
		catalogProductsSortList.classList.remove('--active')
		filter.classList.remove('--active')
		cart.classList.remove('--active')
		filter.style.bottom = '-100%'
		setTimeout(() => {
			overlay.style.zIndex = '-1'
		}, 300)
	}
}

overlay.addEventListener('click', overlayToggle)
