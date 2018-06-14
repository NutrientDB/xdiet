const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongoUrl = require('../config').mongodb_url;

let DBPromise;

module.exports = {
  connectToServer: function(url) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, (err, db) => {
        if (err) { reject(err); }
        resolve(db);
      });
    }).catch((err) => console.warn(err));
  },

  get db() {
    if (!DBPromise) {
      DBPromise = this.connectToServer(mongoUrl);
    }
    return DBPromise;
  }
};
