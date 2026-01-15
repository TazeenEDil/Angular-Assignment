import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth-service';
import { PositionService } from '../../services/position-service';
import { Modal } from '../modal/modal';

interface Position {
  positionId: number;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, Modal],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {
  private authService = inject(AuthService);
  private positionService = inject(PositionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  positionId: number | string = '';
  role: string = 'Employee';
  
  positions: Position[] = [];
  loading: boolean = false;
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  ngOnInit() {
    const roleParam = this.route.snapshot.paramMap.get('role');
    if (roleParam === 'admin') {
      this.role = 'Admin';
    } else {
      this.role = 'Employee';
    }
    
    // Load positions for employee registration
    if (this.role === 'Employee') {
      this.loadPositions();
    }
  }

  loadPositions() {
    this.positionService.getPositions().subscribe({
      next: (data) => {
        this.positions = data;
      },
      error: (err) => {
        console.error('Failed to load positions:', err);
        this.showErrorModal('Failed to load positions. Please try again.');
      }
    });
  }

  register() {
    // Validation
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.showErrorModal('All fields are required!');
      return;
    }

    if (this.role === 'Employee' && !this.positionId) {
      this.showErrorModal('Please select a position!');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showErrorModal('Passwords do not match!');
      return;
    }

    if (this.password.length < 6) {
      this.showErrorModal('Password must be at least 6 characters!');
      return;
    }

    this.loading = true;

    const registerData: any = {
      name: this.name,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      role: this.role
    };

    // Add positionId only for employees
    if (this.role === 'Employee') {
      registerData.positionId = Number(this.positionId);
    }

    this.authService.register(registerData).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.modalTitle = 'Success';
        this.modalMessage = `Registration successful as ${this.role}! Redirecting to login...`;
        this.showModal = true;
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Registration error:', err);
        this.loading = false;
        
        let errorMessage = 'Registration failed. Please try again.';
        
        if (err.status === 0) {
          errorMessage = 'Cannot connect to server. Please ensure the backend is running at http://localhost:5224';
        } else if (err.status === 400) {
          errorMessage = 'Invalid registration data. Please check all fields.';
        } else if (err.status === 409) {
          errorMessage = 'This email is already registered.';
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.error && err.error.errors) {
          const errors = Object.values(err.error.errors).flat();
          errorMessage = errors.join(', ');
        }
        
        this.showErrorModal(errorMessage);
      }
    });
  }

  showErrorModal(message: string) {
    this.modalTitle = 'Error';
    this.modalMessage = message;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}