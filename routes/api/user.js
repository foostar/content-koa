const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/user');

router.get('/:id', $.show);
router.patch('/:id', $.update);
router.delete('/:id', $.destroy);

module.exports = router;
