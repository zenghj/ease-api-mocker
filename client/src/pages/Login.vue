<template>
  <section class="section login">
    <h1>Easy mocker</h1>
    <el-form class="login-form" action="/auth/login" method="post">
      <el-form-item label="username" prop="username">
        <el-input v-model="form.username" name="username" ></el-input>
      </el-form-item>
      <el-form-item label="password" prop="password">
        <el-input v-model="form.password" name="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" @click="login()">login</el-button>
      </el-form-item>
    </el-form>
  </section>
</template>
<script>
  import axios from 'axios'
  export default {
    data() {
      return {
        form: {
          username: '',
          password: '',
        }
      }
    },
    methods: {
      login() {
        // return axios.post('/auth/login', {
        //   username: this.form.username,
        //   password: this.form.password,
        //   }).then(res => {
        //     if(res.status !== 200) {
        //       this.$message.error(res.data.message || '登录失败');
        //     }
        //     // window.location.href = '/';
        //   }).catch(({data}) => {
        //     this.$message.error(data.message || '登录失败');
        //   })
      }
    }
  }
</script>
<style lang="less">
.section.login {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #CFD6DD;
  h1 {
    font-size: 32px;
    margin-bottom: 3em;
  }
}
.login-form {
  width: 400px;
  // margin: 0 auto;
  // position: relative;
  // top: 50%;
  // transform: translateY(-50%);
}
</style>

