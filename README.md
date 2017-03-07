[TOC]

# H

## Status Code
Status Code | Constructor Name
------------|---------------------------
400         | BadRequest
401         | Unauthorized
402         | PaymentRequired
403         | Forbidden
404         | NotFound
405         | MethodNotAllowed
406         | NotAcceptable
407         | ProxyAuthenticationRequired
408         | RequestTimeout
409         | Conflict
410         | Gone
411         | LengthRequired
412         | PreconditionFailed
413         | PayloadTooLarge
414         | URITooLong
415         | UnsupportedMediaType
416         | RangeNotSatisfiable
417         | ExpectationFailed
418         | ImATeapot
421         | MisdirectedRequest
422         | UnprocessableEntity
423         | Locked
424         | FailedDependency
425         | UnorderedCollection
426         | UpgradeRequired
428         | PreconditionRequired
429         | TooManyRequests
431         | RequestHeaderFieldsTooLarge
451         | UnavailableForLegalReasons
500         | InternalServerError
501         | NotImplemented
502         | BadGateway
503         | ServiceUnavailable
504         | GatewayTimeout
505         | HTTPVersionNotSupported
506         | VariantAlsoNegotiates
507         | InsufficientStorage
508         | LoopDetected
509         | BandwidthLimitExceeded
510         | NotExtended
511         | NetworkAuthenticationRequired


## Custom Error Code
```JSON
{
    "status": {
        "code": 0 | {code}, // custom error code
        "message": "success" | {error.message}
    },
    "data": {}
}

```

Code        | Desc
------------|-------
0           | **success**
100×××      | user error
101×××      | content error
102×××      | upstream error
103×××      | reproduction error
104×××      | qiniu error


## Routes
**目录结构决定路由结构**

Route         | File Path
--------------|------------------------------------
/             | /routes/index.js
/api/signin   | /routes/api/signin.js
/api/user     | /routes/api/user.js
/api/contents | /routes/api/contents.js
...           | ...


# API

## host `content-distribution.apps.xiaoyun.com`

## JWT

**POST** `/api/signin`
```js
// req
{
    "username": "yinz",
    "password": "password"
}

// res
{
  "status": {
    "code": 0,
    "message": "success"
  },
  "data": {
    "username": "yinz",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InlpbnoxIiwiaWF0IjoxNDg2OTAwOTUyLCJleHAiOjE0ODY5ODczNTJ9.uSpPb4sk123NzHyUzu39xhp3o0Semuj_RG2XrFygE4o"
  }
}
```
**其他请求应带上 `"Authorization": "Bearer {jwt}"` 用于认证**

## User

### Create

**POST** `/api/users`

```js
//req
{"username": "account", "password": "123456", "level": 1}

//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {
        "id": "58aaf9218840e8723c5c7812",
        "username": "account",
        "bindUpstreams": [],
        "level": 1,
        "createdAt": "2017-02-20T14:11:45.294Z",
        "updatedAt": "2017-02-20T14:11:45.294Z"
    }
}
```

### Update
**PATCH** `/api/users/:id`

```js
//req
{"bindUpstreams": ["xxx"]}

//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {
        "id": "58aafa7fb072f872ce7a56c8",
        "username": "test",
        "bindUpstreams": ["xxx"],
        "level": 0,
        "createdAt": "2017-02-20T14:17:35.888Z",
        "updatedAt": "2017-02-20T14:17:37.434Z"
    }
}

```

### List
**GET** `/api/users`

### Show
**GET** `/api/users/:id`

### Change password
**PATCH** `/api/users/:id/password`




## Content

### Create
**POST** `/api/content`

```js
//req
{
    "title": "Hello",
    "type": "article", //or "video"
    "content": "<h1>hello world</h1>",
    "category":"other"
}

//res
{
    "status": {
        "code": 0, "message": "success"
    },
    "data": {
        "id": "58a52c20bca39b273ea253f8"
    }
}

```

### List
**GET** `/api/content`

返回所有当前帐号创作的文章，以创作时间排序。

Parameter     | Explain
------------- | -----------------------
skip          | 默认值为0
imit          | 默认值5，最大100
fields        | 默认值["id", "type", "tags", "title", "category", "createdAt", "updatedAt"]

```js

//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {
        "skip": 0,
        "count": 4,
        "contents": [{
            "_id": "58a5453112ffc63063370aab"
        }, {
            "_id": "58a544fa2971f830316aa46b"
        }, {
            "_id": "58a543f7d8f0232fc5b84b3b"
        }, {
            "_id": "58a543ec4fd1732f9e687196"
        }]
    }
}
```

### Show
**GET** `/api/contents/:id`

通过id获得内容

```js
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {
        "id": "58a5643ddb4e6846b8d6afa8",
        "type": "article",
        "title": "Hello",
        "content": "<h1>hello world</h1>",
        "tags": [],
        "category": "other",
        "author": "58a5584cc70f683f47ddee69",
        "createdAt": "2017-02-16T08:35:09.169Z",
        "updatedAt": "2017-02-16T08:35:09.169Z"
    }
}
```


### Remove
**DELETE** `/api/contents/:id`

删除内容，如果文章已经发布到其他平台则不能删除



### Acquire

锁定一个文章，不允许他人修改。

**POST** `/api/contents/:id/acquire`


### Release

解锁一个文章

**POST** `/api/contents/:id/release`


### Update
**PATCH** `/api/contents/:id`

修改文章内容，只能自己创建的内容，可修改字段为"title", "content", "category"，管理员可以修改作者的任意内容

```js
//req
{
    "title": "Hello 2"
}

//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {
        "id": "58a5643ddb4e6846b8d6afa8",
        "title": "Hello 2",
        "content": "<h1>hello world</h1>",
        "tags": [],
        "category": "other",
        "author": "58a5584cc70f683f47ddee69",
        "createdAt": "2017-02-16T08:35:09.169Z",
        "updatedAt": "2017-02-16T08:38:09.169Z"
    }
}
```

### Search
**GET** `/api/contents/search`

搜索符合条件的内容

Parameter     | Explain
------------- | -----------------------
skip          | 默认值为0
imit          | 默认值5，最大100
fields        | 默认值["id", "type", "tags", "title", "category", "createdAt", "updatedAt"]
includeTags   | 包含的标签，如["tag1", "tag2"]
excludeTags   | 不包含的标签，如["tag3", "tag4"]
category      | 内容类目
author        | 内容作者id
keyword       | 正文包含的关键字 注意:由于mongo全文索引的限制，该功能目前使用正则搜索，存在潜在性能问题。


```js

//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {
        "skip": 0,
        "count": 4,
        "contents": [{
            "_id": "58a5453112ffc63063370aab"
        }, {
            "_id": "58a544fa2971f830316aa46b"
        }, {
            "_id": "58a543f7d8f0232fc5b84b3b"
        }, {
            "_id": "58a543ec4fd1732f9e687196"
        }]
    }
}
```

### Add tag

增加tag到内容

**POST** `/api/contents/:id/tag/:tag`

```js
//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {
        "id": "58a5643ddb4e6846b8d6afa8",
        "tags": ["test1"],
    }
}
```

### Delete tag

删除指定的tag

**DELETE** `/api/contents/:id/tag/:tag`


```js
//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {
        "id": "58a5643ddb4e6846b8d6afa8",
        "tags": [],
    }
}
```

### List most common tags

列出最近20条常用的tag

**GET** `/api/contents/most-common-tags`

```
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {
        "tags": ["66", "5", "17", "20", "21", "25", "35", "2", "12", "1", "10", "11", "7", "6", "4", "18", "19", "8", "9", "3"]
    }
}
```





## Upstream

### Create

**POST** `/api/upstreams`

```js
//req
{"platform": "tencent", "account": "123456@qq.com", session: "a=1;b=2"}

//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {
        "id": "616439363565363166383763"
    }
}
```

### Delete
**DELETE** `/api/upstreams/:id`

```js
//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {}
}
```

### Show
**GET** `/api/upstreams/:id`

```js
//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {
        "id": "616439363565363166383763",
        "platform": "tencent",
        "account": "123456@qq.com",
        "session": "a=1;b=2",
        "creater": "58a5e480ce528b6c97be9630",
        "createdAt": "2017-02-16T17:44:36.607Z",
        "updatedAt": "2017-02-16T17:44:36.607Z"
    }
}
```

### Update

修改上游帐号，目前只允许修改session

**Patch** `/api/upstreams/:id`

```js
//req
{"session":"modified"}

//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {
        "id": "616439363565363166383763",
        "platform": "tencent",
        "account": "123456@qq.com",
        "session": "modified",
        "creater": "58a5e480ce528b6c97be9630",
        "createdAt": "2017-02-16T17:44:36.607Z",
        "updatedAt": "2017-02-16T18:10:03.882Z"
    }
}
```

### List
列出符合条件的上游帐号。

Parameter     | Explain
------------- | -----------------------
skip          | 默认值为0
imit          | 默认值5，最大100
account       | 按前缀匹配方式查找，返回以此参数开头的帐号
platform      | 所属平台，精确匹配


```js
//req /api/upstream?account=t

//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {
        "skip": 0,
        "count": 2,
        "upstreams": [{
            "id": "333166303134623533653538",
            "platform": "test",
            "account": "test",
            "session": "modified",
            "creater": "58a5e8c45d5651708e664142",
            "createdAt": "2017-02-16T18:35:18.027Z",
            "updatedAt": "2017-02-16T18:35:18.093Z"
        }, {
            "id": "333134613335343432313239",
            "platform": "test",
            "account": "test2",
            "session": "a=1;b=2",
            "creater": "58a5e8c45d5651708e664142",
            "createdAt": "2017-02-16T18:35:18.040Z",
            "updatedAt": "2017-02-16T18:35:18.040Z"
        }]
    }
}
```


## Reproduction

### Upsert

保存或更新上游副本，link字段必传，date默认值为今天，publisher默认值为当前用户，第一次保存信息时"upstream", "content"必传。
**POST** `/api/reproduction/`

```js
//req
{
    "link": "majihua.baijia.baidu.com/article/783077",
    "date": "20170306",
    "upstream":"000000000000000000000000",
    "content":"000000000000000000000000",
    "publisher": "000000000000000000000000",
    "author": "000000000000000000000000",
    "publishAt":"2017-02-26T14:24:54.331Z",
    "custom":"test"
}

//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {
        "link": "majihua.baijia.baidu.com/article/783077",
        "date": "20170306",
        "upstream": "000000000000000000000000",
        "content": "000000000000000000000000",
        "publishAt": "2017-02-26T14:16:14.561Z",
        "publisher": "000000000000000000000000",
        "author": "000000000000000000000000",
        "view": 0,
        "custom": "test",
        "createdAt": "2017-02-26T14:16:14.569Z",
        "updatedAt": "2017-02-26T14:16:14.569Z"
    }
}
```

### Batch
批量保存或更新上游副本，与Upsert区别只是上传的是数组。


### Search

返回符合条件的上游副本，以更新时间倒序排列

**GET** `/api/reproduction`

Parameter     | Explain
------------- | -----------------------
skip          | 默认值为0
limit         | 默认值5，最大100
publishStart  | 副本发布时间范围，下界
publishEnd    | 副本发布时间范围，上界
dateStart     | 时间范围，下界
dateEnd       | 时间范围，上界
upstreams     | 上游ID，可传多个值
publishers    | 发布人ID，可传多个值
contents      | 内容ID，可传多个值
authors       | 作者ID，可传多个值
links         | 副本link，可传多个值

```js
//req ?upstreams=111111111111111111111111

//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": {
        "skip": 0,
        "count": 1,
        "reproductions": [{
            "link": "111111111111111111111119",
            "date": "20170306",
            "upstream": "111111111111111111111111",
            "content": "111111111111111111111110",
            "publisher": "111111111111111111111110",
            "publishAt": "2017-02-26T13:37:21.262Z",
            "view": 9,
            "custom": "test",
            "createdAt": "2017-02-26T13:37:21.263Z",
            "updatedAt": "2017-02-26T13:37:21.263Z"
        }]
    }
}
```


### Stat

统计符合条件的view数

Parameter     | Explain
------------- | -----------------------
publishStart  | 副本发布时间范围，下界
publishEnd    | 副本发布时间范围，上界
dateStart     | 时间范围，下界
dateEnd       | 时间范围，上界
upstreams     | 上游ID，可传多个值
publishers    | 发布人ID，可传多个值
contents      | 内容ID，可传多个值
links         | 副本link，可传多个值
authors       | 作者ID，可传多个值
groupBy       | 以何字段分组统计，目前仅支持"upstream" / "content" / "publisher" / "author" / "link" / "date"，如果没有传递该参数结果不分组

**GET** `/api/reproduction/stat`

```js
//req /api/reproduction/stat?groupBy=upstream

//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data": [{
        "total": 20,
        "lastUpdate": "2017-02-26T13:59:47.269Z",
        "upstream": "111111111111111111111110"
    }, {
        "total": 25,
        "lastUpdate": "2017-02-26T13:59:47.270Z",
        "upstream": "111111111111111111111111"
    }]
}
```

```js
//req /api/reproduction/stat

//res
{
    "status": {
        "code": 0,
        "message": "success"
    },
    "data":[{
        "total": 45,
        "lastUpdate": "2017-02-26T13:59:47.269Z"
    }]
}
```
