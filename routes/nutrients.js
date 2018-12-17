const express = require('express');
const mongoConnect = require('../utils/mongoConnect');
var router = express.Router();
const ObjectId = require('mongodb').ObjectId;
const projection = { fields: { name: 1, code: 1, units: 1, max: 1, _id: 0, nutrients: 1 } };
const filterConditions = {
  $filter: {
    input: '$nutrients',
    as: 'n',
    cond: { $ne: ['$$n.value', 0] }
  }
}

const replaceRoot = {
  $replaceRoot: {
    newRoot: {
      _id: "$_id",
      name: "$name.long",
      nutrients: {
        $arrayToObject: {
          $map: {
            input: filterConditions,
            as: 'nutrient',
            in: {
              k: "$$nutrient.code",
              v: {
                code: '$$nutrient.code',
                name: '$$nutrient.name',
                value: '$$nutrient.value',
                units: '$$nutrient.units'
              }
            }
          },
        }
      }
    }
  }
};

router.get('/', async function (req, res) {
  const products = await getProducts(req.query);
  res.send(products);
});

router.get('/list', async (req, res) => {
  const nutrients = await getNutrients();
  res.send(nutrients);
});

router.get('/:id', async (req, res) => {
  const product = await getProductById(req.params.id);
  res.send(product);
});

async function getProducts(params) {
  const find = {};
  // const shortNutrientsList = params.id ? { $in: ['$$n.code', ['203', '204', '205']] } : {}

  if (params.filter) {
    find.$or = [
      { 'name.long': { $regex: params.filter, $options: 'i' } },
      { 'name.long_ru': { $regex: params.filter, $options: 'i' } }
    ]
  }

  const collection = await mongoConnect.db.then(_db => _db.collection('nutrients'));
  const products = await collection.aggregate([
    { $match: { ...find } },
    { $limit: 10 },
    { ...replaceRoot }]).toArray()
  return products;
}

async function getProductById(id) {
  const objectId = ObjectId(id.toString());
  const collection = await mongoConnect.db.then(_db => _db.collection('nutrients'));
  const product = await collection.aggregate([
    { $match: { _id: objectId } },
    { $limit: 1 },
    { ...replaceRoot }
  ]).toArray().catch(() => []);
  return product;
}

async function getNutrients() {
  const collection = await mongoConnect.db.then(_db => _db.collection('statistics'));
  const nutrients = await collection.find({}, projection).toArray();
  return nutrients;
}

module.exports = router;
