import Vue from 'vue'
import Router from 'vue-router'
import Home from '../pages/Home.vue'
import Projects from '../pages/Projects.vue'
import Login from '../pages/Login.vue'
import ProjectDetail from '../pages/ProjectDetail.vue'
Vue.use(Router)
export default new Router({
  mode: 'history',
  fallback: false,
  routes: [
    {
      path: '/page/',
      name: 'Home',
      alias: '/',
      component: Home
    }, {
      path: '/page/projects.html',
      name: 'Projects',
      component: Projects
    }, {
      path: '/page/projects/:projectId',
      name: 'ProjectDetail',
      component: ProjectDetail,
      props: route => ({
        project: JSON.parse(decodeURIComponent(route.query.project))
      })
    }, {
      path: '/authPage/login',
      name: 'Login',
      component: Login
    }
  ]
})
