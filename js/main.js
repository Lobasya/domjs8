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
}

class ItemsModel {
    constructor() {
        // Create Item instances list from items list
        this.items = items.map(item => new Item(item));
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

    // Get list with items based on query as substring in item name
    findManyByName(name) {
        const nameAsLowerCase = name.toLowerCase();
        return this.items.filter(item => item.name.toLowerCase().includes(nameAsLowerCase));
    }
}

class RenderCards {
    // Dependency injection (but it's not true)
    constructor(itemsModel) {
        this.cardsContainer = document.querySelector('.container'); // Container element
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
            <p>Left in stock: ${item.orderInfo.inStock}</p>
            <p>Price: ${item.price}$</p>
            <button>Add to cart</button>
        `;

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
        const elements = items.map(item => RenderCards.renderCard(item));

        // Add elements to container
        this.cardsContainer.append(...elements);
    }
}

class Filter {
    #itemsModel = null;
    #renderCards = null;
    constructor(itemsModel, renderCards) {
        this.name = '';
        this.sort = 'default';
        this.color = [];
        this.storage = [];
        this.#itemsModel = itemsModel;
        this.#renderCards = renderCards;
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
        console.log(this)
    }

    #findAndRerender() {
        const items = this.#itemsModel.findManyByName(this.name);
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
        ];

        this.inputName = document.querySelector('.name_input');
        this.selectSort = document.getElementById('sortFilter');

        this.inputName.oninput = (event) => {
            const { value } = event.target;
            this.#filter.setFilter('name', value);
        }

        this.selectSort.onchange = (event) => {
            const { value } = event.target;
            this.#filter.setFilter('sort', value);
        }

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
            checkbox.value = option;
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


const itemsModel = new ItemsModel();
const renderCards = new RenderCards(itemsModel);
const filter = new Filter(itemsModel, renderCards);
const renderFilters = new RenderFilters(itemsModel, filter);
