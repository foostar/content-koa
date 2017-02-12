require('colors');
require('app-module-path/register');

const Koa = require('koa');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');

mongoose.Promise = global.Promise;

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

mongoose.connect(config.MONGO_DB);
