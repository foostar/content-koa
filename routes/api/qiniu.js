const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/qiniu');

router.get('/uptoken', $.uptoken);
router.post('/replace-src', $.replaceSrc);

module.exports = router;
