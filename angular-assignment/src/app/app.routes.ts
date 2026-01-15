import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { EmployeeList } from './components/employee-list/employee-list';
import { EmployeeForm } from './components/employee-form/employee-form';
import { EmployeeDetails } from './components/employee-details/employee-details';
import { EmployeeUpdate } from './components/employee-update/employee-update';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register/:role', component: RegisterComponent },
  
  // Redirect home to employees
  { path: 'home', redirectTo: 'employees', pathMatch: 'full' },
  
  // Main employee routes
  { 
    path: 'employees', 
    component: EmployeeList, 
    canActivate: [authGuard] 
  },
  { 
    path: 'employee/add', 
    component: EmployeeForm, 
    canActivate: [authGuard, roleGuard], 
    data: { role: 'Admin' } 
  },
  { 
    path: 'employee/edit/:id', 
    component: EmployeeUpdate, 
    canActivate: [authGuard, roleGuard], 
    data: { role: 'Admin' } 
  },
  { 
    path: 'employee/:id', 
    component: EmployeeDetails, 
    canActivate: [authGuard] 
  },
  
  // Designation routes
  { 
    path: 'designation', 
    loadComponent: () => import('./components/designation-list/designation-list')
      .then(m => m.DesignationList),
    canActivate: [authGuard]
  },
  
  // File Storage routes
  { 
    path: 'file-storage', 
    loadComponent: () => import('./components/file-storage/file-storage')
      .then(m => m.FileStorage),
    canActivate: [authGuard]
  },
  
  // Default routes
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];