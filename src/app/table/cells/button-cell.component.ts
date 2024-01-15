import { Component, EventEmitter, Input, Output } from '@angular/core';
import DataCellComponent from './data-cell.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'table-button-cell',
  standalone: true,
  template: ``,
})
export abstract class ButtonCellComponent extends DataCellComponent {
  @Input({ required: true }) display!: string;
  @Input({ required: true }) callback!: Function;
  @Input() dataOnly: boolean = false;

  getClasses() {
    let classes: string[] = [...this.classes, 'btn'];

    // switch (buttonType) {
    //   case 'primary': {
    //     classes.push('btn-primary');
    //     break;
    //   }
    //   case 'secondary': {
    //     classes.push('btn-secondary');
    //     break;
    //   }
    //   case 'success': {
    //     classes.push('btn-success');
    //     break;
    //   }
    //   case 'danger': {
    //     classes.push('btn-danger');
    //     break;
    //   }
    //   case 'warning': {
    //     classes.push('btn-warning');
    //     break;
    //   }
    //   case 'info': {
    //     classes.push('btn-info');
    //     break;
    //   }
    //   case 'light': {
    //     classes.push('btn-light');
    //     break;
    //   }
    //   case 'dark': {
    //     classes.push('btn-dark');
    //     break;
    //   }
    //   case 'link': {
    //     classes.push('btn-light');
    //     break;
    //   }
    // }

    return classes.join(' ');
  }
}

@Component({
  selector: 'table-github-cell',
  standalone: true,
  imports: [TranslateModule, CommonModule, DataCellComponent],
  template: `
    @if (!dataOnly) {
    <button [ngClass]="getClasses()" [ngStyle]="styles" (click)="onClick()">
      @if (translateKey) {
      {{ [translatePath, display].join('.') | translate }}
      } @else { {{ display }} }
    </button>
    } @else {
    <table-data-cell
      [data]="data"
      [translateKey]="translateKey"
      [translatePath]="translatePath"
    />
    }
  `,
})
export default class GitHubRowCell extends ButtonCellComponent {
  constructor() {
    super();
  }

  onClick() {
    window.open(this.data.html_url);
  }
}
