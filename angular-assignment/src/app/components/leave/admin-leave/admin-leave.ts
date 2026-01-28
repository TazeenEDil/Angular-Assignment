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
      console.error('  - Status:', error.status);
      console.error('  - Error body:', error.error);
      this.pendingLeaves = [];
      this.showMessage('Error', 'Failed to load pending leave requests: ' + (error.error?.message || error.message));
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
        'Leave Approved', 
        `Leave request has been approved. An email notification has been sent to ${employeeName} dated ${approvalDate}.`
      );
      
      await this.loadPendingLeaves();
      
    } catch (error: any) {
      console.error('❌ Error approving leave:', error);
      this.showMessage('Error', error.error?.message || 'Failed to approve leave request');
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
        `Leave request has been rejected. An email notification has been sent to ${employeeName} dated ${rejectionDate}.`
      );
      
      await this.loadPendingLeaves();
      
    } catch (error: any) {
      console.error('❌ Error rejecting leave:', error);
      this.showMessage('Error', error.error?.message || 'Failed to reject leave request');
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