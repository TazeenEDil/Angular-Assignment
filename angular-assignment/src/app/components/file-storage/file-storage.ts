import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileStorageService, EmployeeFile } from '../../services/file-storage-service';
import { EmployeeService } from '../../services/employee-service';
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
      // Reset previous selection
      this.selectedFile = null;
      
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png', 
        'image/jpeg', 
        'image/jpg'
      ];
      
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        this.showErrorModal('Invalid file type. Allowed types: PDF, DOC, DOCX, PNG, JPG');
        event.target.value = '';
        return;
      }

      // Validate file size (10MB = 10485760 bytes)
      const maxSize = 10485760;
      if (file.size > maxSize) {
        this.showErrorModal(`File size exceeds 10MB limit. Selected file is ${this.formatFileSize(file.size)}`);
        event.target.value = '';
        return;
      }

      // Validate file name
      if (file.name.length > 255) {
        this.showErrorModal('File name is too long. Maximum 255 characters.');
        event.target.value = '';
        return;
      }

      // Check for empty file
      if (file.size === 0) {
        this.showErrorModal('Cannot upload empty file.');
        event.target.value = '';
        return;
      }

      this.selectedFile = file;
      console.log('File selected:', {
        name: file.name,
        type: file.type,
        size: this.formatFileSize(file.size)
      });
    }
  }

  uploadFile() {
    // Validation
    if (!this.selectedEmployeeId || !this.selectedFile) {
      this.showErrorModal('Please select an employee and a file.');
      return;
    }

    // Additional validation for employee ID
    if (this.selectedEmployeeId <= 0) {
      this.showErrorModal('Please select a valid employee.');
      return;
    }

    // Validate file category
    if (!this.fileCategory || this.fileCategory.trim() === '') {
      this.showErrorModal('Please select a file category.');
      return;
    }

    this.uploading = true;

    this.fileStorageService.uploadFile(
      this.selectedEmployeeId, 
      this.selectedFile, 
      this.fileCategory
    ).subscribe({
      next: (response) => {
        console.log('File uploaded successfully:', response);
        this.uploading = false;
        this.showUploadModal = false;
        
        // Reset form
        this.selectedEmployeeId = null;
        this.selectedFile = null;
        this.fileCategory = 'Resume';
        
        this.showSuccessModal('File uploaded successfully!');
        this.loadFiles();
      },
      error: err => {
        console.error('Failed to upload file:', err);
        this.uploading = false;
        
        let errorMessage = 'Failed to upload file. Please try again.';
        
        // Handle different error types
        if (err.status === 0) {
          errorMessage = 'Cannot connect to server. Please check your internet connection.';
        } else if (err.status === 400) {
          // Bad request - validation errors
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.error?.errors) {
            // Handle validation errors from ASP.NET
            const errors = Object.values(err.error.errors).flat();
            errorMessage = errors.join(', ');
          } else if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else {
            errorMessage = 'Invalid file or form data. Please check your inputs.';
          }
        } else if (err.status === 401) {
          errorMessage = 'You are not authorized. Please login again.';
        } else if (err.status === 403) {
          errorMessage = 'You do not have permission to upload files.';
        } else if (err.status === 404) {
          errorMessage = 'Upload endpoint not found. Please contact support.';
        } else if (err.status === 413) {
          errorMessage = 'File is too large. Maximum size is 10MB.';
        } else if (err.status === 415) {
          errorMessage = 'Unsupported file type.';
        } else if (err.status === 500) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }
        
        this.showErrorModal(errorMessage);
      }
    });
  }

  previewFile(file: EmployeeFile) {
    console.log('Previewing file:', file);
    
    const previewableTypes = ['pdf', 'png', 'jpg', 'jpeg'];
    const fileExt = file.fileType.toLowerCase();
    
    if (!previewableTypes.includes(fileExt)) {
      this.showErrorModal('Preview is only available for PDF and image files.');
      return;
    }

    // Download the file and open it in a new tab
    this.fileStorageService.downloadFile(file.employeeFileId).subscribe({
      next: blob => {
        console.log('Downloaded blob for preview:', blob);
        
        // Create a blob URL
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Open in new tab
        const newWindow = window.open(blobUrl, '_blank');
        
        if (!newWindow) {
          this.showErrorModal('Please allow popups to preview files.');
          window.URL.revokeObjectURL(blobUrl);
          return;
        }
        
        // Clean up blob URL after the browser has loaded it
        // Using a longer timeout to ensure the file is fully loaded
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 2000);
      },
      error: err => {
        console.error('Failed to preview file:', err);
        
        let errorMessage = 'Failed to preview file. Please try again.';
        if (err.status === 404) {
          errorMessage = 'File not found on the server.';
        } else if (err.status === 403) {
          errorMessage = 'You do not have permission to preview this file.';
        }
        
        this.showErrorModal(errorMessage);
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
        
        let errorMessage = 'Failed to download file.';
        if (err.status === 404) {
          errorMessage = 'File not found on the server.';
        } else if (err.status === 403) {
          errorMessage = 'You do not have permission to download this file.';
        }
        
        this.showErrorModal(errorMessage);
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
    // Reset form when closing
    this.selectedEmployeeId = null;
    this.selectedFile = null;
    this.fileCategory = 'Resume';
  }
}