
# 接口系统接口文档

## 帐号
1、注册
- 接口url：/auth/signup
- http类型：POST
- 请求参数：username,password

2、登录
- 接口url：/auth/login
- http类型：POST
- 请求参数：username,password

3、修改密码
- 接口url：/auth/resetpwd
- http类型：POST
- 请求参数：username,password,newPassword

## 项目CRUD
1、创建项目
- 接口url：/api/projects/:projectName
- http类型：POST
- 请求参数：无

2、查询项目列表
- 接口url：/api/projects
- http类型：GET
- 请求参数：pageSize（可选）,pageNo（可选）

3、更新项目
- 接口url：/api/projects/:projectName
- http类型：PATCH
- 请求参数：无

4、删除项目
- 接口url：/api/projects/:projectName
- http类型：DELETE
- 请求参数：isForceDelete

### 接口CRUD
1、创建接口
- 接口url：/api/projects/:projectName/:APIName
- http类型：POST
- 请求参数：reqUrl, method, canCrossDomain, reqParams, resParams, successMock, failMock, reqMock

2、查询接口
- 接口url：/api/projects/:projectName/apis
- http类型：GET
- 请求参数：pageSize,pageNo

3、更新接口
- 接口url：/api/projects/:projectName/:APIName
- http类型：PUT
- 请求参数：reqUrl, method, canCrossDomain, reqParams, resParams, successMock, failMock, reqMock, createAt, createBy, updateAt, updateBy, version, isDeleted

4、删除接口
- 接口url：/api/projects/:projectName/:APIName
- http类型：DELETE
- 请求参数：isForceDelete

## 检索















                

















