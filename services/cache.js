const mongoose = require("mongoose");
const redis = require("redis");
// std library included in the node runtime. It has various utility functions.
const util = require("util");
const keys = require("../config/keys");

const client = redis.createClient(keys.redisUrl);
// Now client.get returns a promise.
client.hget = util.promisify(client.hget);

// Query is a constructor function, to call it's functions like exec, find, etc
// we have to use the prototype keyword.
const exec = mongoose.Query.prototype.exec;

// when we use .cache in any query, then only the caching can occur
// as redis is costly, the provider can charge you a lot.
mongoose.Query.prototype.cache = function (option = {}) {
  this.useCache = true;
  // hashKey is the top level key which will the user provide.
  this.hashKey = JSON.stringify(option.key || "");

  // By returning this: it becomes chainable like .sort, .find, etc.
  return this;
};

// Overriding the exec function.
// Don't use the arrow key here, because it messes with this keyword.
mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  // This inside code is going to run before any query is executed by mongoose.

  // getQuery returns the current query conditions as a json object.
  // If we combine together the query options and collection name, our key will
  // be unique and consistent.
  // Object.assign is used to safely copy properties from one object to another.
  // The empty obect {} is assigned the values of both the getQuery and collection name.
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  // See if we have a value for 'key' in redis:
  const cacheValue = await client.hget(this.hashKey, key);

  // If we do, return that:
  if (cacheValue) {
    // converting cacheValue to a mongoose model, which we will return.
    // this.model is a constructor which is doing the conversion.
    const doc = JSON.parse(cacheValue);

    // If the doc is an array, we have to convert every element of array.
    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }

  // Otherwise, isssue the query and store the result in redis:

  // apply function is used so that we can pass in automatically any arguments
  // that are passed into exec as well. 'this' refers to the current query.
  const result = await exec.apply(this, arguments);
  // whatever comes back from mongoDB will be assigned to result.
  // This result looks like a normal javascript object but actually,
  // it is a Mongoose Document (or we refer to it as 'MODEL INSTANCE')
  // So, we have to convert it to JSON string while saving to redis:
  client.hset(this.hashKey, key, JSON.stringify(result), "EX", 10);

  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
