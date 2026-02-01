import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { LeaveService } from '../../../services/leave-service';
import { Modal } from '../../modal/modal';
import { LeaveType, LeaveRequest } from '../../../models/leave.model';

@Component({
  selector: 'app-employee-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './employee-leave.html',
  styleUrls: ['./employee-leave.css']
})
export class EmployeeLeave implements OnInit {
  private leaveService = inject(LeaveService);
  private cdr = inject(ChangeDetectorRef);

  leaveTypes: LeaveType[] = [];
  myLeaveRequests: LeaveRequest[] = [];
  
  showLeaveModal = false;
  leaveForm = {
    leaveTypeId: 0,
    startDate: '',
    endDate: '',
    reason: ''
  };
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  
  loading = false;
  submitting = false;

  ngOnInit() {
    console.log('🚀 Employee Leave Component Init');
    this.loadLeaveData();
  }

  async loadLeaveData() {
    this.loading = true;
    console.log('📥 Loading leave data...');
    
    try {
      // Load leave types
      console.log('🏖️ Loading leave types...');
      this.leaveTypes = await firstValueFrom(this.leaveService.getLeaveTypes()) || [];
      console.log('✅ Leave types loaded:', this.leaveTypes.length);
      
      // Load my leave requests
      console.log('📝 Loading my leave requests...');
      this.myLeaveRequests = await firstValueFrom(this.leaveService.getMyLeaveRequests()) || [];
      console.log('✅ Leave requests loaded:', this.myLeaveRequests.length);
      
    } catch (error: any) {
      console.error('❌ Error loading leave data:', error);
      
      if (error.status === 401) {
        this.showMessage('Authentication Error', 'Please log out and log in again.');
      } else {
        this.showMessage('Error', 'Failed to load leave data: ' + (error.error?.message || error.message));
      }
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  openLeaveModal() {
    console.log('📝 Opening leave modal');
    
    if (this.leaveTypes.length === 0) {
      this.showMessage('Error', 'No leave types available. Please contact HR.');
      return;
    }
    
    this.showLeaveModal = true;
    this.leaveForm = {
      leaveTypeId: this.leaveTypes[0].leaveTypeId,
      startDate: '',
      endDate: '',
      reason: ''
    };
    
    this.cdr.detectChanges();
  }

  closeLeaveModal() {
    console.log('🚪 Closing leave modal');
    this.showLeaveModal = false;
    this.leaveForm = {
      leaveTypeId: 0,
      startDate: '',
      endDate: '',
      reason: ''
    };
    this.cdr.detectChanges();
  }

  async submitLeaveRequest() {
    console.log('📤 Submitting leave request');
    
    // Validate form
    if (!this.leaveForm.leaveTypeId || this.leaveForm.leaveTypeId === 0) {
      this.showMessage('Validation Error', 'Please select a leave type');
      return;
    }
    
    if (!this.leaveForm.startDate) {
      this.showMessage('Validation Error', 'Please select a start date');
      return;
    }
    
    if (!this.leaveForm.endDate) {
      this.showMessage('Validation Error', 'Please select an end date');
      return;
    }
    
    if (!this.leaveForm.reason || !this.leaveForm.reason.trim()) {
      this.showMessage('Validation Error', 'Please provide a reason for leave');
      return;
    }
    
    // Validate dates
    const startDate = new Date(this.leaveForm.startDate);
    const endDate = new Date(this.leaveForm.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      this.showMessage('Validation Error', 'Start date cannot be in the past');
      return;
    }
    
    if (startDate > endDate) {
      this.showMessage('Validation Error', 'End date must be after or equal to start date');
      return;
    }
    
    this.submitting = true;
    
    try {
      console.log('🚀 Calling leave service...');
      console.log('   Leave Type ID:', this.leaveForm.leaveTypeId);
      console.log('   Start Date:', this.leaveForm.startDate);
      console.log('   End Date:', this.leaveForm.endDate);
      console.log('   Reason:', this.leaveForm.reason);
      
      await firstValueFrom(this.leaveService.createLeaveRequest(this.leaveForm));
      
      console.log('✅ Leave request created successfully');
      
      this.closeLeaveModal();
      
      this.showMessage(
        'Success ✓', 
        'Your leave request has been submitted successfully and is pending approval from management.'
      );
      
      await this.loadLeaveData();
      
    } catch (error: any) {
      console.error('❌ Error submitting leave request:', error);
      
      // Extract error message
      let errorMessage = 'Failed to submit leave request';
      
      if (error.status === 401) {
        errorMessage = 'Your session has expired. Please log out and log in again.';
        this.showMessage('Authentication Error', errorMessage);
        return;
      }
      
      // ✅ Check for leave balance errors
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // ✅ Detect leave limit errors and show appropriate modal
      const lowerError = errorMessage.toLowerCase();
      
      if (lowerError.includes('exceeds') || 
          lowerError.includes('remaining') || 
          lowerError.includes('exhausted') ||
          lowerError.includes('allotment') ||
          lowerError.includes('left')) {
        
        console.warn('⚠️ Leave balance exceeded:', errorMessage);
        
        // Show error in modal with red styling
        this.showMessage('Leave Balance Exceeded ⚠️', errorMessage);
      } else {
        // Other errors
        this.showMessage('Error', errorMessage);
      }
      
    } finally {
      this.submitting = false;
      this.cdr.detectChanges();
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getLeaveStatusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'leave-approved';
      case 'Rejected': return 'leave-rejected';
      case 'Pending': return 'leave-pending';
      default: return '';
    }
  }

  showMessage(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this.modalTitle = '';
    this.modalMessage = '';
    this.cdr.detectChanges();
  }
}