module.exports = {
  googleClientID:
    "70265989829-0t7m7ce5crs6scqd3t0t6g7pv83ncaii.apps.googleusercontent.com",
  googleClientSecret: "8mkniDQOqacXtlRD3gA4n2az",
  // 27017 is the default port value for mongodb. blog_ci is the database name.
  // By default this db doesn't exist. When mongoose first tries to connect with
  // this db instance, it will automatically create it inside the copy of mongodb.
  // We can call it anything we want.
  mongoURI: "mongodb://127.0.0.1:27017/blog_ci",
  cookieKey: "123123123",
  // travis documentation says to use the default redisUrl.
  redisUrl: "redis://127.0.0.1:6379",
};
