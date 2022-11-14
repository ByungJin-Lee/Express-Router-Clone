const Router = require("../../lib/router");

const router = Router();

router.get("/", (req, res, next) => {
  console.log(req.query);
  res.end("hello");
});

router.get("/sleep", (req, res) => {
  res.end("sleep");
});

module.exports = router;
