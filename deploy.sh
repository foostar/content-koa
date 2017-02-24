echo "Deploy version: \c"

read VERSION

docker build -t dhub.yunpro.cn/xiaoyun/content-distribution:$VERSION .

docker push dhub.yunpro.cn/xiaoyun/content-distribution:$VERSION

echo "\nDeploy $VERSION success!\n"
