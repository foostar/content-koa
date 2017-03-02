const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/qiniu');

router.get('/uptoken', $.uptoken);

module.exports = router;
