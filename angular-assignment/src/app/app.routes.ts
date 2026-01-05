import { Routes } from '@angular/router';
import { EmployeeList } from './components/employee-list/employee-list';
import { EmployeeForm } from './components/employee-form/employee-form';
import { EmployeeUpdate } from './components/employee-update/employee-update';
import { EmployeeDetails } from './components/employee-details/employee-details';

export const routes: Routes = [
  { path: '', component: EmployeeList },
  { path: 'employee/add', component: EmployeeForm },
  { path: 'employee/edit/:id', component: EmployeeUpdate },
  { path: 'employee/:id', component: EmployeeDetails },
  { path: '**', redirectTo: '' }
];