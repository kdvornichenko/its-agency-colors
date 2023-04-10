window.addEventListener('DOMContentLoaded', () => {
	const sliderContent = document.querySelector('.slider__content')
	const sliderDotsContainer = document.querySelector('.slider__dots')
	const sliderPrev = document.querySelector('.slider__arrows-prev')
	const sliderNext = document.querySelector('.slider__arrows-next')
	const slides = sliderContent.querySelectorAll('img')
	const sliderCount = slides.length

	// Генерация точек, в зависимости от кол-ва слайдов
	for (let i = 0; i < sliderCount; i++) {
		const dot = document.createElement('span')
		dot.classList.add('slider__dots-item')
		if (i === 0) {
			dot.classList.add('active')
		}
		sliderDotsContainer.appendChild(dot)
	}

	const sliderDots = document.querySelectorAll('.slider__dots-item')

	let currentSlide = 0

	function setActiveDot(index) {
		sliderDots[currentSlide].classList.remove('active')
		sliderDots[index].classList.add('active')
	}

	function switchSlide(index) {
		sliderContent.style.transform = `translateX(-${
			slides[0].clientWidth * index
		}px)`
		setActiveDot(index)
		currentSlide = index
	}

	sliderPrev.addEventListener('click', () => {
		if (currentSlide === 0) {
			switchSlide(sliderCount - 1)
		} else {
			switchSlide(currentSlide - 1)
		}
	})

	sliderNext.addEventListener('click', () => {
		if (currentSlide === sliderCount - 1) {
			switchSlide(0)
		} else {
			switchSlide(currentSlide + 1)
		}
	})

	sliderDots.forEach((dot, index) => {
		dot.addEventListener('click', () => {
			switchSlide(index)
		})
	})
})
