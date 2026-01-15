import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../services/employee';
import { Employee } from '../../models/employee.model';
import { AuthService } from '../../services/auth/auth-service';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, Modal],
  templateUrl: './employee-details.html',
  styleUrls: ['./employee-details.css']
})
export class EmployeeDetails implements OnInit {
  private empService = inject(EmployeeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  employee: Employee | null = null;
  loading: boolean = false;
  
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(+id);
    } else {
      this.modalTitle = 'Error';
      this.modalMessage = 'Invalid employee ID';
      this.showModal = true;
    }
  }

  loadEmployee(id: number) {
    this.loading = true;
    this.empService.getEmployeeById(id).subscribe({
      next: data => {
        this.employee = data;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load employee:', err);
        this.loading = false;
        this.modalTitle = 'Error';
        this.modalMessage = 'Failed to load employee details';
        this.showModal = true;
      }
    });
  }

  closeModal() {
    this.showModal = false;
    if (!this.employee) {
      this.router.navigate(['/home']);
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}