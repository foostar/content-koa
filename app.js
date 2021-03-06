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
const options = {
    server: {
        socketOptions: {keepAlive: 1}
    },
    replset: {
        socketOptions: {keepAlive: 1}
    }
};
mongoose.connect(config.MONGO_DB, options);

const app = new Koa();

app.use(logger());
app.use(error());
app.use(cors());
app.use(jwt());
app.use(bodyParser());

app.use(mountRoutes().routes());

module.exports = app;
