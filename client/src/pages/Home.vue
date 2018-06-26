<template>
  <section class="home section">
    <h1>To Make Front-End Dev Easier</h1>
    <router-link :to="{name: 'Projects'}">
      <el-button round type="">start using</el-button>
    </router-link>
  </section>
</template>
<style scoped lang="less">
.home.section {
  display: flex;
  flex-direction: column;
  /* align-items: space-around; */
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  background: #409EFF;
  font-size: 28px;
  h1 {
    margin-bottom: 2em;
    color: #fff;
  }
}
</style>
