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
import { EmployeeAttendance } from './components/attendance/employee-attendance/employee-attendance';
import { AdminAttendance } from './components/attendance/admin-attendance/admin-attendance';
import { CheckInOut } from './components/check-in-out/check-in-out';
import { AdminTimeTracking } from './components/time-tracking/admin-time-tracking/admin-time-tracking';
import { EmployeeLeave } from './components/leave/employee-leave/employee-leave';
import { AdminLeaveComponent } from './components/leave/admin-leave/admin-leave';
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
  
  // ============================================
  // TIME TRACKING ROUTES
  // ============================================
  // Employee check-in/out (default for 'time-tracking')
  { 
    path: 'time-tracking', 
    component: CheckInOut,
    canActivate: [authGuard]
  },
  { 
    path: 'employee/check-in-out', 
    component: CheckInOut,
    canActivate: [authGuard]
  },
  // Admin time tracking overview
  {
    path: 'time-tracking/admin',
    component: AdminTimeTracking,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'admin/time-tracking',
    component: AdminTimeTracking,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },
  
  // ============================================
  // ATTENDANCE ROUTES
  // ============================================
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
  
  // ============================================
  // LEAVE MANAGEMENT ROUTES
  // ============================================
  // Employee leave requests
  { 
    path: 'leave-requests', 
    component: EmployeeLeave,
    canActivate: [authGuard]
  },
  { 
    path: 'employee/leave', 
    component: EmployeeLeave,
    canActivate: [authGuard]
  },
  // Admin leave management
  {
    path: 'leave/admin',
    component: AdminLeaveComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'admin/leave',
    component: AdminLeaveComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },
  
  // Default routes
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];