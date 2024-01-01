import { Component, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ELEMENT_DATA, PeriodicElement } from './test-data/test.data';
import {
  TableComponent,
  TableConfig,
  TableDataSource,
} from './table/table/table.component';

export enum ColType {
  data = 'data',
  button = 'button',
  form = 'form',
  checkbox = 'checkbox',
  dropdown = 'dropdown',
}

export interface Policy {
  enabled: boolean;
  visible: boolean;
}

export interface TableColumn {
  column: string;
  type: ColType;
  policy?: Policy;
  styleClasses?: string;
  default?: any;
  enableSorting?: boolean;
}

export interface ActionEvent {
  action: string | string[];
}

export interface TableActionEvent extends ActionEvent {
  index?: number;
  column?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TableComponent],
  styleUrls: ['./app.component.scss'],
  template: `
    <button (click)="dataSource.clearSelectedItems()">clear</button>
    <app-table
      [data]="dataSource"
      [columns]="columns"
      [selectEnabled]="true"
      (actionEmitter)="eventHandler($event)"
    />
  `,
})
export class AppComponent {
  title = 'ng-table';

  data = signal<PeriodicElement[]>(ELEMENT_DATA);

  tableConfig: TableConfig = {
    select: {
      enabled: true,
      default: false,
    },
    filter: {
      enabled: true,
    },
  };

  dataSource = new TableDataSource(this.data(), this.tableConfig);

  columns: TableColumn[] = [
    {
      column: 'name',
      type: ColType.data,
      enableSorting: true,
    },
    {
      column: 'position',
      type: ColType.data,
      enableSorting: true,
    },
    {
      column: 'weight',
      type: ColType.data,
      enableSorting: true,
    },
    {
      column: 'symbol',
      type: ColType.data,
    },
  ];

  constructor() {
    this.dataSource.selectedItems$.subscribe((items) => console.log(items));
  }

  eventHandler(event: ActionEvent): void {
    switch (event.action) {
      case 'selectAll': {
      }
    }
  }
}
