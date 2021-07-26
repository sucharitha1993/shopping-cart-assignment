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
    getProducts();
}

function getProducts() {
    fetch('http://localhost:3200/getProducts')
        .then(response => response.json())
        .then(data => {
            $('#cart-items-container').html('');
            let products = data.products;
            let cartItems = JSON.parse(localStorage.getItem('cartItems'));
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
                                        <button onclick="window.location.pathname = 'products/all' ">Start Shopping</button>
                                    </section>`;
                $('#cart-items-container').append(noCartItems);
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
    getProducts();
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
window.onload = function() {
    updateCart();
};