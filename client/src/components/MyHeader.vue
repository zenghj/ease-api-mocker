<template>
  <header>
    <div class="fl">Easy Mocker</div>
    <div class="user fr"><a href="/auth/logout" class="">log out</a></div>
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
  padding: 0 2em;
  .user {
    a {
      color: initial;
      text-decoration: none;
      color: #fff;
    }
  }
}

</style>

