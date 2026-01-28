import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
export class EmployeeLeave implements OnInit {
  private leaveService = inject(LeaveService);

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
  showCancelButton = false;
  
  loading = false;
  submitting = false;

  ngOnInit() {
    console.log('Employee leave component initialized');
    this.loadLeaveData();
  }

  loadLeaveData() {
    this.loading = true;
    
    // Load leave types
    this.leaveService.getLeaveTypes().subscribe({
      next: (types) => {
        this.leaveTypes = types || [];
        console.log('Leave types loaded:', this.leaveTypes.length);
        
        // Load my leave requests
        this.leaveService.getMyLeaveRequests().subscribe({
          next: (requests) => {
            this.myLeaveRequests = requests || [];
            this.loading = false;
          },
          error: (error) => {
            console.error('Failed to load leave requests:', error);
            if (error.status === 401) {
              this.showErrorModal('Session expired. Please login again.');
            } else if (error.status === 403) {
              this.showErrorModal('You do not have permission to view leave requests.');
            } else {
              this.myLeaveRequests = [];
              console.log('No leave requests found (this may be normal)');
            }
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Failed to load leave types:', error);
        if (error.status === 401 || error.status === 403) {
          this.showErrorModal('Authentication error. Please login again.');
        } else {
          this.showErrorModal('Failed to load leave types. Please try again.');
        }
        this.loading = false;
      }
    });
  }

  openLeaveModal() {
    if (this.leaveTypes.length === 0) {
      this.showErrorModal('No leave types available. Contact HR.');
      return;
    }
    
    this.showLeaveModal = true;
    this.leaveForm = {
      leaveTypeId: this.leaveTypes[0].leaveTypeId,
      startDate: '',
      endDate: '',
      reason: ''
    };
  }

  closeLeaveModal() {
    this.showLeaveModal = false;
    this.leaveForm = {
      leaveTypeId: 0,
      startDate: '',
      endDate: '',
      reason: ''
    };
  }

  submitLeaveRequest() {
    // Validate form
    if (!this.leaveForm.leaveTypeId || this.leaveForm.leaveTypeId === 0) {
      this.showErrorModal('Please select a leave type');
      return;
    }
    
    if (!this.leaveForm.startDate) {
      this.showErrorModal('Please select a start date');
      return;
    }
    
    if (!this.leaveForm.endDate) {
      this.showErrorModal('Please select an end date');
      return;
    }
    
    if (!this.leaveForm.reason || !this.leaveForm.reason.trim()) {
      this.showErrorModal('Please provide a reason for leave');
      return;
    }
    
    // Validate dates
    const startDate = new Date(this.leaveForm.startDate);
    const endDate = new Date(this.leaveForm.endDate);
    
    if (startDate > endDate) {
      this.showErrorModal('End date must be after start date');
      return;
    }
    
    this.submitting = true;
    this.leaveService.createLeaveRequest(this.leaveForm).subscribe({
      next: () => {
        this.showSuccessModal('Leave request submitted successfully!');
        this.closeLeaveModal();
        this.loadLeaveData();
        this.submitting = false;
      },
      error: (error) => {
        console.error('Failed to submit leave request:', error);
        if (error.status === 401) {
          this.showErrorModal('Session expired. Please login again.');
        } else if (error.status === 403) {
          this.showErrorModal('You do not have permission to create leave requests.');
        } else {
          this.showErrorModal(error.error?.message || 'Failed to submit leave request. Please try again.');
        }
        this.submitting = false;
      }
    });
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

  showSuccessModal(message: string) {
    this.modalTitle = 'Success';
    this.modalMessage = message;
    this.showCancelButton = false;
    this.showModal = true;
  }

  showErrorModal(message: string) {
    this.modalTitle = 'Error';
    this.modalMessage = message;
    this.showCancelButton = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.showCancelButton = false;
  }
}