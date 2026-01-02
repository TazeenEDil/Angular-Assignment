import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (show) {
      <div class="modal-backdrop fade show" (click)="onClose()"></div>
      
      <div class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ title }}</h5>
              <button type="button" class="btn-close" (click)="onClose()">&times;</button>
            </div>
            
            <div class="modal-body">
              {{ message }}
            </div>
            
            <div class="modal-footer">
              @if (showCancel) {
                <button class="btn btn-secondary" (click)="onCancel()">
                  Cancel
                </button>
              }
              <button class="btn btn-primary" (click)="onConfirm()">
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1040;
      width: 100vw;
      height: 100vh;
      background-color: #000;
      opacity: 0.5;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1050;
      width: 100%;
      height: 100%;
      overflow: hidden;
      outline: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-dialog {
      position: relative;
      width: auto;
      max-width: 500px;
      margin: 0 auto;
    }

    .modal-content {
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: #fff;
      border-radius: 0.5rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
    }

    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 1em;
      height: 1em;
      color: #000;
      opacity: 0.5;
    }

    .btn-close:hover {
      opacity: 0.75;
    }

    .modal-body {
      padding: 1rem;
      font-size: 1rem;
      color: #212529;
    }

    .modal-footer {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      padding: 1rem;
      border-top: 1px solid #dee2e6;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }
  `]
})
export class Modal {
  @Input() show = false;
  @Input() title = 'Message';
  @Input() message = '';
  @Input() confirmText = 'OK';
  @Input() showCancel = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
    this.close.emit();
  }

  onCancel(): void {
    this.cancel.emit();
    this.close.emit();
  }
}