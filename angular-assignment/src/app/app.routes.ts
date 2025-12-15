import { Routes } from '@angular/router';
import { EmployeeList } from './components/employee-list/employee-list';
import { EmployeeForm } from './components/employee-form/employee-form';
export const routes: Routes = [
     { path: '', component: EmployeeList },
  { path: 'add', component: EmployeeForm}
];
