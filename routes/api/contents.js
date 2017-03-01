const Router = require('koa-router');
const router = new Router();
const $ = require('controllers/content');

router.get('/', $.list);
router.post('/', $.create);

router.get('/search', $.search);

router.get('/most-common-tags', $.listCommonTags);
router.post('/:id/tag/:tag', $.addTag);
router.del('/:id/tag/:tag', $.removeTag);

router.get('/:id', $.show);
router.patch('/:id', $.update);

module.exports = router;
