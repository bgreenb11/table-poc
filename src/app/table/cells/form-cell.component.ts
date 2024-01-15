import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import DataCellComponent from './data-cell.component';

@Component({
  selector: 'table-form-cell',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `<form>
    <input
      [formControl]="form"
      type="text"
      class="form-control"
      id="text-control"
      placeholder="Form"
    />
  </form>`,
})
export default class FormCellComponent extends DataCellComponent {
  form: FormControl = new FormControl('');
}
