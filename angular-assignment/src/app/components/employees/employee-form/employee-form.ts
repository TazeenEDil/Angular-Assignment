import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../../services/employee-service';
import { PositionService } from '../../../services/position-service';
import { Modal } from '../../modal/modal';

interface Position {
  positionId: number;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [FormsModule, CommonModule, Modal],
  templateUrl: './employee-form.html',
  styleUrls: ['./employee-form.css']
})
export class EmployeeForm implements OnInit {
  private empService = inject(EmployeeService);
  private positionService = inject(PositionService);
  private router = inject(Router);

  employee = {
    name: '',
    email: '',
    positionId: '' as number | string
  };

  positions: Position[] = [];
  loading: boolean = false;
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  ngOnInit() {
    this.loadPositions();
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

  addEmployee() {
    if (!this.employee.name || !this.employee.email || !this.employee.positionId) {
      this.modalTitle = 'Validation Error';
      this.modalMessage = 'All fields are required!';
      this.showModal = true;
      return;
    }

    this.loading = true;

    const employeeData = {
      name: this.employee.name,
      email: this.employee.email,
      positionId: Number(this.employee.positionId)
    };

    this.empService.addEmployee(employeeData).subscribe({
      next: res => {
        console.log('Employee created:', res);
        this.loading = false;
        this.modalTitle = 'Success';
        this.modalMessage = 'Employee added successfully!';
        this.showModal = true;
      },
      error: err => {
        console.error('Failed to add employee:', err);
        this.loading = false;
        
        let errorMessage = 'Failed to add employee. Please try again.';
        
        if (err.status === 403) {
          errorMessage = 'You do not have permission to add employees.';
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.error && err.error.errors) {
          const errors = Object.values(err.error.errors).flat();
          errorMessage = errors.join(', ');
        }
        
        this.modalTitle = 'Error';
        this.modalMessage = errorMessage;
        this.showModal = true;
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
    if (this.modalTitle === 'Success') {
      this.router.navigate(['/home']);
    }
  }

  cancel() {
    this.router.navigate(['/home']);
  }
}