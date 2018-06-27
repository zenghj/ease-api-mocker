<template>
  <header>
    <div class="header-content clearfix">
          <div class="fl"><router-link :to="{name: 'Projects'}">Easy Mocker</router-link></div>
          <div class="user fr"><a href="/auth/logout" class="">log out</a></div>
    </div>
  </header>
</template>
<style scoped lang="less">
@import '../assets/less/vars.less';
header {
  
  height: 40px;
  line-height: 40px;

  margin-bottom: 20px;
  background: @primaryColor;
  color: #fff;
  font-size: 14px;
  // padding: 0 2em;
 
  .header-content {
    width: 1200px;
    margin: 0 auto;
  }
  .user {
    a {
      color: initial;
      text-decoration: none;
      color: #fff;
    }
  }
}

</style>

