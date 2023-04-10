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
