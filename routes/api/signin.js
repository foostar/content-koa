const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/user');

router.post('/', $.checkPassword, $.signin);

module.exports = router;
