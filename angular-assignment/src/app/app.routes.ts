import { Routes } from '@angular/router';
import { EmployeeList } from './components/employee-list/employee-list';
import { EmployeeForm } from './components/employee-form/employee-form';
import { EmployeeDetails } from './components/employee-details/employee-details';
import { EmployeeUpdate } from './components/employee-update/employee-update';

export const routes: Routes = [
     { path: '', component: EmployeeList },
  { path: 'add', component: EmployeeForm},
  { path: 'details/:id', component: EmployeeDetails }, 
  { path: 'update/:id', component: EmployeeUpdate },
];
