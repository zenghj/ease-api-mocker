[toc]

# Project相关的接口文档

1. 接口设计尽量遵循restful api 风格
    基本概念请参考http://www.ruanyifeng.com/blog/2014/05/restful_api.html

2. 以下“状态码”都是指http响应的状态码 
直接使用http响应的状态码标示一些状态会不会出问题？比如GET请求的200，如果因为客户端缓存返回304,如果前端代码直接处理statusCode === 200 就会出问题对吧？
这种情况304和200都会是success状态，哎，最好还是加一下status吧

3. 未登录访问接口时的响应都是：

```json
{
    "status": 401, // 401: 表示用户没有权限（令牌、用户名、密码错误）
    "message": "用户未登录"
}
```

4. 服务器未知错误的响应都是

```json
{
    "status": 500,
    "message": "未知服务器错误",
    "error": {} // error object
}
```
5. url比如`/api/projects/:projectName`中“:projectName”表示该位置的值为projectName

## 创建Project

* req

```
url: /api/projects/:projectName
method: POST
param: 无
```

* res

201状态码：创建成功

```json

{
    "status": 201, // 201: [POST/PUT/PATCH]：用户新建或修改数据成功。
    "result": { // savedProject
        "__v": 0,
        "name": "我的第2个项目",
        "createBy": "julian",
        "_id": "5a026892b1a3470a527bfd36",
        "updateAt": "2017-11-08T02:14:42.556Z",
        "createAt": "2017-11-08T02:14:42.556Z",
        "isDeleted": false
    }, 
    "message": "创建成功"
}

```

422状态码：该项目名在项目列表或回收站项目列表中已存在

```json
{
    "status": 400,
    "message": "该项目名在项目列表或回收站项目列表中已存在"
}
```

## 分页获取项目列表

* req

```
url: /api/projects
method: GET
param: {
    page: [Number], // pageNo default 1 
    limit: [Number] // pageSize default 10
}
```

* res

200 状态码 成功

```json
{
    "docs": [
        {
            "_id": "59c23bde6c862125355b7eef",
            "name": "我的第1个项目",
            "updateBy": "julian",
            "updateAt": "2017-09-20T09:58:54.227Z",
            "isDeleted": false
        }
    ],
    "total": 1,
    "limit": 10,
    "page": 1,
    "pages": 1,
    "status": 200
}

```

## 更改项目名称

* req

```
url: /api/projects/:projectId
method: PATCH
param: {
    newProjectName: [String]
}
```

* res

201 状态码 成功

```json
{
    "status": 201, 
    "message": "更新成功"
}
```

404 状态码

```json
{
    "status": 404, 
    "message": "更新的项目不存在"
}

```

400 状态码 

```json
{
    "status": 400, 
    "message": "新项目名称不能为空"
}
```


## 根据项目名称关键词分页搜索项目

* req

```
url: /api/search/projects
method: GET
param: {
    keyword: [String],
    page: [Number], // default 1
    limit: [Number] // default 10
}
```

* res

200 状态码 成功

```json
{
    "status": 200,
    "result": {
        "docs": [
            {
                "_id": "5a01be45ea6b526e5696b196",
                "name": "我的第1个项目",
                "createBy": "julian",
                "__v": 0,
                "updateAt": "2017-11-07T14:08:05.929Z",
                "createAt": "2017-11-07T14:08:05.929Z",
                "isDeleted": false
            }
        ],
        "total": 1,
        "limit": 10,
        "page": 1,
        "pages": 1
    },
    "keyword": "项目"
}
```

400 状态码

```json 
{
    "status": 400,
    "message": "keyword不能为空"
}
```


## 删除项目

* req

```
url: /api/projects/:projectId
method: DELETE
param: {
    isForceDelete: 'true' // [string]类型的'true' 表示完全删除，即从回收站删除，否则表示移动到回收站
}
```

* res

   

状态码 201

```json
{
    "status": 201,
    "message": "移入回收站成功"
}
```

204 状态码 从回收站彻底删除成功

No Content


状态码 404

```json
{
    "status": 404,
    "message": "该项目不存在"
}    
```

## 从回收站恢复项目

* req

```
url: '/api/projects/:projectId'
method: PUT
param: {
    isRecover: 'true' // [string]
}
```

* res 

状态码 201 项目恢复成功

```json
{
    "status": 201,
    "message": "项目恢复成功",
    "result": {
        "_id": "5a026892b1a3470a527bfd36",
        "name": "我的第2个项目",
        "createBy": "julian",
        "__v": 0,
        "updateAt": "2017-11-08T02:14:42.556Z",
        "createAt": "2017-11-08T02:14:42.556Z",
        "isDeleted": false
    }
}
```

状态码 404 

```json
{
    "status": 404,
    "message": "该项目不存在"
}
```

状态码 400
```json
{
    "status": 400,
    "message": "该项目不在回收站"
}
```