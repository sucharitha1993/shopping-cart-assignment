$(document).ready(function() {
    updateCart();
    $('.cart-section').hide();
    $('.header-list-mob').hide();

    //Add Event Listeners
    $('#cartIcon').click(onCartItem);
    $('#mobLogo').click(showList);
    $('#headerNavList').click(hideList);
    $('#checkoutBtn').click(proceedToCheckout);
});

var isMobileOrTablet = false;
(function isMobileTablet() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        isMobileOrTablet = true
    }
})();

function onCartItem() {
    if (isMobileOrTablet) {
        return window.location.pathname = 'cart'
    }
    $('#myModal').show();
    renderCartItems();
}

function showList() {
    $('.header-list-mob').show();
}

function hideList() {
    $('.header-list-mob').hide();
}

function renderCartData(data) {
    let rawTemplate = document.getElementById("cart-template").innerHTML;
    let compiledTemplate = Handlebars.compile(rawTemplate);
    let generatedHTML = compiledTemplate(data);
    document.getElementById("cart-modal-container").innerHTML = generatedHTML;
}

function renderCartItems() {
    getData(ProductsURI)
        .then(data => {
            $('.cart-section').show();
            $('#cart-items-container').html('');
            $('#cart-items-container-mob').html('');
            let products = data;
            let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
            let filteredCartItems = [];
            if (cartItems.length > 0) {
                for (let cartItem of cartItems) {
                    for (let product of products) {
                        if (product.id === cartItem.id) {
                            product.quantity = cartItem.quantity;
                            filteredCartItems.push(product)
                        }
                    }
                }
                $('.checkout').show();
                $('.cart-note').show();
                $('.footer').show();
            } else {
                let noCartItems = `<section class='no-items'>
                                    <div>
                                        <h3>No items in your cart</h3>
                                        <span>Your favorite items are just a click away</span>
                                    </div>
                                    <button onclick="window.location.pathname = 'products/all'; $('.cart-section').hide(); ">Start Shopping</button>
                                </section>`;
                $('#cart-items-container').append(noCartItems);
                $('#cart-items-container-mob').append(noCartItems);
                $('.checkout').hide();
                $('.cart-note').hide();
                $('.footer').hide();
            }
            for (let i = 0; i < filteredCartItems.length; i++) {
                let cartId = filteredCartItems[i].id;
                let $img = `<img width=80 alt="item" src=${filteredCartItems[i].imageURL}>`;
                let cartItems = `<div class="cart-item">
                                    <div class="item-details"> 
                                         ${$img} 
                                     <div>
                                    <h3>${filteredCartItems[i].name}</h3>
                                    <div class='price-details'>
                                        <div class='action'>
                                            <button value=${cartId} onclick="modifyQuantity(event,'add')">+</button> ${filteredCartItems[i].quantity} <button value=${cartId} onclick="modifyQuantity(event,'sub')">-</button> * ${filteredCartItems[i].price}
                                        </div>
                                        <div class="item-price"> ${filteredCartItems[i].price * filteredCartItems[i].quantity} </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>`;
                $('#cart-items-container').append(cartItems);
                $('#cart-items-container-mob').append(cartItems);

            }
        });
}

function modifyQuantity(eve, type) {
    var cartItemsArr = localStorage.getItem('cartItems') && JSON.parse(localStorage.getItem('cartItems')) || [];
    let indexFound = cartItemsArr.findIndex(cartItem => cartItem.id == eve.target.value);
    if (type == 'sub') {
        if (cartItemsArr[indexFound].quantity > 1) {
            cartItemsArr[indexFound].quantity--;
        } else {
            cartItemsArr.splice(indexFound, 1);
        }
    } else {
        if (indexFound > -1) {
            cartItemsArr[indexFound].quantity++;
        } else {
            cartItemsArr.push({ id: eve.target.value, quantity: 1 });
        }
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItemsArr));
    updateCart();
    renderCartItems();
}

function getCartItems() {
    postData(GetCartURI, locallocalStorage.getItem('cartItems'))
        .then(data => {
            renderCartData(data);
        });
}

function proceedToCheckout() {
    localStorage.removeItem('cartItems');
    updateCart();
    $('.cart-section').hide();
    $('#myModal').hide();
    window.location.pathname = 'products/all';
}

function getProductsOnCategory(eve) {
    let category = eve.target && eve.target.id || eve.target.value;
    window.location.pathname = `products/${category}`;
}

function addEventListeners() {
    $('.buyNowBtn').click(buyNow);
    $('#categoriesSection').click(getProductsOnCategory);
    $('.mobile-category-section').change(getProductsOnCategory);
    $('.explore-btn').click(getProductsOnCategory);
    $('#loginBtn').click(navigateToHome);
    $('#signUpBtn').click(navigateToHome);
    $('#proceedTocheckout').click(proceedToCheckout);
}

function updateCart() {
    var cartItemsArr = localStorage.getItem('cartItems') && JSON.parse(localStorage.getItem('cartItems')) || [];
    let cartItemsCount = 0;
    if (cartItemsArr.length > 0) {
        for (let cartItem of cartItemsArr) {
            cartItemsCount += cartItem.quantity;
        }
    }
    cartItemsCount = cartItemsCount !== 1 ? `${cartItemsCount} items` : `${cartItemsCount} item`;
    $('.cart-count').html(cartItemsCount);
}

function buyNow(e) {
    var cartItemsArr = localStorage.getItem('cartItems') && JSON.parse(localStorage.getItem('cartItems')) || [];
    let indexFound = cartItemsArr.findIndex(cartItem => cartItem.id == e.target.value);
    if (indexFound > -1) {
        cartItemsArr[indexFound].quantity++;
    } else {
        cartItemsArr.push({ id: e.target.value, quantity: 1 });
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItemsArr));
    updateCart();
    getData(AddToCartURI)
        .then(data => {
            Toastify({
                text: data.responseMessage,
                backgroundColor: "#96c93d",
                className: "info",
                close: true,
            }).showToast();
        })
}

function navigateToHome() {
    window.history.replaceState({}, '', 'home');
}
/* Helpers */
Handlebars.registerHelper("isActive", function(index) {
    if (index == 0) {
        return "active";
    }
    return "";
});
Handlebars.registerHelper("totalPrice", function(item) {
    return item.price * item.quantity;
});

/* APP ROOT */
const el = $('#app');

function createHTML(data, inpId, optId) {
    let rawTemplate = document.getElementById(inpId).innerHTML;
    let compiledTemplate = Handlebars.compile(rawTemplate);
    let generatedHTML = compiledTemplate(data);
    el.html(generatedHTML);
    addEventListeners();
}


/* Router */
var router = new Router({
    mode: 'history',
    page404: function(path) {
        console.log('Page not found');
        Toastify({
            text: 'Page not found',
            backgroundColor: 'red',
            className: "info",
            close: true,
        }).showToast();
    }
});

router.add('/', () => {
    createHTML({ data: [] }, "login-template", "login-section");
});

router.add('/login', () => {
    createHTML({ data: [] }, "login-template", "login-section");
});

router.add('/home', () => {
    getData(CategoriesURI)
        .then(resp => {
            createHTML(resp.data, "home-template", "home-section");
        });
});

router.add('/products/{category}', (category) => {
    getData(ProductsURI)
        .then(data => {
            let productsData = data;
            let categoryBasedProducts;
            if (category == 'fruit-and-veg') {
                categoryBasedProducts = productsData.filter(product => product.category === "5b6899953d1a866534f516e2");
            } else if (category == 'bakery-cakes-dairy') {
                categoryBasedProducts = productsData.filter(product => product.category === "5b6899123d1a866534f516de");
            } else if (category == 'beverages') {
                categoryBasedProducts = productsData.filter(product => product.category === "5b675e5e5936635728f9fc30");
            } else if (category == 'baby') {
                categoryBasedProducts = productsData.filter(product => product.category === "5b6899683d1a866534f516e0");
            } else if (category == 'beauty-hygiene') {
                categoryBasedProducts = productsData.filter(product => product.category === "5b68994e3d1a866534f516df");
            } else {
                createHTML({ products: productsData }, "product-template", "product-section");
                return;
            }
            createHTML({ products: categoryBasedProducts }, "product-template", "product-section");
            $('.mobile-category-section').val(category);
        });
});

router.add('/register', () => {
    createHTML({ data: [] }, "signup-template", "signup-section");
});

router.add('/cart', () => {
    renderCartItems();
});


// Navigate app to current url
router.navigateTo(window.location.pathname);