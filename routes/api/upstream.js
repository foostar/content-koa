const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/upstream');

router.use(async function (ctx, next) {
    if (ctx.state.user.level !== 2 && ctx.state.user.level !== 0) {
        ctx.status = 403;
        throw Error('权限不足');
    }
    await next();
});

router.get('/', $.list);
router.post('/', $.create);

router.get('/:id', $.show);
router.patch('/:id', $.update);
router.del('/:id', $.destroy);

module.exports = router;
