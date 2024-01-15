import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import DataCellComponent from './data-cell.component';

@Component({
  selector: 'table-icon-cell',
  standalone: true,
  imports: [NgClass],
  template: ` <i class="bi" [ngClass]="icon" style="font-size: 2rem;"></i> `,
})
export default class IconCellComponent extends DataCellComponent {
  @Input({ required: true }) icon: string = '';
  @Input() readonly: boolean = false;
}
