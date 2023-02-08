class Item {
    constructor(item) {
        Object.assign(this, item);
        this.like = false;
        this.orders = Math.round(Math.random() * 1000);
    }

    get isAvailableForBuy() {
        return this.orderInfo.inStock > 0;
    }

    get absoluteImgPath() {
        return `img/${this.imgUrl}`;
    }

    toggleLike() {
        return this.like = !this.like;
    }

    checkIsNameIncludes(name) {
        const nameAsLowerCase = name.toLowerCase();
        return this.name.toLowerCase().includes(nameAsLowerCase);
    }

    checkIsColorIncludes(colors) {
        // colors ['red', 'blue', 'green']
        // this.color ['red', 'yellow', 'black', 'green']
        if(!colors.length) return true;

        for(const color of colors) {
            const isExists = this.color.includes(color);
            if(isExists) {
                return true;
            }
        }
        return false;
    }

    checkIsStorageIncludes(storages) {
        // storages [256, 512, 1024]
        // this.storage 2048
        if(!storages.length) return true;

        for(const storage of storages) {
            if(this.storage === storage){
                return true;
            }
        }
        return false;
    }

    checkIsRamIncludes(rams) {
        // storages [256, 512, 1024]
        // this.storage 2048
        if(!rams.length) return true;

        for(const ram of rams) {
            if(this.ram === ram){
                return true;
            }
        }
        return false;
    }

    checkIsPriceRangeIncludes(minPrice, maxPrice) {
        return this.price <= maxPrice && this.price >= minPrice;
    }
}

class ItemsModel {
    constructor() {
        // Create Item instances list from items list
        this.items = items.map(item => new Item(item));
    }

    get minPrice(){
        return this.items.reduce((acc, item) => acc.price < item.price ? acc : item).price
    }

    get maxPrice(){
        return this.items.reduce((acc, item) => acc.price > item.price ? acc : item).price
    }

    get availableColors() {
        return this.items
            .reduce((acc, item) => [...acc, ...item.color], [])
            .filter((item, index, arr) => arr.indexOf(item) === index);
    }

    get availableStorage() {
        return this.items
            .map(item => item.storage)
            .filter((item, index, arr) => arr.indexOf(item) === index && item !== null);
    }

    get availableRams() {
        return this.items
            .map(item => item.ram)
            .filter((item, index, arr) => arr.indexOf(item) === index && item !== null);
    }

    // Get list with items based on query as substring in item name
    findManyByName(name) {
        const nameAsLowerCase = name.toLowerCase();
        return this.items.filter(item => item.name.toLowerCase().includes(nameAsLowerCase));
    }

    filterItems(filter = {}) {
        const {
            name = '',
            color = [],
            storage = [],
            ram = [],
            minPrice = this.minPrice,
            maxPrice = this.maxPrice
        } = filter;

        return this.items.filter(item => {
            // Check on substring includes in string
            const isNameIncluded = item.checkIsNameIncludes(name);
            if(!isNameIncluded) return false;

            // Check on substring includes in string
            const isColorIncluded = item.checkIsColorIncludes(color);
            if(!isColorIncluded) return false;

            // Check on substring includes in string
            const isStorageIncluded = item.checkIsStorageIncludes(storage);
            if(!isStorageIncluded) return false;

            // Check on substring includes in string
            const isRamIncluded = item.checkIsRamIncludes(ram);
            if(!isRamIncluded) return false;

            // Check on substring includes in string
            const isPriceRangeIncludes = item.checkIsPriceRangeIncludes(minPrice, maxPrice);
            if(!isPriceRangeIncludes) return false;

            return true;
        })
    }
}

class RenderCards {
    // Dependency injection (but it's not true)
    constructor(itemsModel, cart) {
        this.cardsContainer = document.querySelector('.container'); // Container element
        this.cart = cart;
        this.renderCards(itemsModel.items); // Auto render cards after init page
    }

    static renderCard(item) {
        // Create element
        const cardElem = document.createElement('div');
        cardElem.className = 'card';

        // Add content for card
        cardElem.innerHTML = `
            <img src="${item.absoluteImgPath}" alt="${item.name}" class="img">
            <button class="like"></button>
            <p>${item.name}</p>
            <p>Colors: ${item.color.join(', ')}</p>
            <p>Left in stock: ${item.orderInfo.inStock}</p>
            <p>Price: ${item.price}$</p>
            <button class="add_to_cart">Add to cart</button>
        `;

        cardElem.onclick = (e) => {
            console.log(item);
        }

        const addToCartBtn = cardElem.querySelector('.add_to_cart');

        addToCartBtn.onclick = (event) => {
            event.stopPropagation();
            this.cart.addToCart(item);
            console.log(this.cart.items);
        }

        const likeBtn = cardElem.querySelector('.like');

        if (item.like) {
            likeBtn.classList.add('active');
        }

        likeBtn.onclick = () => {
            item.toggleLike();
            likeBtn.classList.toggle('active');
        }

        return cardElem;
    }

    renderCards(items) {
        // Clear container
        this.cardsContainer.innerHTML = '';

        // Cereate elements with cards based on items list
        const elements = items.map(item => RenderCards.renderCard.call(this, item));

        // Add elements to container
        this.cardsContainer.append(...elements);
    }
}

class Filter {
    #itemsModel = null;
    #renderCards = null;
    constructor(itemsModel, renderCards) {
        this.#itemsModel = itemsModel;
        this.#renderCards = renderCards;
        this.name = '';
        this.sort = 'default';
        this.color = [];
        this.storage = [];
        this.ram = []
        this.minPrice = this.#itemsModel.minPrice
        this.maxPrice = this.#itemsModel.maxPrice
    }

    setFilter(key, value) {
        if (!Array.isArray(this[key])) {
            this[key] = value;
            this.#findAndRerender();
            console.log(this)
            return;
        }

        if (this[key].includes(value)) {
            this[key] = this[key].filter(val => val !== value);
        } else {
            this[key].push(value);
        }
        this.#findAndRerender();
    }

    #findAndRerender() {
        const items = this.#itemsModel.filterItems({...this});

        this.#renderCards.renderCards(items);
    }
}

class RenderFilters {
    #filter = null;
    constructor(itemsModel, filter) {
        this.#filter = filter;
        this.containerElem = document.querySelector('.filters_container');
        this.filterOptions = [
            {
                displayName: 'Color',
                name: 'color',
                options: itemsModel.availableColors,
            },
            {
                displayName: 'Storage',
                name: 'storage',
                options: itemsModel.availableStorage,
            },
            {
                displayName: 'RAM',
                name: 'ram',
                options: itemsModel.availableRams,
            },
        ];

        this.inputName = document.querySelector('.name_input');
        this.selectSort = document.getElementById('sortFilter');

        this.minPriceInput = document.getElementById('minPriceFilter');
        this.maxPriceInput = document.getElementById('maxPriceFilter');
        this.minPriceInput.value = this.#filter.minPrice
        this.maxPriceInput.value = this.#filter.maxPrice

        this.inputName.oninput = (event) => {
            const { value } = event.target;
            this.#filter.setFilter('name', value);
        }

        this.selectSort.onchange = (event) => {
            const { value } = event.target;
            this.#filter.setFilter('sort', value);
        }

        this.minPriceInput.oninput = debounce((event) => {
            const { value } = event.target;
            this.#filter.setFilter('minPrice', value);
        }, 500)

        this.maxPriceInput.oninput = debounce((event) => {
            const { value } = event.target;
            this.#filter.setFilter('maxPrice', value);
        }, 500)

        this.renderFilters(this.filterOptions);
    }

    static renderFilter(optionsData) {
        const filter = document.createElement('div');
        filter.class = 'filter_item';
        filter.innerHTML = `<p>${optionsData.displayName}</p>`;
        const optionsElements = optionsData.options.map(option => {
            const filterOption = document.createElement('label');
            filterOption.innerHTML = `<span>${option}</span>`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.onchange = () => {
                this.#filter.setFilter(optionsData.name, option);
            }
            filterOption.appendChild(checkbox)

            return filterOption;
        })

        filter.append(...optionsElements);

        return filter;
    }

    renderFilters() {
        this.containerElem.innerHTML = '';

        const filtersElements = this.filterOptions
            .map(optionData => RenderFilters.renderFilter.call(this, optionData));

        this.containerElem.append(...filtersElements);
    }
}

class Cart {
    constructor(){
        this.items = [];
        this.name = 'My sweet cart';
    }

    get totalAmmount(){
        return this.items.reduce((acc, item) => {
            return acc + item.amount;
        }, 0)
    }

    get totalPrice(){
        return this.items.reduce((acc, it) => {
            return acc + it.amount * it.item.price;
        }, 0)
    }

    addToCart(item) {
        const { id } = item;
        const itemInCart = this.items.find(it => it.id === id);
        if(itemInCart) {
            if(itemInCart.amount < 4) {
                itemInCart.amount++
            }
            return;
        }
        const newItemInCart = {
            id,
            item,
            amount: 1
        }

        this.items.push(newItemInCart);
    }

    decreaseAmountInCart(item) {
        const { id } = item;
        const itemInCart = this.items.find(it => it.id === id);
        if(itemInCart && itemInCart.amount !== 0) {
            itemInCart.amount--
        }
    }

    removeFromCart(id) {
        this.items = this.items.filter(it => it.id !== id);
    }
}


const itemsModel = new ItemsModel();
const cart = new Cart();
const renderCards = new RenderCards(itemsModel, cart);
const filter = new Filter(itemsModel, renderCards);
const renderFilters = new RenderFilters(itemsModel, filter);
