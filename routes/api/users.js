const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/user');

router.get('/:id', $.show);
router.patch('/:id', $.update, $.checkPassword);
router.delete('/:id', $.destroy, $.checkPassword);

module.exports = router;
