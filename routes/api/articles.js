const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/article');

const jwt = require('middleware/jwt');

router.get('/', jwt(), $.list);
router.post('/', $.create);

router.get('/:id', $.show);
router.patch('/:id', $.update);
router.delete('/:id', $.destroy);

module.exports = router;
