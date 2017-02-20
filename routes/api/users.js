const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/user');

router.get('/', $.list);
router.post('/', $.create);
router.get('/:id', $.show);
router.patch('/:id', $.update, $.checkPassword);

module.exports = router;
