class Item {
    constructor(item){
        Object.assign(this, item);
        this.like = false;
        this.orders = Math.round(Math.random() * 1000);
    }

    get isAvailableForBuy(){
        return this.orderInfo.inStock > 0;
    }

    get absoluteImgPath(){
        return `img/${this.imgUrl}`;
    }

    toggleLike(){
        return this.like = !this.like;
    }
}

class ItemsModel {
    constructor() {
        // Create Item instances list from items list
        this.items = items.map(item => new Item(item));
    }

    // Get list with items based on query as substring in item name
    findManyByName(name) {
        const nameAsLowerCase = name.toLowerCase();
        return this.items.filter(item => item.name.toLowerCase().includes(nameAsLowerCase));
    }
}

class RenderCards {
    // Dependency injection (but it's not true)
    constructor(itemsModel){
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

        if(item.like) {
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
    constructor(itemsModel, renderCards){
        this.name = '';
        this.sort = 'default';
        this.#itemsModel = itemsModel;
        this.#renderCards = renderCards;
    }

    setFilter(key, value) {
        this[key] = value;
        console.log(this)
        this.#findAndRerender();
    }

    #findAndRerender() {
        const items = this.#itemsModel.findManyByName(this.name);
        this.#renderCards.renderCards(items);
    }
}


const itemsModel = new ItemsModel();
const renderCards = new RenderCards(itemsModel);
const filter = new Filter(itemsModel, renderCards);

const inputName = document.querySelector('.name_input');
const selectSort = document.getElementById('sortFilter');

inputName.oninput = (event) => {
    const { value } = event.target;
    filter.setFilter('name', value);
}

selectSort.onchange = (event) => {
    const { value } = event.target;
    filter.setFilter('sort', value);
}
