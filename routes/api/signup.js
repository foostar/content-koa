const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/user');

router.post('/', $.signup);

router.get('/', $.signup);

module.exports = router;
