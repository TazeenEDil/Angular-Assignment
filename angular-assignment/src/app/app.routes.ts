import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { EmployeeList } from './components/employees/employee-list/employee-list';
import { EmployeeForm } from './components/employees/employee-form/employee-form';
import { EmployeeDetails } from './components/employees/employee-details/employee-details';
import { EmployeeUpdate } from './components/employees/employee-update/employee-update';
import { DesignationList } from './components/designation/designation-list/designation-list';
import { PositionForm } from './components/designation/position-form/position-form';
import { PositionDetails } from './components/designation/position-details/position-details'; // 🔥 ADD THIS IMPORT
import { FileStorage } from './components/file-storage/file-storage';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register/:role', component: RegisterComponent },
  
  // Redirect home to employees
  { path: 'home', redirectTo: 'employees', pathMatch: 'full' },
  
  // Employee routes
  { 
    path: 'employees', 
    component: EmployeeList, 
    canActivate: [authGuard] 
  },
  { 
    path: 'employee/add', 
    component: EmployeeForm, 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ['Admin'] } // 🔥 CHANGED 'role' to 'roles' (array)
  },
  { 
    path: 'employee/edit/:id', 
    component: EmployeeUpdate, 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ['Admin'] } // 🔥 CHANGED 'role' to 'roles' (array)
  },
  { 
    path: 'employee/:id', 
    component: EmployeeDetails, 
    canActivate: [authGuard] 
  },
  
  // Designation (Position) routes - SPECIFIC ROUTES FIRST!
  { 
    path: 'designation/add', 
    component: PositionForm,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] } // 🔥 CHANGED 'role' to 'roles' (array)
  },
  { 
    path: 'designation/edit/:id', 
    component: PositionForm,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] } // 🔥 CHANGED 'role' to 'roles' (array)
  },
  { 
    path: 'designation/:id', // 🔥 ADD THIS ROUTE - Must come AFTER specific routes
    component: PositionDetails,
    canActivate: [authGuard]
  },
  { 
    path: 'designation', 
    component: DesignationList,
    canActivate: [authGuard]
  },
  
  // File Storage routes
  { 
    path: 'file-storage', 
    component: FileStorage,
    canActivate: [authGuard]
  },
  
  // Default routes
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];