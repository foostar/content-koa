const Router = require('koa-router');
const router = new Router();
const path = require('path');
const fs = require('fs');

router.get('/', ctx => {
    ctx.body = fs.readFileSync(
        path.resolve(__dirname, '../README.md'),
        'utf-8'
    );
});

module.exports = router;
