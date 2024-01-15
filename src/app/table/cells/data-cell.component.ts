import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'table-data-cell',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  template: `
    <div [ngClass]="classes" [ngStyle]="styles">
      @if (translateKey) {
      {{ data | translate }}
      } @else {
      {{ data }}
      }
    </div>
  `,
})
export default class DataCellComponent {
  @Input({ required: true }) data!: any;
  @Input() translateKey: boolean = false;
  @Input() translatePath: string = '';
  @Input() classes: string[] = [];
  @Input() styles: string[] = [];
}
