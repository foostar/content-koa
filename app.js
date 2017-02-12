const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(config.MONGO_DB);

require('colors');
require('app-module-path/register');

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');

const config = require('config');
const error = require('middleware/error');

const app = new Koa();
const mountRoutes = require('utils/mount-routes');
const router = mountRoutes();

app.use(error());
app.use(logger());
app.use(bodyParser());

app.use(router.routes());

app.listen(8080, () => {
    console.log('server start at 8080');
});
