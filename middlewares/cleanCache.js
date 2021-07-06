const { clearHash } = require("../services/cache");

module.exports = async (req, res, next) => {
  // This middleware will wait till the route handler is finished.
  // Then we will clear the hash.
  await next();

  clearHash(req.user.id);
};
