const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/user');

router.get('/', $.list);
router.post('/', $.create);
router.get('/:id', $.show);
router.patch('/password', $.checkPassword, $.changePassword);
router.patch('/:id', $.update);

module.exports = router;
