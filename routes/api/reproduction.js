const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/reproduction');

router.use(async function (ctx, next) {
    if (ctx.state.user.level !== 2 && ctx.state.user.level !== 0) {
        ctx.status = 403;
        throw Error('权限不足');
    }
    await next();
});

router.get('/', $.list);
router.get('/stat', $.stat);
router.get('/:id', $.show);

router.post('/update', $.update);
router.post('/:id', $.upsert);

module.exports = router;
