import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../../services/employee';
import { PositionService } from '../../../services/position-service';
import { Modal } from '../../modal/modal';

interface Position {
  positionId: number;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-employee-update',
  standalone: true,
  imports: [FormsModule, CommonModule, Modal],
  templateUrl: './employee-update.html',
  styleUrls: ['./employee-update.css']
})
export class EmployeeUpdate implements OnInit {
  private empService = inject(EmployeeService);
  private positionService = inject(PositionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  employeeId: number = 0;
  employee: { name: string; email: string; positionId: number | string } = {
    name: '',
    email: '',
    positionId: ''
  };
  
  positions: Position[] = [];
  loading: boolean = false;
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const numId = +id;
      if (isNaN(numId) || numId <= 0) {
        this.modalTitle = 'Error';
        this.modalMessage = 'Invalid employee ID';
        this.showModal = true;
        return;
      }
      this.employeeId = numId;
      this.loadPositions();
      this.loadEmployee();
    } else {
      this.modalTitle = 'Error';
      this.modalMessage = 'Invalid employee ID';
      this.showModal = true;
    }
  }

  loadPositions() {
    this.positionService.getPositions().subscribe({
      next: (data) => {
        this.positions = data;
      },
      error: (err) => {
        console.error('Failed to load positions:', err);
      }
    });
  }

  loadEmployee() {
    this.loading = true;
    this.empService.getEmployeeById(this.employeeId).subscribe({
      next: (data) => {
        this.employee = {
          name: data.name,
          email: data.email,
          positionId: data.positionId
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load employee:', err);
        this.loading = false;
        this.modalTitle = 'Error';
        this.modalMessage = 'Failed to load employee details';
        this.showModal = true;
      }
    });
  }

  updateEmployee() {
    if (!this.employee.name || !this.employee.email || !this.employee.positionId) {
      this.modalTitle = 'Validation Error';
      this.modalMessage = 'All fields are required!';
      this.showModal = true;
      return;
    }

    this.loading = true;

    const updateData = {
      name: this.employee.name,
      email: this.employee.email,
      positionId: Number(this.employee.positionId)
    };

    this.empService.updateEmployee(this.employeeId, updateData).subscribe({
      next: (res) => {
        console.log('Employee updated:', res);
        this.loading = false;
        this.modalTitle = 'Success';
        this.modalMessage = 'Employee updated successfully!';
        this.showModal = true;
      },
      error: (err) => {
        console.error('Failed to update employee:', err);
        this.loading = false;
        
        let errorMessage = 'Failed to update employee. Please try again.';
        
        if (err.status === 403) {
          errorMessage = 'You do not have permission to update employees.';
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }
        
        this.modalTitle = 'Error';
        this.modalMessage = errorMessage;
        this.showModal = true;
      }
    });
  }

  closeModal() {
    this.showModal = false;
    if (this.modalTitle === 'Success' || !this.employee.name) {
      this.router.navigate(['/home']);
    }
  }

  cancel() {
    this.router.navigate(['/home']);
  }
}