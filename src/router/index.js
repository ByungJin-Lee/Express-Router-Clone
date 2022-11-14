const Router = require("../lib/router");

const router = Router();

const home = require("./home");

const middleware = require("../middleware");

router.use(middleware);

router.get("/", (req, res) => {
  res.end("landing");
});

router.use("/home", home);

router.get("*", (req, res, next) => {
  res.end("404");
});

module.exports = router;
