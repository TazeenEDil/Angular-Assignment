import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { EmployeeList } from './components/employees/employee-list/employee-list';
import { EmployeeForm } from './components/employees/employee-form/employee-form';
import { EmployeeDetails } from './components/employees/employee-details/employee-details';
import { EmployeeUpdate } from './components/employees/employee-update/employee-update';
import { DesignationList } from './components/designation/designation-list/designation-list';
import { PositionForm } from './components/designation/position-form/position-form';
import { PositionDetails } from './components/designation/position-details/position-details';
import { FileStorage } from './components/file-storage/file-storage';
import { EmployeeAttendance} from './components/attendance/employee-attendance/employee-attendance';
import { AdminAttendance} from './components/attendance/admin-attendance/admin-attendance';
import { CheckInOutComponent } from './components/check-in-out/check-in-out';
import { EmployeeLeaveComponent } from './components/leave/employee-leave/employee-leave';
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
    data: { roles: ['Admin'] }
  },
  { 
    path: 'employee/edit/:id', 
    component: EmployeeUpdate, 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ['Admin'] } 
  },
  { 
    path: 'employee/:id', 
    component: EmployeeDetails, 
    canActivate: [authGuard] 
  },
  
  // Designation (Position) routes 
  { 
    path: 'designation/add', 
    component: PositionForm,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] } 
  },
  { 
    path: 'designation/edit/:id', 
    component: PositionForm,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },
  { 
    path: 'designation/:id', 
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
  
  // Attendance routes - Employee view (default)
  { 
    path: 'attendance', 
    component: EmployeeAttendance,
    canActivate: [authGuard]
  },

{
  path: 'attendance',
  component: EmployeeAttendance,
  canActivate: [authGuard]
},

// Admin route  
{
  path: 'attendance/admin',
  component: AdminAttendance,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin'] }
},
  // Default routes

  { 
    path: 'time-tracking', 
    component: CheckInOutComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'employee/clockin-in', 
    component: CheckInOutComponent,
    canActivate: [authGuard]
  },

 { 
    path: 'employee/clockin-out', 
    component: CheckInOutComponent,
    canActivate: [authGuard]
  },
  // Employee attendance view (default)
  { 
    path: 'attendance', 
    component: EmployeeAttendance,
    canActivate: [authGuard]
  },
  { 
    path: 'employee/attendance', 
    component: EmployeeAttendance,
    canActivate: [authGuard]
  },
  // Admin attendance management
  {
    path: 'attendance/admin',
    component: AdminAttendance,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'admin/attendance',
    component: AdminAttendance,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },
  

  { 
    path: 'leave-requests', 
    component: EmployeeLeaveComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'employee/leave', 
    component: EmployeeLeaveComponent,
    canActivate: [authGuard]
  },
  
  // Default routes
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];