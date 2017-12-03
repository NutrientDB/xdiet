const express = require('express');
const mongoConnect = require('../utils/mongoConnect');
var router = express.Router();

router.get('/', async function(req, res) {
  const products = await getProducts();
  res.send(products);
});

router.get('/list', async (req, res) => {
  const nutrients = await getNutrients();
  res.send(nutrients);
});

async function getProducts() {
  const collection = await mongoConnect.read.then(_db => _db.collection('nutrients'));
  const products = await collection.find({}).limit(10).toArray();
  return products;
}

async function getNutrients() {
  const projection = { fields: { name: 1, code: 1, units: 1, max: 1, _id: 0 }};
  const collection = await mongoConnect.read.then(_db => _db.collection('statistics'));
  const nutrients = await collection.find({}, projection).toArray();
  return nutrients;
}

module.exports = router;
