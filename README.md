[TOC]


# HTTP Status

- `200`: GET请求成功, 及DELETE或PATCH同步请求完成，或者PUT同步更新一个已存在的资源
- `201`: POST 同步请求完成，或者PUT同步创建一个新的资源
- `202`: POST, PUT, DELETE, 或 PATCH 请求接收，将被异步处理
- `206`: GET 请求成功, 但是只返回一部分，参考：上文中范围分页

- 使用身份认证（authentication）和授权（authorization）错误码时需要注意：
    - `401`: Unauthorized: 用户未认证，请求失败
    - `403`: Forbidden: 用户无权限访问该资源，请求失败
- 当用户请求错误时，提供合适的状态码可以提供额外的信息：
    - `422`: Unprocessable Entity: 请求被服务器正确解析，但是包含无效字段
    - `429`: Too Many Requests: 因为访问频繁，你已经被限制访问，稍后重试
    - `500`: Internal Server Error: 服务器错误，确认状态并报告问题

# 响应实体结构

```JSON
{
    "status": {
        "code": 0 | {code},
        "message": "success" | {error.message}
    },
    "data": {}
}
```

## Error Code
- `10***` 用户类
    - `10404`: 用户不存在
    - `10401`: 用户密码错误
    - `10422`: 用户名已经被注册
- `11***` 创建用户
    - `11401`: level 不够
    - `11422`: 用户已存在
- `20***` 文章类
    - `20404`: 文章不存在
    - `20403`: 没有修改此文章的权限
- `30***` 上游帐号类
    - `20404`: 上游帐号不存在
    - `20422`: 重复的平台帐号


## Routes 目录结构决定路由结构

```
┏━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ /api/contents  ┃  {workspaceRoot}/api/contents.js  ┃
┣━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ /api/signin    ┃  {workspaceRoot}/api/signin.js    ┃
┣━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ /api/signup    ┃  {workspaceRoot}/api/signup.js    ┃
┣━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ /api/user      ┃  {workspaceRoot}/api/user.js      ┃
┣━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ /              ┃  {workspaceRoot}/index.js         ┃
┗━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```


# JSON Web Token
```JSON
"url": "/api/signup"
"url": "/api/signin"

"method": "POST"

"req": {
    "username": "yinz",
    "password": "password"
}

"res": {
  "status": {
    "code": 0,
    "message": "success"
  },
  "data": {
    "username": "yinz",
    "id": 3,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InlpbnoxIiwiaWF0IjoxNDg2OTAwOTUyLCJleHAiOjE0ODY5ODczNTJ9.uSpPb4sk123NzHyUzu39xhp3o0Semuj_RG2XrFygE4o"
  }
}

```

其他请求应带上 header
```
"Authorization": "Bearer {jwt}"
```


# API

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
**GET** `/api/content/:id`

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

### Update
**PATCH** `/api/content/:id`

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
**GET** `/api/content/search`

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

**POST** `/api/content/:id/tag/:tag`

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

**DELETE** `/api/content/:id/tag/:tag`


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

**GET** `/api/content/most-common-tags`

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

**POST** `/api/upstream`

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
**DELETE** `/api/upstream/:id`

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
**GET** `/api/upstream/:id`

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

**Patch** `/api/upstream/:id`

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