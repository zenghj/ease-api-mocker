<template>
  <section class="home section">
    <div class="container">
      <h2 class="slogon">To Make Front-End Dev Easier</h2>
      <h4 class="text-center">本应用提供一个简单的静态mock服务器，便于本地开发项目时提供mock方案，实现前端开发完全不依赖于后端</h4>
      <br />
      <div class="text-center start-use">
        <router-link :to="{name: 'Projects'}">
          <el-button round type="">立即使用</el-button>
        </router-link>
      </div>
      <h4>使用步骤</h4>
      <br />
      <h4>1. 创建项目</h4>
      <div><img src="../assets/img/cp.jpeg" alt=""></div>
      <h4>2. 在创建的项目中创建mock接口</h4>
      <div><img src="../assets/img/ca.jpeg" alt=""></div>
      <div><img src="../assets/img/cs.jpeg" alt=""></div>
      <h4>3. 本地开发代理转发配置</h4>
      <br />
      <h5>假定你使用的是webpack，你只需要作类似如下配置，它的作用是将'/api/*'的接口代理到'http://47.95.13.52:3389/mock/api/*'，你需要根据你的接口的实际情况做出相应的代理配置</h5>
      <br/>
      <textarea name="" id="" rows="11" class="code" readonly>
        module.exports = { 
          ... 
          devServer: { 
            proxy: { 
              '/api': { 
                target: 'http://45.62.111.182:3389/mock' 
              }
            } 
          } 
        }
      </textarea>
      <div class="text-center start-use">
        <router-link :to="{name: 'Projects'}">
          <el-button round type="">开始使用</el-button>
        </router-link>
      </div>

    </div>
  </section>
</template>
<style scoped lang="less">
.home.section {
  background: #409eff;
  padding-bottom: 1em;
  h1 {
    font-size: 2em;
  }
  h2 {
    font-size: 1.5em;
  }
  h3 {
    font-size: 1.17em;
  }
  h4 {
    font-size: 1.12em;
  }
  h5 {
    font-size: 0.83em;
  }
  h6 {
    font-size: 0.75em;
  }
  .container {
    width: 75%;
    margin: 0 auto;
    line-height: 1.1em;
    color: #fff;
    .slogon {
      text-align: center;
      padding: 2em 0;
    }
    .text-center {
      text-align: center;
    }
    .start-use {
      padding: 1.5em 0;
    }
    img {
      width: 90%;
      display: block;
      margin: 1em auto;
      box-shadow: 0px 0px 20px #1d4975;
    }
    .code {
      display: block;
      width: 90%;
      margin: 0 auto;
      resize: none;
      border: none;
      outline: none;
    }
  }
}
</style>
