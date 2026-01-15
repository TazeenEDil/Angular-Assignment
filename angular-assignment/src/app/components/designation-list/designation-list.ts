import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-designation-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header-section">
        <h2>Designation Management</h2>
      </div>
      <div class="placeholder-content">
        <span class="placeholder-icon">🏷️</span>
        <h3>Designation Management</h3>
        <p>This feature is coming soon. You'll be able to manage employee designations here.</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      margin-left: 270px;
      padding: 30px;
      max-width: calc(100vw - 300px);
    }

    .header-section {
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e0e0e0;
    }

    .header-section h2 {
      color: #333;
      font-size: 28px;
      margin: 0;
    }

    .placeholder-content {
      background: white;
      border-radius: 12px;
      padding: 60px 40px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .placeholder-icon {
      font-size: 80px;
      display: block;
      margin-bottom: 20px;
    }

    .placeholder-content h3 {
      color: #333;
      font-size: 24px;
      margin: 0 0 15px 0;
    }

    .placeholder-content p {
      color: #666;
      font-size: 16px;
      margin: 0;
    }
  `]
})
export class DesignationList {}