import { Component, Signal, Type, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ELEMENT_DATA, PeriodicElement } from './test-data/test.data';
import { TableComponent, TableDataSource } from './table/table/table.component';
import { of } from 'rxjs';
import { GithubIssue, TestService } from './test-data/test.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { TableConfig } from './table/table.models';
import { FilterComponent } from './table/filter/filter.component';
import DataCellComponent from './table/cells/data-cell.component';
import ButtonCellComponent from './table/cells/button-cell.component';
import GitHubRowCell from './table/cells/button-cell.component';
import FormCellComponent from './table/cells/form-cell.component';
import IconCellComponent from './table/cells/icon-cell.component';
import KebabCellComponent from './table/cells/kebab-cell.component';
import { ExpansionRowComponent } from './table/expansion-row/expansion-row.component';

export enum ColType {
  data = 'data',
  icon = 'icon',
  button = 'button',
  form = 'form',
  checkbox = 'checkbox',
}

export interface Policy {
  enabled: boolean;
  visible: boolean;
}

export interface TableColumn {
  column: string;
  type: ColType;
  component?: Type<any>;
  policy?: Policy;
  styleClasses?: string[];
  default?: any;
  enableSorting?: boolean;
  event?: string;
  icon?: string;
  readonly?: boolean;
}

export interface ActionEvent {
  action: string | string[];
}

export interface TableActionEvent extends ActionEvent {
  index?: number;
  row?: any;
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
      [expansionComponent]="expansionRow"
      [filterComponent]="filter"
      (actionEmitter)="eventHandler($event)"
    />
  `,
})
export class AppComponent {
  title = 'ng-table';

  testService = inject(TestService);
  expansionRow: Type<any> = ExpansionRowComponent;
  filter: Type<any> = FilterComponent;

  tableConfig: TableConfig = {
    select: {
      enabled: true,
      default: false,
    },
    filter: {
      enabled: true,
    },
    pagination: {
      enabled: true,
      callback: () => {
        this.testService.pagination$.next();
      },
    },
  };

  dataSource = new TableDataSource(
    toObservable(this.testService.data),
    this.tableConfig
  );

  columns: TableColumn[] = [
    {
      column: 'kebab',
      type: ColType.icon,
      component: KebabCellComponent,
      icon: 'bi-three-dots-vertical',
    },
    {
      column: 'icon',
      type: ColType.icon,
      component: IconCellComponent,
      icon: 'bi-cart2',
      styleClasses: ['fs-4'],
      readonly: true,
    },
    {
      column: 'created_at',
      type: ColType.data,
      component: DataCellComponent,
    },
    {
      column: 'number',
      type: ColType.button,
      component: GitHubRowCell,
      event: 'navigateToRepo',
      styleClasses: ['btn-link'],
    },
    {
      column: 'state',
      type: ColType.data,
      component: DataCellComponent,
    },
    {
      column: 'title',
      type: ColType.data,
      component: DataCellComponent,
    },
    {
      column: 'form',
      type: ColType.form,
      component: FormCellComponent,
    },
  ];

  constructor() {
    // this.dataSource.selectedItems$.subscribe((items) => console.log(items));
  }

  eventHandler(event: TableActionEvent): void {
    console.log(event);

    switch (event.action) {
      case 'selectAll': {
        break;
      }
      case 'navigateToRepo': {
        window.open(event.row.html_url);
      }
    }
  }
}
