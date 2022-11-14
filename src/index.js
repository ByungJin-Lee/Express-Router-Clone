
const http = require('http');
const router = require('./router');

http.createServer(router.listener).listen(8080);