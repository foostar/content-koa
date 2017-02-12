const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/user');

router.post('/', $.signup);

module.exports = router;
