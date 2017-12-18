const express = require('express');
const mongoConnect = require('../utils/mongoConnect');
var router = express.Router();
const ObjectId = require('mongodb').ObjectId;
const projection = { fields: { name: 1, code: 1, units: 1, max: 1, _id: 0, nutrients: 1 } };


router.get('/', async function (req, res) {
  const products = await getProducts(req.query);
  res.send(products);
});

router.get('/list', async (req, res) => {
  const nutrients = await getNutrients();
  res.send(nutrients);
});

router.get('/:id', async (req, res) => {
  const product = await getProducts(ObjectId(req.params.id.toString()));
  res.send(product);
});

async function getProducts(params) {
  const find = {}
  // const shortNutrientsList = params.id ? { $in: ['$$n.code', ['203', '204', '205']] } : {}
  const filterConditions = {
    input: '$nutrients',
    as: 'n',
    cond: {
      $and: [
        { $ne: ['$$n.value', 0] },
        // { ...shortNutrientsList }
      ]
    }
  }
  if (params.filter) {
    find.$or = [
      { 'name.long': { $regex: params.filter, $options: 'i' } },
      { 'name.long_ru': { $regex: params.filter, $options: 'i' } }
    ]
  }

  if (params.id) {
    find._id = ObjectId(params.id.toString())
  }
  
  const collection = await mongoConnect.read.then(_db => _db.collection('nutrients'));
  const products = await collection.aggregate([{
    $project: {
      name: 1,
      nutrients: { $filter: filterConditions }
    }
  },
  { $match: { ...find } },
  { $limit: 10 }]).toArray()
  return products;
}

async function getNutrients() {
  const collection = await mongoConnect.read.then(_db => _db.collection('statistics'));
  const nutrients = await collection.find({}, projection).toArray();
  return nutrients;
}

module.exports = router;
