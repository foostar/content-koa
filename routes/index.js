const Router = require('koa-router');
const router = new Router();
const path = require('path');
const fs = require('fs');

const homeText = fs.readFileSync(
    path.resolve(__dirname, '../README.md'),
    'utf-8'
);

router.get('/', ctx => {
    ctx.body = homeText;
});

module.exports = router;
