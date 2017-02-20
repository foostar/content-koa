const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/user');

router.get('/', $.list);
router.post('/', $.create);
router.get('/:id', $.show);
router.patch('/:id', $.update);
router.patch('/:id/password', $.changePassword, $.checkPassword);

module.exports = router;
