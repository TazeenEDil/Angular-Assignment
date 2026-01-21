import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileStorageService, EmployeeFile } from '../../services/file-storage-service';
import { EmployeeService } from '../../services/employee';
import { AuthService } from '../../services/auth/auth-service';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-file-storage',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './file-storage.html',
  styleUrls: ['./file-storage.css']
})
export class FileStorage implements OnInit {
  private fileStorageService = inject(FileStorageService);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);

  files: EmployeeFile[] = [];
  paginatedFiles: EmployeeFile[] = [];
  employees: any[] = [];
  loading: boolean = false;
  uploading: boolean = false;
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalCount: number = 0;

  // Upload form
  showUploadModal: boolean = false;
  selectedEmployeeId: number | null = null;
  selectedFile: File | null = null;
  fileCategory: string = 'Resume';

  // Delete confirmation
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showCancelButton = false;
  fileToDelete: number | null = null;

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get apiBaseUrl(): string {
    return 'http://localhost:5224';
  }

  ngOnInit() {
    this.loadFiles();
    this.loadEmployees();
  }

  loadFiles() {
    this.loading = true;
    this.fileStorageService.getAllFiles(this.currentPage, this.pageSize).subscribe({
      next: response => {
        this.files = response.items;
        this.paginatedFiles = response.items;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load files:', err);
        this.showErrorModal('Failed to load files. Please try again.');
        this.loading = false;
      }
    });
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: employees => {
        this.employees = employees;
      },
      error: err => {
        console.error('Failed to load employees:', err);
      }
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadFiles();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
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
    
    return pages;
  }

  openUploadModal() {
    if (!this.isAdmin) {
      this.showErrorModal('Only administrators can upload files.');
      return;
    }
    this.showUploadModal = true;
    this.selectedEmployeeId = null;
    this.selectedFile = null;
    this.fileCategory = 'Resume';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png', 'image/jpeg', 'image/jpg'];
      
      if (!allowedTypes.includes(file.type)) {
        this.showErrorModal('Invalid file type. Allowed: PDF, DOC, DOCX, PNG, JPG');
        event.target.value = '';
        return;
      }

      if (file.size > 10485760) {
        this.showErrorModal('File size exceeds 10MB limit.');
        event.target.value = '';
        return;
      }

      this.selectedFile = file;
    }
  }

  uploadFile() {
    if (!this.selectedEmployeeId || !this.selectedFile) {
      this.showErrorModal('Please select an employee and a file.');
      return;
    }

    this.uploading = true;
    this.fileStorageService.uploadFile(this.selectedEmployeeId, this.selectedFile, this.fileCategory).subscribe({
      next: () => {
        this.uploading = false;
        this.showUploadModal = false;
        this.showSuccessModal('File uploaded successfully!');
        this.loadFiles();
      },
      error: err => {
        console.error('Failed to upload file:', err);
        this.uploading = false;
        const errorMessage = err.error?.message || 'Failed to upload file. Please try again.';
        this.showErrorModal(errorMessage);
      }
    });
  }

  previewFile(file: EmployeeFile) {
    console.log('Opening preview in new tab for file:', file);
    
    const previewableTypes = ['pdf', 'png', 'jpg', 'jpeg'];
    const fileExt = file.fileType.toLowerCase();
    
    if (!previewableTypes.includes(fileExt)) {
      this.showErrorModal('Preview is only available for PDF and image files.');
      return;
    }

    // Get preview URL and open in new tab
    this.fileStorageService.getPreviewUrl(file.employeeFileId).subscribe({
      next: response => {
        console.log('Preview URL response:', response);
        
        // Construct full URL
        const fullUrl = response.url.startsWith('http') 
          ? response.url 
          : this.apiBaseUrl + response.url;
        
        console.log('Opening URL in new tab:', fullUrl);
        
        // Open in new tab
        window.open(fullUrl, '_blank');
      },
      error: err => {
        console.error('Failed to get preview URL, trying download method:', err);
        
        // Fallback - download and create blob URL to open in new tab
        this.fileStorageService.downloadFile(file.employeeFileId).subscribe({
          next: blob => {
            console.log('Downloaded blob for preview:', blob);
            const blobUrl = window.URL.createObjectURL(blob);
            
            // Open blob URL in new tab
            window.open(blobUrl, '_blank');
            
            // Clean up blob URL after a delay
            setTimeout(() => {
              window.URL.revokeObjectURL(blobUrl);
            }, 100);
          },
          error: downloadErr => {
            console.error('Failed to download file for preview:', downloadErr);
            this.showErrorModal('Failed to preview file. Please try downloading instead.');
          }
        });
      }
    });
  }

  downloadFile(file: EmployeeFile) {
    console.log('Downloading file:', file);
    
    this.fileStorageService.downloadFile(file.employeeFileId).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => {
        console.error('Failed to download file:', err);
        this.showErrorModal('Failed to download file.');
      }
    });
  }

  deleteFile(fileId: number, fileName: string) {
    if (!this.isAdmin) {
      this.showErrorModal('Only administrators can delete files.');
      return;
    }

    this.fileToDelete = fileId;
    this.modalTitle = 'Confirm Delete';
    this.modalMessage = `Are you sure you want to delete "${fileName}"?`;
    this.showCancelButton = true;
    this.showModal = true;
  }

  confirmDelete() {
    if (this.fileToDelete === null) return;

    const idToDelete = this.fileToDelete;

    this.fileStorageService.deleteFile(idToDelete).subscribe({
      next: () => {
        this.fileToDelete = null;
        this.showCancelButton = false;
        this.showSuccessModal('File deleted successfully!');
        this.loadFiles();
      },
      error: err => {
        console.error('Failed to delete file:', err);
        this.fileToDelete = null;
        this.showCancelButton = false;
        this.showErrorModal('Failed to delete file. Please try again.');
      }
    });
  }

  formatFileSize(bytes: number): string {
    return this.fileStorageService.formatFileSize(bytes);
  }

  getFileIcon(fileType: string): string {
    switch (fileType.toLowerCase()) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'png':
      case 'jpg':
      case 'jpeg': return '🖼️';
      default: return '📎';
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
    this.fileToDelete = null;
    this.showCancelButton = false;
  }

  closeUploadModal() {
    this.showUploadModal = false;
  }
}