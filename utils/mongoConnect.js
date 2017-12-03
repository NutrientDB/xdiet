const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const readMongoUrl = require('../config').mongodb_url;
const writeMongoUrl = require('../config').mongodb_write_url;

let readDBPromise;
let writeDBPromise;

module.exports = {
  connectToServer: function(url) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, (err, db) => {
        if (err) { reject(err); }
        resolve(db);
      });
    });
  },

  get read() {
    if (!readDBPromise) {
      readDBPromise = this.connectToServer(readMongoUrl);
    }
    return readDBPromise;
  },

  get write() {
    if (!writeDBPromise) {
      writeDBPromise = this.connectToServer(writeMongoUrl);
    }
    return writeDBPromise;
  }
};
