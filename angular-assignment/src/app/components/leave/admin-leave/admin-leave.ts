import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { LeaveService } from '../../../services/leave';
import { Modal } from '../../modal/modal';
import { LeaveRequest } from '../../../models/leave.model';

@Component({
  selector: 'app-admin-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './admin-leave.html',
  styleUrls: ['./admin-leave.css']
})
export class AdminLeaveComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private cdr = inject(ChangeDetectorRef);

  pendingLeaves: LeaveRequest[] = [];
  selectedLeave: LeaveRequest | null = null;
  
  showLeaveModal = false;
  rejectionReason = '';
  processingLeave = false;
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  
  loading = false;

  ngOnInit() {
    console.log('🚀 Admin Leave Component Initialized');
    this.loadPendingLeaves();
  }

  async loadPendingLeaves() {
    this.loading = true;
    console.log('📥 Loading pending leave requests...');
    
    try {
      this.pendingLeaves = await firstValueFrom(this.leaveService.getPendingRequests()) || [];
      console.log('✅ Pending leaves loaded:', this.pendingLeaves.length);
      
      if (this.pendingLeaves.length > 0) {
        console.log('📋 First leave:', this.pendingLeaves[0]);
      }
    } catch (error: any) {
      console.error('❌ Error loading pending leaves:', error);
      this.pendingLeaves = [];
      const errorMsg = error?.message || error?.error?.message || 'Unknown error occurred';
      this.showMessage('Error', `Failed to load pending leave requests: ${errorMsg}`);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  openLeaveModal(leave: LeaveRequest) {
    console.log('📝 Opening leave review modal for:', leave);
    this.selectedLeave = leave;
    this.showLeaveModal = true;
    this.rejectionReason = '';
    this.cdr.detectChanges();
  }

  closeLeaveModal() {
    console.log('🚪 Closing leave modal');
    this.showLeaveModal = false;
    this.selectedLeave = null;
    this.rejectionReason = '';
    this.cdr.detectChanges();
  }

  async approveLeave() {
    if (!this.selectedLeave) return;
    
    this.processingLeave = true;
    const employeeName = this.selectedLeave.employeeName;
    const leaveRequestId = this.selectedLeave.leaveRequestId;
    
    console.log('✅ Approving leave request:', leaveRequestId);
    
    try {
      await firstValueFrom(
        this.leaveService.approveOrRejectLeave(leaveRequestId, true)
      );
      
      console.log('✅ Leave approved successfully');
      
      this.closeLeaveModal();
      
      const approvalDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      this.showMessage(
        'Leave Approved ✓', 
        `Leave request for ${employeeName} has been approved. 

📧 An email notification has been sent to the employee on ${approvalDate}.`
      );
      
      await this.loadPendingLeaves();
      
    } catch (error: any) {
      console.error('❌ Error approving leave:', error);
      
      const errorMsg = error?.message || error?.error?.message || 'Failed to approve leave request';
      
      // Check if email failed but leave was approved
      if (errorMsg.toLowerCase().includes('email failed') || 
          errorMsg.toLowerCase().includes('but email') ||
          errorMsg.toLowerCase().includes('has no email')) {
        this.showMessage(
          '⚠️ Partial Success', 
          `Leave was APPROVED in the database, but email notification could not be sent to ${employeeName}.

Error details: ${errorMsg}

⚠️ Please manually notify the employee about their approved leave request.`
        );
        await this.loadPendingLeaves();
      } else {
        this.showMessage('Error', errorMsg);
      }
    } finally {
      this.processingLeave = false;
      this.cdr.detectChanges();
    }
  }

  async rejectLeave() {
    if (!this.selectedLeave) return;
    
    if (!this.rejectionReason.trim()) {
      this.showMessage('Validation Error', 'Please provide a reason for rejecting this leave request.');
      return;
    }
    
    this.processingLeave = true;
    const employeeName = this.selectedLeave.employeeName;
    const leaveRequestId = this.selectedLeave.leaveRequestId;
    
    console.log('❌ Rejecting leave request:', leaveRequestId);
    console.log('  - Reason:', this.rejectionReason);
    
    try {
      await firstValueFrom(
        this.leaveService.approveOrRejectLeave(
          leaveRequestId,
          false,
          this.rejectionReason
        )
      );
      
      console.log('✅ Leave rejected successfully');
      
      this.closeLeaveModal();
      
      const rejectionDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      this.showMessage(
        'Leave Rejected', 
        `Leave request for ${employeeName} has been rejected. 

📧 An email notification has been sent to the employee on ${rejectionDate}.`
      );
      
      await this.loadPendingLeaves();
      
    } catch (error: any) {
      console.error('❌ Error rejecting leave:', error);
      
      const errorMsg = error?.message || error?.error?.message || 'Failed to reject leave request';
      
      // Check if email failed but leave was rejected
      if (errorMsg.toLowerCase().includes('email failed') || 
          errorMsg.toLowerCase().includes('but email') ||
          errorMsg.toLowerCase().includes('has no email')) {
        this.showMessage(
          '⚠️ Partial Success', 
          `Leave was REJECTED in the database, but email notification could not be sent to ${employeeName}.

Error details: ${errorMsg}

⚠️ Please manually notify the employee about their rejected leave request.`
        );
        await this.loadPendingLeaves();
      } else {
        this.showMessage('Error', errorMsg);
      }
    } finally {
      this.processingLeave = false;
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

  showMessage(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    console.log('🚪 Closing message modal');
    this.showModal = false;
    this.modalTitle = '';
    this.modalMessage = '';
    this.cdr.detectChanges();
  }
}