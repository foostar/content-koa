require('colors');
require('app-module-path/register');

const config = require('config');
const Koa = require('koa');
const cors = require('kcors');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');

const error = require('middleware/error');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(config.MONGO_DB);

const app = new Koa();
const mountRoutes = require('utils/mount-routes');
const router = mountRoutes();

app.use(cors());
app.use(error());
app.use(logger());
app.use(bodyParser());

app.use(router.routes());

app.listen(8080, () => {
    console.log('server start at 8080');
});
