//Loads the express module
const express = require('express');
//Creates express server
const app = express();
let path = require('path');

const port = 3200;

//Loads the handlebars module
const handlebars = require('express-handlebars');
const hbs = require('handlebars');
app.set('view engine', 'handlebars');
//app.set('views', __dirname + '/views');
//Sets handlebars configurations
app.engine('handlebars', handlebars({ defaultLayout: 'index' }));
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
var cookieParser = require("cookie-parser");
app.use(cookieParser());

var productsData = require(`./server/products/index.get.json`);
var categoriesData = require(`./server/categories/index.get.json`);
var bannersData = require(`./server/banners/index.get.json`);
var addedToCartRes = require(`./server/addToCart/index.post.json`);

hbs.registerHelper("isActive", function(index) {
    if (index == 0) {
        return "active";
    }
    return "";
});
hbs.registerHelper("totalPrice", function(item) {
    return item.price * item.quantity;
});
//Serves static files
app.use(express.static(path.join(__dirname, 'static')));


// app.get('*', function(req, res) {
//     res.sendFile(path.join(__dirname + '/dist/index.handlebars'));
// });

app.get('/', (req, res) => {
    res.redirect('/login');
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/register', (req, res) => {
    res.render('register');
});
app.get('/getProducts', (req, res) => {
    res.status(200).send({ products: productsData });
})
app.get('/products/:category', function(req, res) {
    let categoryBasedProducts;
    if (req.params.category == 'fruit-and-veg') {
        categoryBasedProducts = productsData.filter(product => product.category === "5b6899953d1a866534f516e2");
        res.render('products', { products: categoryBasedProducts });
    } else if (req.params.category == 'bakery-cakes-dairy') {
        categoryBasedProducts = productsData.filter(product => product.category === "5b6899123d1a866534f516de");
        res.render('products', { products: categoryBasedProducts });
    } else if (req.params.category == 'beverages') {
        categoryBasedProducts = productsData.filter(product => product.category === "5b675e5e5936635728f9fc30");
        res.render('products', { products: categoryBasedProducts });
    } else if (req.params.category == 'baby') {
        categoryBasedProducts = productsData.filter(product => product.category === "5b6899683d1a866534f516e0");
        res.render('products', { products: categoryBasedProducts });
    } else if (req.params.category == 'beauty-hygiene') {
        categoryBasedProducts = productsData.filter(product => product.category === "5b68994e3d1a866534f516df");
        res.render('products', { products: categoryBasedProducts });
    } else {
        res.render('products', { products: productsData });
    }
});
app.get('/home', (req, res) => {
    categoriesData = categoriesData.filter(category => category.order > -1)
    res.render('home', { data: { categories: categoriesData, banners: bannersData } });
})

app.get('/addtocart', (req, res) => {
    res.send(addedToCartRes);
})
app.get('/cart', (req, res) => {
    var context = req.cookies["cartItems"] || [];
    res.render("cart", { cartItems: context });
    res.cookie('cartItems', [], { httpOnly: false });
})
var filteredCartItems = [];
app.post('/getCart', function(req, res) {
    let cartItems = req.body;
    filteredCartItems = [];
    if (cartItems && cartItems.length > 0) {
        for (let cartItem of cartItems) {
            for (let product of productsData) {
                if (product.id === cartItem.id) {
                    product.quantity = cartItem.quantity;
                    filteredCartItems.push(product)
                }
            }
        }
        res.cookie('cartItems', filteredCartItems, { httpOnly: false });
    }
    res.render("cart", { cartItems: filteredCartItems });
});
app.get('/cartItem/:id/:type', function(req, res) {
    let productId = req.params.id;
    let type = req.params.type;
    for (let item of filteredCartItems) {
        if (item.id === productId) {
            type == "add" ? item.quantity++ : item.quantity--;
        }
        if (item.quantity == 0) {
            let index = filteredCartItems.findIndex(cartItem => cartItem.id == item.id);
            filteredCartItems.splice(index, 1);
        }
    }
    res.cookie('cartItems', filteredCartItems, { httpOnly: false });
    res.render("cart", { cartItems: filteredCartItems });
})

//Makes the app listen to port 3000
app.listen(port, () => console.log(`App listening to port ${port}`));