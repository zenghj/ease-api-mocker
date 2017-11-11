
# 接口系统
这是一个用于便于前后端进行接口对接，用于管理接口文档的平台

## Environment
开发时使用的环境为：node: 8.9.0 , npm: 5.5.1


## How to start

1. clone project
2. 进入项目根目录，执行npm install
3. 启动mongodb和redis. 如未安装请先进行安装
4. npm run start 启动项目 127.0.0.1:3000


## 目录说明

/config 不同环境（开发／测试）下的配置文件

/db 数据库Model文件

/doc 项目文档
**/doc/apis 所有接口相关的文档**

/lib 放一些公共的方法库

/logs 接口访问日志

/middlewares 中间件

/routes 路由

/test 测试文件

/app.js 入口文件


## 开发注意事项

开发或调整接口之后，最好能够到/test目录下同步更改测试用例，然后执行`npm run test`测试接口，接口自动化测试使用的是mocha + chai + supertest
