const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/user');

router.get('/:id', $.show);
router.patch('/:id', $.checkPassword, $.update);
router.delete('/:id', $.checkPassword, $.destroy);

module.exports = router;
