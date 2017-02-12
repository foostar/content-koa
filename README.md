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


## Routes 目录结构决定路由结构

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ /api/contents                           ┃  {workspaceRoot}/api/contents.js                            ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ /api/signin                             ┃  {workspaceRoot}/api/signin.js                              ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ /api/signup                             ┃  {workspaceRoot}/api/signup.js                              ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ /api/user                               ┃  {workspaceRoot}/api/user.js                                ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ /                                       ┃  {workspaceRoot}/index.js                                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
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