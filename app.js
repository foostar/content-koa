require('colors');
require('app-module-path/register');

const config = require('config');
const Koa = require('koa');
const cors = require('kcors');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
const mongoose = require('mongoose');

const error = require('middleware/error');
const jwt = require('middleware/jwt');
const mountRoutes = require('utils/mount-routes');

mongoose.Promise = global.Promise;
mongoose.connect(config.MONGO_DB);

const app = new Koa();

app.use(error());
app.use(logger());
app.use(cors());
app.use(jwt());
app.use(bodyParser());

app.use(mountRoutes().routes());

app.listen(8080, () => {
    console.log('server start at 8080');
});
