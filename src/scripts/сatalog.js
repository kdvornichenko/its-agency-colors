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
