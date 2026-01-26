import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { LeaveService } from '../../../services/leave';
import { Modal } from '../../modal/modal';
import { LeaveType, LeaveRequest } from '../../../models/leave.model';

@Component({
  selector: 'app-employee-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './employee-leave.html',
  styleUrls: ['./employee-leave.css']
})
export class EmployeeLeaveComponent implements OnInit {
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

  ngOnInit() {
    console.log('🚀 Employee Leave Component Initialized');
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
      
      if (this.leaveTypes.length > 0) {
        console.log('📋 First leave type:', this.leaveTypes[0]);
      }
      
      // Load my leave requests
      console.log('📝 Loading my leave requests...');
      try {
        this.myLeaveRequests = await firstValueFrom(this.leaveService.getMyLeaveRequests()) || [];
        console.log('✅ Leave requests loaded:', this.myLeaveRequests.length);
      } catch (leaveError: any) {
        console.error('⚠️ Error loading leave requests:', leaveError);
        console.error('  - Status:', leaveError.status);
        console.error('  - Error body:', leaveError.error);
        this.myLeaveRequests = [];
      }
      
      console.log('✅ All leave data loaded successfully!');
      
    } catch (error: any) {
      console.error('❌ Error loading leave data:', error);
      console.error('  - Status:', error.status);
      console.error('  - Error body:', error.error);
      this.showMessage('Error', 'Failed to load leave data: ' + (error.error?.message || error.message));
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  openLeaveModal() {
    console.log('📝 Opening leave modal');
    console.log('Available leave types:', this.leaveTypes);
    
    if (this.leaveTypes.length === 0) {
      console.error('❌ No leave types available');
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
    
    console.log('✅ Leave modal opened');
    console.log('Initial form:', this.leaveForm);
    
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
    console.log('✅ Leave modal closed');
  }

  async submitLeaveRequest() {
    console.log('📤 Submitting leave request');
    console.log('Form data:', this.leaveForm);
    
    // Validate form
    if (!this.leaveForm.leaveTypeId || this.leaveForm.leaveTypeId === 0) {
      console.error('❌ Leave type not selected');
      this.showMessage('Error', 'Please select a leave type');
      return;
    }
    
    if (!this.leaveForm.startDate) {
      console.error('❌ Start date not provided');
      this.showMessage('Error', 'Please select a start date');
      return;
    }
    
    if (!this.leaveForm.endDate) {
      console.error('❌ End date not provided');
      this.showMessage('Error', 'Please select an end date');
      return;
    }
    
    if (!this.leaveForm.reason || !this.leaveForm.reason.trim()) {
      console.error('❌ Reason not provided');
      this.showMessage('Error', 'Please provide a reason for leave');
      return;
    }
    
    // Validate dates
    const startDate = new Date(this.leaveForm.startDate);
    const endDate = new Date(this.leaveForm.endDate);
    
    if (startDate > endDate) {
      console.error('❌ Invalid date range');
      this.showMessage('Error', 'End date must be after start date');
      return;
    }
    
    try {
      console.log('🚀 Calling leave service...');
      
      await firstValueFrom(this.leaveService.createLeaveRequest(this.leaveForm));
      
      console.log('✅ Leave request created successfully');
      this.showMessage('Success', 'Leave request submitted successfully');
      this.closeLeaveModal();
      
      await this.loadLeaveData();
    } catch (error: any) {
      console.error('❌ Error submitting leave request:', error);
      console.error('Error status:', error.status);
      console.error('Error message:', error.message);
      console.error('Error body:', error.error);
      
      this.showMessage('Error', error.error?.message || 'Failed to submit leave request');
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
    console.log('🚪 Closing modal');
    this.showModal = false;
    this.modalTitle = '';
    this.modalMessage = '';
    this.cdr.detectChanges();
    console.log('✅ Modal closed');
  }
}