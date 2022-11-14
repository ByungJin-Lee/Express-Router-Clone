/**
 * @type {import("../lib/router").RouteCallback}
 */
module.exports = (req, res, next) => {
  console.log(req.url, req.query);
  next();
};
