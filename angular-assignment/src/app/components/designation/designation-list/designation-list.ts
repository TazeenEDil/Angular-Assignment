import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PositionService, PositionDetailDto } from '../../../services/position-service';
import { AuthService } from '../../../services/auth/auth-service';
import { Modal } from '../../modal/modal';

@Component({
  selector: 'app-designation-list',
  standalone: true,
  imports: [CommonModule, Modal],
  templateUrl: './designation-list.html',
  styleUrls: ['./designation-list.css']
})
export class DesignationList implements OnInit {
  private positionService = inject(PositionService);
  private router = inject(Router);
  private authService = inject(AuthService);

  positions: PositionDetailDto[] = [];
  paginatedPositions: PositionDetailDto[] = [];
  selectedId: number | null = null;
  loading: boolean = false;
  
  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalCount: number = 0;
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showCancelButton = false;
  positionToDelete: number | null = null;

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit() {
    console.log('DesignationList initialized');
    console.log('Is user logged in?', this.authService.isLoggedIn());
    console.log('Is user admin?', this.isAdmin);
    this.loadPositions();
  }

  loadPositions() {
    console.log('Loading positions - Page:', this.currentPage, 'Size:', this.pageSize);
    this.loading = true;
    
    this.positionService.getPositionsPaginated(this.currentPage, this.pageSize).subscribe({
      next: response => {
        console.log('Positions loaded successfully:', response);
        this.positions = response.items;
        this.paginatedPositions = response.items;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalCount = response.totalCount;
        this.loading = false;
        
        console.log('Total pages:', this.totalPages);
        console.log('Current page:', this.currentPage);
        console.log('Items count:', this.paginatedPositions.length);
      },
      error: err => {
        console.error('Failed to load positions:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error details:', err.error);
        
        if (err.status === 401) {
          this.showErrorModal('Authentication required. Please log in again.');
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else {
          this.showErrorModal('Failed to load positions. Please try again.');
        }
        
        this.loading = false;
      }
    });
  }

  goToPage(page: number) {
    console.log('Go to page:', page);
    if (page < 1 || page > this.totalPages) {
      console.log('Invalid page number, ignoring');
      return;
    }
    this.currentPage = page;
    this.selectedId = null;
    this.loadPositions();
  }

  nextPage() {
    console.log('Next page clicked. Current:', this.currentPage, 'Total:', this.totalPages);
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    console.log('Previous page clicked. Current:', this.currentPage);
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    console.log('Page numbers:', pages);
    return pages;
  }

  select(id: number) {
    console.log('Selected position ID:', id);
    this.selectedId = id;
  }

  viewDetails(id: number) {
    console.log('Viewing details for position ID:', id);
    console.log('Navigating to: /designation/' + id);
    this.router.navigate(['/designation', id]);
  }

  navigateToAdd() {
    console.log('Navigating to add position');
    this.router.navigate(['/designation/add']);
  }

  updatePosition(id: number) {
    if (!this.isAdmin) {
      this.showErrorModal('Only administrators can update positions.');
      return;
    }
    console.log('Navigating to edit position:', id);
    this.router.navigate(['/designation/edit', id]);
  }

  deletePosition(id: number) {
    if (!this.isAdmin) {
      this.showErrorModal('Only administrators can delete positions.');
      return;
    }

    const position = this.positions.find(p => p.positionId === id);
    if (!position) {
      console.error('Position not found:', id);
      return;
    }

    console.log('Delete requested for position:', position);

    if (position.employeeCount > 0) {
      this.showErrorModal(`Cannot delete this position. ${position.employeeCount} employees are assigned to it.`);
      return;
    }

    this.positionToDelete = id;
    this.modalTitle = 'Confirm Delete';
    this.modalMessage = `Are you sure you want to delete "${position.name}"?`;
    this.showCancelButton = true;
    this.showModal = true;
  }

  confirmDelete() {
    if (this.positionToDelete === null) return;

    const idToDelete = this.positionToDelete;
    console.log('Confirming delete for position ID:', idToDelete);

    this.positionService.deletePosition(idToDelete).subscribe({
      next: (response) => {
        console.log('Position deleted successfully:', response);
        this.positionToDelete = null;
        this.showCancelButton = false;
        this.showSuccessModal('Position deleted successfully!');
        this.loadPositions();
      },
      error: err => {
        console.error('Failed to delete position:', err);
        console.error('Error details:', err.error);
        this.positionToDelete = null;
        this.showCancelButton = false;
        
        if (err.error?.message) {
          this.showErrorModal(err.error.message);
        } else {
          this.showErrorModal('Failed to delete position. Please try again.');
        }
      }
    });
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
    this.positionToDelete = null;
    this.showCancelButton = false;
  }
}