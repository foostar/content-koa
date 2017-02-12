const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/article');

const jwt = require('middleware/jwt');

router.get('/', jwt(), $.list);
router.post('/', jwt(), $.create);

router.get('/:id', jwt(), $.show);
router.patch('/:id', jwt(), $.update);
router.delete('/:id', jwt(), $.destroy);

module.exports = router;
