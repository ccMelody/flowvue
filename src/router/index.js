import Vue from 'vue'
import VueRouter from 'vue-router'
import Approver from '../views/approver.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'approver',
    component: Approver
  },
  // {
  //   path: '/approver',
  //   name: 'Approver',
  //   component: () => import('../views/approver.vue')
  // }
]
const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
