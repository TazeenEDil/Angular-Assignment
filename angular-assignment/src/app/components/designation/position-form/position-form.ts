import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PositionService, CreatePositionDto, UpdatePositionDto } from '../../../services/position-service';
import { Modal } from '../../modal/modal';

@Component({
  selector: 'app-position-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './position-form.html',
  styleUrls: ['./position-form.css']
})
export class PositionForm implements OnInit {
  private positionService = inject(PositionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  positionId: number | null = null;
  isEditMode: boolean = false;
  loading: boolean = false;
  submitting: boolean = false;

  name: string = '';
  description: string = '';

  showModal = false;
  modalTitle = '';
  modalMessage = '';

  ngOnInit() {
    this.positionId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.positionId;

    if (this.isEditMode) {
      this.loadPosition();
    }
  }

  loadPosition() {
    this.loading = true;
    this.positionService.getPositionById(this.positionId!).subscribe({
      next: position => {
        this.name = position.name;
        this.description = position.description || '';
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load position:', err);
        this.showErrorModal('Failed to load position details.');
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (!this.name.trim()) {
      this.showErrorModal('Position name is required.');
      return;
    }

    this.submitting = true;

    if (this.isEditMode) {
      this.updatePosition();
    } else {
      this.createPosition();
    }
  }

  createPosition() {
    const dto: CreatePositionDto = {
      name: this.name.trim(),
      description: this.description.trim() || undefined
    };

    this.positionService.createPosition(dto).subscribe({
      next: () => {
        this.submitting = false;
        this.showSuccessModal('Position created successfully!');
      },
      error: err => {
        console.error('Failed to create position:', err);
        this.submitting = false;
        const errorMessage = err.error?.message || 'Failed to create position. Please try again.';
        this.showErrorModal(errorMessage);
      }
    });
  }

  updatePosition() {
    const dto: UpdatePositionDto = {
      name: this.name.trim(),
      description: this.description.trim() || undefined
    };

    this.positionService.updatePosition(this.positionId!, dto).subscribe({
      next: () => {
        this.submitting = false;
        this.showSuccessModal('Position updated successfully!');
      },
      error: err => {
        console.error('Failed to update position:', err);
        this.submitting = false;
        const errorMessage = err.error?.message || 'Failed to update position. Please try again.';
        this.showErrorModal(errorMessage);
      }
    });
  }

  cancel() {
    this.router.navigate(['/designation']);
  }

  showSuccessModal(message: string) {
    this.modalTitle = 'Success';
    this.modalMessage = message;
    this.showModal = true;
  }

  showErrorModal(message: string) {
    this.modalTitle = 'Error';
    this.modalMessage = message;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    if (this.modalTitle === 'Success') {
      this.router.navigate(['/designation']);
    }
  }
}