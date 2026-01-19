import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PositionService, PositionDetailDto } from '../../../services/position-service';
import { AuthService } from '../../../services/auth/auth-service';
import { Modal } from '../../modal/modal';

@Component({
  selector: 'app-position-details',
  standalone: true,
  imports: [CommonModule, Modal],
  templateUrl: './position-details.html',
  styleUrls: ['./position-details.css']
})
export class PositionDetails implements OnInit {
  private positionService = inject(PositionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  position: PositionDetailDto | null = null;
  loading: boolean = false;
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  ngOnInit() {
    console.log('PositionDetails component initialized');
    console.log('Current route:', this.router.url);
    console.log('Is user logged in?', this.authService.isLoggedIn());
    
    // Check authentication first
    if (!this.authService.isLoggedIn()) {
      console.error('User not authenticated');
      this.showErrorModal('Please log in to view position details.');
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }

    // Subscribe to route params to get ID
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Route parameter ID:', id);
      
      if (id) {
        const positionId = Number(id);
        console.log('Parsed position ID:', positionId);
        
        if (!isNaN(positionId) && positionId > 0) {
          this.loadPosition(positionId);
        } else {
          console.error('Invalid position ID:', id);
          this.showErrorModal('Invalid position ID');
        }
      } else {
        console.error('No ID parameter in route');
        this.showErrorModal('No position ID provided');
      }
    });
  }

  loadPosition(id: number) {
    console.log('Loading position with ID:', id);
    console.log('API URL will be: http://localhost:5224/api/positions/' + id);
    
    this.loading = true;
    
    this.positionService.getPositionById(id).subscribe({
      next: position => {
        console.log('Position loaded successfully:', position);
        this.position = position;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load position:');
        console.error('- Status:', err.status);
        console.error('- Status Text:', err.statusText);
        console.error('- Error:', err.error);
        console.error('- Message:', err.message);
        console.error('- Full error object:', err);
        
        this.loading = false;
        
        // Handle specific error cases
        if (err.status === 401) {
          this.showErrorModal('Authentication required. Please log in again.');
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 2000);
        } else if (err.status === 403) {
          this.showErrorModal('You do not have permission to view this position.');
        } else if (err.status === 404) {
          this.showErrorModal('Position not found.');
        } else if (err.status === 500) {
          const errorMsg = err.error?.message || 'Server error occurred.';
          this.showErrorModal(`Server error: ${errorMsg}`);
        } else {
          this.showErrorModal('Failed to load position details. Please try again.');
        }
      }
    });
  }

  goBack() {
    console.log('Navigating back to designation list');
    this.router.navigate(['/designation']);
  }

  showErrorModal(message: string) {
    this.modalTitle = 'Error';
    this.modalMessage = message;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    if (this.modalTitle === 'Error') {
      this.goBack();
    }
  }
}