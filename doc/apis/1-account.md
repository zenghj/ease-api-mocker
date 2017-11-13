[toc]

# 账号相关的接口

## 注册

### req

```
url: /auth/signup
method: POST
params: {
    username: @string
    password: @string
    gender: @string // 传"male"或"female"
}
```

### req

#### 302 注册成功 重定向到首页

会根据性别随机生成卡通头像作为用户头像

#### 400 各种不合法

```json
{
    "status": 400,
    "message": ""
    // 用户名已被注册

    // 以下校验规则可以再行商定
    // 用户名不能为空   
    // 用户名长度须为3-10位
    // 密码不能为空
    // 密码需为数字或字母组合
    // 密码长度需要为6-20个字符
}
```


## 登录

### req

```
url: /auth/login
method: POST
params: {
    username: @string
    password: @string
}
```

### res

#### 302 登录成功重定向到首页或者 重定向到登录页之前的页面

#### 400 登录失败

```json
{
    "status": 400,
    "message": "登录失败",
    // 用户名不能为空
    // 密码不能为空
}
```

## 登出

### req

```
url: /auth/logout
method: POST
```
### req

#### 302 重定向到登录页


## 修改密码的接口，暂不提供给前端