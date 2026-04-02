// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import EmployeesView from '../views/EmployeesView.vue';
import EmployeeDetailView from '../views/EmployeeDetailView.vue';

const routes = [
  { path: '/', name: 'dashboard', component: DashboardView },
  { path: '/employees', name: 'employees', component: EmployeesView },
  { path: '/employees/:id', name: 'employee-detail', component: EmployeeDetailView },
  // Phase 2 redirects
  { path: '/forge', redirect: '/employees' },
  { path: '/assets', redirect: '/employees' },
];

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});
