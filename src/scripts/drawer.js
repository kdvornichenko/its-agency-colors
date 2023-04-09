const burger = document.querySelector('.header__burger')
const drawer = document.querySelector('.header__drawer')
const overlay = document.querySelector('.overlay')

burger.addEventListener('click', mobMenuToggle)

function mobMenuToggle() {
	drawer.classList.toggle('--active')
	burger.classList.toggle('--active')
	overlayToggle()
}
