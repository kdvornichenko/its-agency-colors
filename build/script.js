const cart = document.querySelector('.cart')
const cartProducts = cart.querySelector('.cart__products-cards')
const cartCloseButton = cart.querySelector('.cart__cross')
const cartProductsCount = cart.querySelector('.cart__products-count span')
const cartProductsClear = cart.querySelector('.cart__products-clear')
const cartProductsTotal = cart.querySelector('.cart__amount-total span')
// Закрытие корзины
cartCloseButton.addEventListener('click', () => {
	cart.classList.remove('--active')
	overlayToggle()
})
// Обновление кол-ва товаров в корзине
function updateCartCount(totalQuantity) {
	cartProductsCount.textContent = totalQuantity
}
// Обновление стоимости товаров
function updateCartTotal(totalAmount) {
	cartProductsTotal.textContent = totalAmount
}
// Создание карточки товара
function createProductCard(product) {
	return `
    <div data-id="${product.id}" class="cart__products-card">
      <div class="cart__products-card_image">
        <img src="${product.image}" alt="${product.title}" />
      </div>
			<div class="cart__products-card_content">
				<div class="cart__products-card_info">
					<h4>${product.title}</h4>
					<div class="cart__products-card_price">${product.price}₽</div>
				</div>
				<div class="cart__products-card_counter">
					<button class="cart__products-card_counter_decr">-</button>
					<input type="number" class="cart__products-card_counter_value" value="${product.quantity}" max="999" min="1" />
					<button class="cart__products-card_counter_incr">+</button>
				</div>
				</div>
				<div class="cart__products-card_delete">
					<span></span>
				</div>
		</div>`
}
// Функция рендера товаров в корзине
function renderCart(cartData) {
	// Открываем корзину
	cart.classList.add('--active')
	// Включаем оверлей
	overlayToggle()
	// Получаем начальное кол-во товара
	const totalQuantity = changeCartCountInHeader()
	// Получаем общую стоимость товара
	const totalAmount = getTotalAmount(cartData)
	// Функция для подсчета общей стоимости
	function getTotalAmount(cartData) {
		let totalAmount = 0
		for (const product of cartData) {
			totalAmount += product.price * product.quantity
		}
		return totalAmount
	}
	// Обновляем стоимость и кол-во товара
	updateCartTotal(totalAmount)
	updateCartCount(totalQuantity)

	// Очищаем блок перед добавлением новых карточек
	cartProducts.innerHTML = ''

	// Для каждого элемента данных создаем карточку и добавляем ее в блок
	for (const product of cartData) {
		// Создаем карточку товара
		const productCard = createProductCard(product)
		// Добавляем карточку товара в блок
		cartProducts.insertAdjacentHTML('beforeend', productCard)
	}
	// Счетчик
	const counterContainer = cart.querySelectorAll('.cart__products-card_counter')
	// Вешаем обработчик клика на все счетчики, если в корзине есть товары
	counterContainer?.forEach((counter) => {
		counter.addEventListener('click', (event) => {
			// Проверяем таргет на кнопку уменьшение
			if (event.target.classList.contains('cart__products-card_counter_decr')) {
				const counterValue = event.target.nextElementSibling
				let newValue = parseInt(counterValue.value) - 1
				if (newValue < 1) {
					newValue = 1
				}
				counterValue.value = newValue
				updateCartData()
			} else if (
				// Проверяем таргет на кнопку увеличения
				event.target.classList.contains('cart__products-card_counter_incr')
			) {
				const counterValue = event.target.previousElementSibling
				let newValue = parseInt(counterValue.value) + 1
				counterValue.value = newValue
				updateCartData()
			}
		})
	})

	// Вешаем обработчик ввода на все счетчики, если в корзине есть товары
	counterContainer?.forEach((counterInput) => {
		counterInput.addEventListener('input', (event) => {
			if (
				event.target.classList.contains('cart__products-card_counter_value')
			) {
				if (event.target.value === '') {
					event.target.value = 1
				}
				updateCartData()
			}
		})
	})
	// Удаление товара
	const deleteButtons = cart.querySelectorAll('.cart__products-card_delete')
	// Вешаем обработчик клика на кнопку удаления товара
	deleteButtons.forEach((button) => {
		button.addEventListener('click', () => {
			// Записываем ID удаляемого товара
			const productId = parseInt(button.parentElement.dataset.id)
			// Находим этот товар в массиве товаров
			const existingProductIndex = cartData.findIndex(
				(product) => product.id === productId
			)

			if (existingProductIndex !== -1) {
				// Удаляем его из массива
				cartData.splice(existingProductIndex, 1)
				// Функция обновления данных в корзине
				updateCartData()
				// Удаляем карточку товара из корзины
				button.parentNode.remove()
				// Обновляем счетчик кол-ва товара в корзине
				changeCartCountInHeader()
				// Находим данный товар на странице и отключаем активность кнопки
				const deleteProduct = document.querySelector(
					`[data-id="${productId}"].product-card`
				)
				deleteProduct.querySelector('button').classList.remove('--active')
			}
		})
	})
	updateCartData()
}
// Функция обновления корзины
function updateCartData() {
	// Проверяем наличие товаров в корзине, иначе обнуляем данные
	if (!cartData.length) {
		localStorage.removeItem('cartData')
		updateCartCount(0)
		cartProductsTotal.textContent = 0
		return
	}
	// Записываем все карточки товаров
	const cartProducts = cart.querySelectorAll('.cart__products-card')
	// Инициализируем кол-во товаров
	let totalQuantity = 0
	// Инициализируем кол-во товаров
	let totalAmount = 0
	cartProducts.forEach((productCard) => {
		// Для каждой карнточки товара
		// Находим ID
		const productId = parseInt(productCard.dataset.id)
		// Находим инпут
		const quantityInput = productCard.querySelector(
			'.cart__products-card_counter_value'
		)
		// Кол-во товара в инпуте
		const quantity = parseInt(quantityInput.value)
		// Находим этот товар в массиве
		const existingProduct = cartData.find((product) => product.id === productId)
		if (existingProduct) {
			// Обновляем кол-во товара в массиве
			existingProduct.quantity = quantity
			// Обновляем общую стоимость товаров
			totalAmount += existingProduct.price * existingProduct.quantity
			// Обновляем кол-во товаров
			totalQuantity += quantity
		}
	})
	// Обновляем данные в localStorage
	localStorage.setItem('cartData', JSON.stringify(cartData))
	// Обновляем кол-во товара в корзине
	updateCartCount(totalQuantity)
	// Обновляем общую стоимость товара в корзине
	updateCartTotal(totalAmount)
}
// Очистка корзины, вешаем случшатель клика на кнопку
cartProductsClear.addEventListener('click', () => {
	// Удаляем все карточки из корзины
	cartProducts.innerHTML = ''
	cartData = []
	// Ставим кол-во товаров в 0
	updateCartData()
	changeCartCountInHeader()

	localStorage.setItem('cartData', JSON.stringify([]))
	// Находим все активные кнопки в каталоге и удаляем активный класс
	const catalogCardButtons = document.querySelectorAll(
		'.product-card__button.--active'
	)
	catalogCardButtons.forEach((button) => {
		button.classList.contains('--active') && button.classList.remove('--active')
	})
})

const burger = document.querySelector('.header__burger')
const drawer = document.querySelector('.header__drawer')
const overlay = document.querySelector('.overlay')

burger.addEventListener('click', mobMenuToggle)

function mobMenuToggle() {
	drawer.classList.toggle('--active')
	burger.classList.toggle('--active')
	overlayToggle()
}

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

// Получаем элементы из DOM
const cartButton = document.querySelector('.tools-cart')
const cartCount = cartButton.querySelector('.tools-cart_count')
const catalogProductsCount = document.querySelector(
	'.catalog__header-count span'
)
const catalogProductsSort = document.querySelector(
	'.catalog__header-sort_current'
)
const catalogProductsSortList = document.querySelector(
	'.catalog__header-sort_list'
)
const catalogProductsSortListItems =
	catalogProductsSortList.querySelectorAll('li')

const catalogFilterButton = document.querySelector('.catalog__header-filters')
const filter = document.querySelector('.filter')

catalogFilterButton.addEventListener('click', () => {
	filter.classList.toggle('--active')
	filter.style.bottom = '0'
	overlayToggle()
})

let startY
let currentY
let distance

// Add event listeners for touch events
filter.addEventListener('touchstart', touchStart)
filter.addEventListener('touchmove', touchMove)
filter.addEventListener('touchend', touchEnd)

function touchStart(event) {
	startY = event.touches[0].clientY
}

function touchMove(event) {
	currentY = event.touches[0].clientY
	distance = currentY - startY

	// Only move the filter element if swiping down
	if (distance > 0) {
		filter.style.bottom = `-${distance}px`
	}
}

function touchEnd() {
	// If the filter element has been swiped down more than 50 pixels, animate it off the screen
	if (distance > 50) {
		filter.style.bottom = `-${filter.offsetHeight}px`

		// Remove the filter element from the DOM once it has been animated off the screen
		setTimeout(() => {
			overlayToggle()
			filter.style.bottom = '-100%'
		}, 300)
	} else {
		// If the filter element has not been swiped down enough, reset its position
		filter.style.bottom = '0'
	}
}

const catalogProducts = document.querySelector('.catalog__products')
// URL для получения данных каталога
const CATALOG_API =
	'https://64182a4429e7e36438e0cdf0.mockapi.io/colors-catalog/'

// Переменная для хранения фильтрованных данных
let catalogFilteredData
// Фильтрация и сортировка
const filters = {
	new: false,
	available: false,
	contract: false,
	exclusive: false,
	sale: false,
}
function filterAndSortCatalogData(data, filters, sortDirection) {
	const filteredData = data.filter((item) => {
		// Проверяем каждый элемент на соответствие фильтрам
		return Object.keys(filters).every((key) => {
			if (filters[key]) {
				// Если фильтр выбран, то элемент должен соответствовать его требованиям
				return item.filters[key]
			} else {
				// Если фильтр не выбран, то элемент подходит для любого значения фильтра
				return true
			}
		})
	})
	// Сортировка по цене
	filteredData.sort((a, b) => {
		if (sortDirection === 'asc') {
			return a.price - b.price
		} else if (sortDirection === 'desc') {
			return b.price - a.price
		}
	})

	return filteredData
}

// Обработчик клика на фильтр
document.querySelectorAll('.filter__checkbox').forEach((checkbox) => {
	checkbox.addEventListener('click', () => {
		filters[checkbox.id] = checkbox.checked

		localStorage.setItem(
			'catalogFilteredData',
			JSON.stringify(catalogFilteredData)
		)
		setCards(
			filterAndSortCatalogData(catalogFilteredData, filters, sortDirection)
		)
	})
})

let sortDirection = ''

catalogProductsSort.addEventListener('click', catalogProductsSortToggle)
catalogProductsSortListItems.forEach((item) => {
	item.addEventListener('click', () => {
		sortDirection = item.dataset.sort
		catalogProductsSort.textContent = item.textContent

		if (item.parentNode.querySelector('li.active')) {
			item.parentNode.querySelector('li.active').classList.remove('active')
		}

		item.classList.add('active')

		setCards(
			filterAndSortCatalogData(catalogFilteredData, filters, sortDirection)
		)
		catalogProductsSortToggle()
	})
})

function catalogProductsSortToggle() {
	catalogProductsSortList.classList.toggle('--active')
	overlayToggle()
}

// Получение данных каталога с сервера
fetch(CATALOG_API)
	.then((response) => {
		// Проверяем, успешен ли запрос
		if (!response.ok) {
			throw new Error('Network response was not ok')
		}
		return response.json()
	})
	.then((data) => {
		catalogFilteredData = data
		setCards(catalogFilteredData)
		// Сохраняем данные каталога в локальное хранилище
		localStorage.setItem('catalogData', JSON.stringify(data))
		localStorage.setItem(
			'catalogFilteredData',
			JSON.stringify(catalogFilteredData)
		)
	})
	.catch((error) => {
		// Обрабатываем ошибки
		console.error(
			`There was a problem with the fetch operation: ${error.message}, status: ${error.status}`
		)
	})

// Получаем данные корзины из локального хранилища
let cartData
function getCartData() {
	cartData = JSON.parse(localStorage.getItem('cartData')) || []
}
getCartData()
// Функция для добавления товара в корзину
function addToCart(product) {
	getCartData()
	// Ищем, есть ли уже такой товар в корзине
	const existingProductIndex = cartData.findIndex(
		(item) => item.id === product.id
	)

	if (existingProductIndex !== -1) {
		// Если товар уже есть в корзине, удаляем его
		cartData.splice(existingProductIndex, 1)
	} else {
		// Если товара еще нет в корзине, добавляем его
		cartData.push(product)
	}
	// Сохраняем обновленные данные корзины в локальное хранилище
	localStorage.setItem('cartData', JSON.stringify(cartData))
}

// Добавляем обработчик клика на кнопки добавления товара в корзину
catalogProducts.addEventListener('click', (event) => {
	// Проверяем, была ли нажата кнопка добавления товара в корзину
	if (event.target.closest('.product-card__button')) {
		const productButton = event.target.closest('.product-card__button')
		productButton.classList.toggle('--active')
		// Получаем данные карточки, на которую кликнули
		const productCard = event.target.closest('.product-card')
		const productTitle = productCard.querySelector(
			'.product-card__title'
		).textContent
		const productPrice = productCard.querySelector(
			'.product-card__price span'
		).innerText
		const productImage = productCard.querySelector('.product-card__image').src
		// Получаем id товара
		const productId = productCard.dataset.id
		// Создаем объект с данными карточки
		const product = {
			id: Number(productId),
			title: productTitle,
			price: Number(productPrice),
			image: productImage,
			quantity: 1,
		}
		// Добавляем товар в корзину
		addToCart(product)
		// Изменяем счетчик товаров в корзине
		changeCartCountInHeader()
	}
})

function setCards(cardsData) {
	// Очищаем блок перед добавлением новых карточек
	catalogProducts.innerHTML = ''
	// Для каждого элемента данных создаем карточку и добавляем ее в блок
	cardsData.forEach((product) => {
		// Проверяем, есть ли товар в корзине
		const isInCart = cartData.some((item) => {
			return Number(item.id) === product.id
		})
		// Создаем карточку товара с нужным классом кнопки
		const productCard = `
      <div data-id=${product.id} class="product-card">
        <div class="product-card__image-holder">
          <img class="product-card__image" src=${product.image} alt=${
			product.title
		} />
        </div>
        <h4 class="product-card__title">${product.title}</h4>
        <div class="product-card__bottom">
          <span class="product-card__price">
						<span>
						${product.price}
						</span>
					₽</span>
          <button class="product-card__button ${isInCart ? '--active' : ''}">
            <span></span>
          </button>
        </div>
      </div>`
		// Добавляем карточку товара в блок
		catalogProducts.insertAdjacentHTML('beforeend', productCard)
	})
	changeCartCountInHeader()
	catalogProductsCount.textContent = cardsData.length
}

// Корзина
function changeCartCountInHeader() {
	const totalQuantity = cartData.reduce(
		(acc, product) => acc + product.quantity,
		0
	)
	cartCount.textContent = totalQuantity
	return totalQuantity
}

cartButton.addEventListener('click', () => renderCart(cartData))
