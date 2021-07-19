const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));


app.use(express.static(path.join(__dirname, 'static')));

app.get('/getProducts', function(req, res) {
    let rawdata = fs.readFileSync(`server/products/index.get.json`);
    response = JSON.parse(rawdata);
    res.status(200);
    res.json(response);
});

app.get('/getCategories', (req, res) => {
    let categoriesData = fs.readFileSync(`server/categories/index.get.json`);
    let bannersData = fs.readFileSync(`server/banners/index.get.json`);
    categoriesData = JSON.parse(categoriesData);
    bannersData = JSON.parse(bannersData);
    categoriesData = categoriesData.filter(category => category.order > -1)
    res.status(200);
    res.json({ data: { categories: categoriesData, banners: bannersData } });
});

app.get('/addtocart', (req, res) => {
    let rawdata = fs.readFileSync(`server/addToCart/index.post.json`);
    response = JSON.parse(rawdata);
    res.status(200);
    res.json(response);
});

var filteredCartItems = [];
app.post('/getCart', function(req, res) {
    let cartItems = req.body;
    let productsData = fs.readFileSync(`server/products/index.get.json`);
    productsData = JSON.parse(productsData);
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
    }
    res.json({ cartItems: filteredCartItems });
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
    res.json({ cartItems: filteredCartItems });
});

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + '/static/index.html'));
});

const port = 3200;
//Makes the app listen to port 3000
app.listen(port, () => console.log(`App listening to port ${port}`));