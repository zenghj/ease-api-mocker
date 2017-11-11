[toc]
# api相关的接口

## 在项目中创建api

### req 

```
url: /api/projects/:projectId/:APIName  （ APIName 注意记得 encodeURIComponent)
method: POST
param: {
    method: @string HTTP 支持的 method 包括： 'GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'
    reqUrl: @string且是 url格式 （要不要带协议呢，还是再加一字段表示是否支持https，有必要吗）
    canCrossDomain: @boolean
    reqParams: [{
        name: @string, // 参数名称 
        required: @boolean, // 是否必填
        describe: @string   // 参数说明
        type: @string // 参数类型
    }]
    resParams: 数组，同reqParams
    successMock: 非空
    failMock: 非空
}
```

### res

#### 状态码 404
    
```json
{
    "status": 404,
    "message": "id为 ${projectId} 的项目不存在"
}
```
#### 状态码 201

```json
{
    "status": 201,
    "message": "创建成功",
    "result": {
        // api结构同“读取api详情”中的api结构
    }
}
```

#### 状态码 400 (各种参数不合法)

```json
{
    "status": 400,
    "message": "响应的校验错误信息"
    // 包括：
    // reqUrl接口路径不能为空
    // reqUrl接口路径不是合法的url格式
    //
    // http请求方式不合法（注意method字段应为大写字母）
    //
    // 返回成功数据successMock不能为空
    //
    // 返回失败数据failMock不能为空
    //
    // 是否能跨域canCrossDomain不能为空，且为布尔值
    //
    // reqParams[${i}]中${name/describe/type}字段应该为字符串且不为空
    // reqParams[${i}]中required字段应该为布尔值
    // resParams 同 reqParams
}
```


## 读取api详情

### req

```
url: /api/projects/:projectId/:apiId
method: GET
params: 无
```

### res

#### 200状态码 

```json
{
    "status": 200,
    "message": "获取成功",
    "result": { // api 数据结构
                "_id": "5a030ab49e8f485430657161",
                "APIName": "testn",
                "reqUrl": "http://127.0.0.1:3000/",
                "method": "POST",
                "canCrossDomain": true,
                "reqParams": {},
                "resParams": {},
                "createBy": "julian",
                "updateBy": "julian",
                "updateAt": "2017-11-08T13:46:28.441Z",
                "createAt": "2017-11-08T13:46:28.441Z",
                "version": "v0.0.1",
                "isDeleted": false
    }
}
```

#### 404 状态码

```json
{
    "status": 404,
    "message": "id为${projectId}的项目下不存在id为 ${apiId} 的接口",
}
```


## 更新api详情

### req

```
url: /api/projects/:projectId/:apiId
method: PUT
params: 格式及校验要求同"创建api"
```

### res

#### 201 状态码

```json
{
    "status": 201,
    "message": "更新成功",
}
```

#### 404 状态码

```json
{
    "status": 404,
    "message": "id为${projectId} 的项目下不存在id为 ${apiId}的api",
}
```

## 删除api

### req

```
url: /api/projects/:projectId/:apiId
method: DELETE
params: {
    isForceDelete: 'true' // 从回收站强制删除时传'true',否则不传
}
```

### res

#### 201 状态码

```json
{
    "status": 201,
    "message": "移入回收站成功",
}
```

#### 204 状态码 从回收站彻底删除成功
No-Content

#### 404 状态码

```json
{
    "status": 404,
    "message": "id为${projectId} 的项目下不存在id为 ${apiId}的api",
}
```

## 从回收站恢复api

### req
```
url: /api/projects/:projectId/:apiId
method: PATCH
params: {
    isRecover: 'true'
}
```

### res


#### 201 状态码

```json
{
    "status": 201,
    "message": "移出回收站成功",
    "result": {
        // 包含的api的所有字段及api id信息
    }
}
```

#### 404 状态码

```json
{
    "status": 404,
    "message": "id为${projectId} 的项目下不存在id为 ${apiId}的api",
}
```

## 分页读取当前项目下的apis

### req

```
url: /api/:projectId/apis
method: GET
params: {
    limit: @number // page size, default 10
    page: @number // page number, default 1
}
```

### res

#### 200 状态码

```json
{
    "status": 200,
    "message": "获取api成功",
    "result": {
        "docs": [{
                "_id": "5a030ab49e8f485430657161",
                "APIName": "testn",
                "reqUrl": "http://127.0.0.1:3000/",
                "method": "POST",
                "canCrossDomain": true,
                "reqParams": {},
                "resParams": {},
                "createBy": "julian",
                "updateBy": "julian",
                "updateAt": "2017-11-08T13:46:28.441Z",
                "createAt": "2017-11-08T13:46:28.441Z",
                "version": "v0.0.1",
                "isDeleted": false
            }
        ],
        "total": 1,
        "limit": 10,
        "page": 1,
        "pages": 1
    }
}
```

## 当前项目下关键词搜索api

### req

```
url: /api/:projectId/apis
method: GET
params: {
    keyword: @string
    limit: @number // page size, default 10
    page: @number // page number, default 1
}
```

### res

#### 200 状态码

```json
{
    "status": 200,
    "message": "获取成功",
    "keyword": "keyword",
    "result": [{
        // api结构同“读取api详情”中的api结构
    }]
}
```

#### 400 状态码
```json

{
    "status": 400,
    "message": "keyword不能为空"
}
```