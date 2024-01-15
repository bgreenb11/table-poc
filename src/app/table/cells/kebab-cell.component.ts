import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import IconCellComponent from './icon-cell.component';

@Component({
  selector: 'table-kebab-cell',
  standalone: true,
  imports: [CommonModule],
  template: ` <div class="dropdown">
    <button class="btn" data-bs-toggle="dropdown">
      <i class="bi" [ngClass]="icon" style="font-size: 2rem;"></i>
    </button>
    <ul class="dropdown-menu">
      <li><a class="dropdown-item" href="#">Action</a></li>
      <li><a class="dropdown-item" href="#">Another action</a></li>
      <li><a class="dropdown-item" href="#">Something else here</a></li>
    </ul>
  </div>`,
})
export default class KebabCellComponent extends IconCellComponent {}
