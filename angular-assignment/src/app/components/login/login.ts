import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service';
import { Modal } from '../modal/modal';

interface LoginResponse {
  token: string;
  email: string;
  name: string;
  role: string;
  expiresAt: Date;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, Modal],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  email: string = '';
  password: string = '';
  loading: boolean = false;
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  errorMessage: string = ''; 

  login() {
    // Clear previous error
    this.errorMessage = '';

    // Validation
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (res: LoginResponse) => {
        this.loading = false; // Stop loading
        
        // Debug: Check token claims
        this.authService.debugEmployeeIdExtraction();
        
        // Navigate to home
        this.router.navigate(['/home'], { replaceUrl: true });
      },
      error: (err) => {
        console.error('❌ Login error:', err);
        this.loading = false; //  Stop loading on error
        
        let errorMessage = 'Login failed. Please try again.';
        
        // ✅ Handle different error types
        if (err.status === 0) {
          // Cannot connect to server
          errorMessage = '❌ Cannot connect to server. Please check if the backend is running.';
        } 
        else if (err.status === 400) {
          // Bad request - validation errors
          if (err.error?.errors) {
            // Laravel/ASP.NET validation errors
            const errors = err.error.errors;
            const firstError = Object.values(errors)[0];
            errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          } else {
            errorMessage = '❌ Invalid email or password format.';
          }
        }
        else if (err.status === 401) {
          // Unauthorized - wrong credentials
          if (err.error?.message) {
            // Check if backend specifies what's wrong
            const msg = err.error.message.toLowerCase();
            if (msg.includes('email')) {
              errorMessage = '❌ Wrong email address or password';
            } else if (msg.includes('password')) {
              errorMessage = '❌ Wrong password.';
            } else {
              errorMessage = '❌ Invalid email or password.';
            }
          } else {
            errorMessage = '❌ Invalid email or password.';
          }
        }
        else if (err.status === 404) {
          // Endpoint not found
          errorMessage = '❌ Login endpoint not found. Please check the API URL.';
        }
        else if (err.status === 500) {
          // Internal server error
          errorMessage = '❌ Internal server error. Please try again later.';
        }
        else if (err.status === 503) {
          // Service unavailable
          errorMessage = '❌ Service temporarily unavailable. Please try again later.';
        }
        else {
          // Generic error
          errorMessage = err.error?.message || '❌ An unexpected error occurred. Please try again.';
        }
        
        this.errorMessage = errorMessage;
        
        // Also show modal for important errors
        if (err.status === 0 || err.status === 500 || err.status === 503) {
          this.showErrorModal(errorMessage);
        }
      }
    });
  }

  registerAsAdmin() {
    this.router.navigate(['/register', 'admin']);
  }

  registerAsEmployee() {
    this.router.navigate(['/register', 'employee']);
  }

  showErrorModal(message: string) {
    this.modalTitle = 'Error';
    this.modalMessage = message;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}