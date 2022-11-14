const router = require("../lib/router")();
const Logger = require("./logger");

router.use(Logger);

module.exports = router;
