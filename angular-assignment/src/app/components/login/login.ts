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

  login() {
    console.log('Login Component - Login method called');
    
    if (!this.email || !this.password) {
      this.showErrorModal('Please enter both email and password');
      return;
    }

    this.loading = true;
    console.log('Login Component - Calling auth service login');

    this.authService.login(this.email, this.password).subscribe({
      next: (res: LoginResponse) => {
        console.log('Login Component - Login successful');
        console.log('Login Component - Response:', res);
        console.log('Login Component - Role from response:', res.role);
        
        this.loading = false;
        
        // Double check localStorage after login
        setTimeout(() => {
          console.log('Login Component - Checking localStorage after login:');
          console.log('  Token:', localStorage.getItem('jwt_token'));
          console.log('  Role:', localStorage.getItem('user_role'));
          console.log('  Name:', localStorage.getItem('user_name'));
          console.log('  Email:', localStorage.getItem('user_email'));
          
          console.log('Login Component - Navigating to /home');
          this.router.navigate(['/home'], { replaceUrl: true });
        }, 100);
      },
      error: (err) => {
        console.error('Login Component - Login error:', err);
        this.loading = false;
        
        let errorMessage = 'Login failed. Please check your credentials.';
        
        if (err.status === 0) {
          errorMessage = 'Cannot connect to server. Please ensure the backend is running at http://localhost:5224';
        } else if (err.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (err.status === 404) {
          errorMessage = 'Login endpoint not found. Please check the API URL.';
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }
        
        this.showErrorModal(errorMessage);
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