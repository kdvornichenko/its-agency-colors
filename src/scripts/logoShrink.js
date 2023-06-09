// Logo shrink
const logo = document.querySelector('.header__logo')
const logoDot = window.getComputedStyle(logo, ':after')

function logoAnimate() {
	const logoAnimateTimeout = setTimeout(() => {
		logo.classList.add('shrink')
		setTimeout(() => {
			logo.classList.add('dot')
		}, 600)
		clearTimeout(logoAnimateTimeout)
	}, 500)
}

logoAnimate()
