import {
  Component,
  EventEmitter,
  Input,
  Output,
  Signal,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CdkTableModule, DataSource } from '@angular/cdk/table';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  catchError,
  combineLatest,
  debounceTime,
  filter,
  finalize,
  isObservable,
  map,
  of,
  tap,
  withLatestFrom,
} from 'rxjs';
import {
  ActionEvent,
  ColType,
  TableActionEvent,
  TableColumn,
} from '../../app.component';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { CollectionViewer } from '@angular/cdk/collections';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CdkTableModule, ReactiveFormsModule, CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent<T> {
  @Input({ required: true }) set columns(cols: TableColumn[]) {
    this._columns = [{ column: 'selected', type: ColType.checkbox }, ...cols];
  }

  @Input({ required: true }) data!: TableDataSource<T>;

  @Input() pagination: TablePagination | undefined = undefined;
  @Input() selectEnabled: boolean = false;
  @Input() selectDefault: boolean = false;

  @Output() actionEmitter: EventEmitter<TableActionEvent> =
    new EventEmitter<TableActionEvent>();

  _columns: TableColumn[] = [];

  readonly colTypes = ColType;
  readonly sortDirections = TableSortDirection;

  // source$ = new BehaviorSubject<T[]>([]);
  source$!: TableDataSource<T>;

  fb: FormBuilder = inject(FormBuilder);

  selectAllControl: FormControl = this.fb.control(false);
  selectRowsArray: FormArray = this.fb.array([]);

  filterControl: FormControl = this.fb.control('');

  sortCol$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  sortDirection$: BehaviorSubject<TableSortDirection> =
    new BehaviorSubject<TableSortDirection>(TableSortDirection.none);

  pageSize$: BehaviorSubject<number> | undefined = undefined;
  currentPage$: BehaviorSubject<number> | undefined = undefined;

  tableConfig: TableConfig = {
    select: {
      enabled: true,
      default: false,
    },
    filter: {
      enabled: true,
    },
  };

  constructor() {
    // TODO: Only create select controls when checkbox field is detected

    this.filterControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((filter) => {
        this.data.filter = filter;
      });

    combineLatest([this.sortCol$, this.sortDirection$])
      .pipe(
        takeUntilDestroyed(),
        filter(([col, direction]) => !!col && !!direction)
      )
      .subscribe(([col, direction]) => {
        this.data.sort = {
          col: col,
          direction: direction,
        };
      });
  }

  getColumnNames = (): string[] => this._columns.map((c) => c.column);

  adjustSort(col: TableColumn) {
    if (!col.enableSorting) {
      return;
    }

    if (this.sortCol$.value === col.column) {
      if (this.sortDirection$.value === 'asc') {
        this.sortDirection$.next(TableSortDirection.desc);
      } else {
        this.sortDirection$.next(TableSortDirection.asc);
      }
      return;
    }

    this.sortCol$.next(col.column);
    this.sortDirection$.next(TableSortDirection.asc);
  }
}

export enum TablePaginationType {
  page = 'page',
  scroll = 'scroll',
}

export interface TablePagination {
  pageSize: number;
  type: TablePaginationType;
}

export enum TableSortDirection {
  asc = 'asc',
  desc = 'desc',
  none = '',
}

export interface TableSort {
  col: string;
  direction: TableSortDirection;
}

export enum TableEvents {
  getSelectedItems = 'getSelectedItems',
  resetSelectedItems = 'clearSelectedItems',
  resetFilter = 'resetFilter',
  reset = 'reset',
}

export interface TableConfig {
  select?: {
    enabled: boolean;
    default?: boolean;
  };
  filter?: {
    enabled: boolean;
    filterPredicate?: (...args: any[]) => boolean;
  };
}

export class TableDataSource<T> implements DataSource<T> {
  private dataSubject = new BehaviorSubject<T[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private _sortSubject = new BehaviorSubject<TableSort>({
    col: '',
    direction: TableSortDirection.none,
  });
  private _filterSubject = new BehaviorSubject<string>('');

  private source$: Observable<T[]>;
  private subscriber: Subscription;

  public loading$ = this.loadingSubject.asObservable();

  private _config: TableConfig = {};

  private selectedItems$ = new BehaviorSubject<T[]>([]);
  private selectedItems = new Set<number>();

  selectRowArray = new FormArray<AbstractControl<any, any>>([]);
  selectRowSub!: Subscription;
  selectAllControl = new FormControl(false);
  selectAllSub!: Subscription;

  constructor(source: T[] | Observable<T[]>, config?: TableConfig) {
    this.source$ = (isObservable(source) ? source : of(source)).pipe(
      tap((data: T[]) => this.createSelectArray(data)),
      map((data: T[]) =>
        data.map((item, i) => ({ ...item, id: i, selected: false }))
      )
    );

    this._config = config ?? this._config;

    if (this._config.filter?.filterPredicate) {
      this.filterPredicate = this._config.filter.filterPredicate;
    }

    this.subscriber = combineLatest([this._filterSubject, this._sortSubject])
      .pipe(withLatestFrom(this.source$))
      .subscribe(([[filter, sort], data]) => {
        data = this._filterData(data, filter);
        data = this._sortData(data, sort);

        this.dataSubject.next(data);
      });

    this.selectRowArray.valueChanges
      .pipe(withLatestFrom(this.dataSubject))
      .subscribe(([values, data]) => {
        const allSelected = values.every((val) => val);

        this.selectedItems$.next(
          values.flatMap((v, i) => (v ? data.at(i) ?? [] : []))
        );

        if (this.selectAllControl.value !== allSelected) {
          this.selectAllControl.patchValue(allSelected, {
            emitEvent: false,
          });
        }
      });

    this.selectAllControl.valueChanges.subscribe((value) => {
      this.selectRowArray.patchValue(
        new Array(this.selectRowArray.controls.length).fill(value),
        { emitEvent: false }
      );
    });
  }

  connect(collectionViewer: CollectionViewer): Observable<T[]> {
    return this.dataSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.dataSubject.complete();
    this.loadingSubject.complete();
    this.selectedItems$.complete();
    this._sortSubject.complete();
    this._filterSubject.complete();
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
  }

  set sort(sort: TableSort) {
    this._sortSubject.next(sort);
  }

  get sort(): TableSort {
    return this._sortSubject.value;
  }

  set filter(filter: string) {
    this._filterSubject.next(filter);
  }

  get filter(): string {
    return this._filterSubject.value;
  }

  get length(): number {
    return this.dataSubject.value.length;
  }

  private _sortData(data: T[], sort?: TableSort): T[] {
    if (!sort || !sort.col) {
      return data;
    }

    return data.slice().sort((a: any, b: any) => {
      const isAsc = sort.direction === TableSortDirection.asc;
      return this._compare(a[sort.col], b[sort.col], isAsc);
    });
  }

  private _compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  private _filterData(data: T[], filter?: string) {
    if (!filter) {
      return data;
    }

    return data.filter((d) => this.filterPredicate(d, this.filter));
  }

  // Taken from https://github.com/angular/components/blob/main/src/material/table/table-data-source.ts
  filterPredicate: (data: T, filter: string) => boolean = (
    data: T,
    filter: string
  ): boolean => {
    // Transform the data into a lowercase string of all property values.
    const dataStr = Object.keys(data as unknown as Record<string, any>)
      .reduce((currentTerm: string, key: string) => {
        // Use an obscure Unicode character to delimit the words in the concatenated string.
        // This avoids matches where the values of two columns combined will match the user's query
        // (e.g. `Flute` and `Stop` will match `Test`). The character is intended to be something
        // that has a very low chance of being typed in by somebody in a text field. This one in
        // particular is "White up-pointing triangle with dot" from
        // https://en.wikipedia.org/wiki/List_of_Unicode_characters
        return (
          currentTerm + (data as unknown as Record<string, any>)[key] + '◬'
        );
      }, '')
      .toLowerCase();

    // Transform the filter by converting it to lowercase and removing whitespace.
    const transformedFilter = filter.trim().toLowerCase();

    return dataStr.indexOf(transformedFilter) != -1;
  };

  createSelectArray(data: T[]) {
    this.selectRowArray.controls = [];

    data.map((item: any) => {
      return this.selectRowArray.push(
        new FormControl(
          this.selectedItems.has(item.id) ?? this._config.select?.default
        )
      );
    });
  }

  getSelectControl(index: number): FormControl {
    return this.selectRowArray.controls[index] as FormControl;
  }

  getSelectedItems() {
    return this._filterData(
      this.selectedItems$.value,
      this._filterSubject.value
    );
  }

  getSelectedItems$(): Observable<T[]> {
    return combineLatest([this.selectedItems$, this._filterSubject]).pipe(
      map(([selectedItems, filter]) => this._filterData(selectedItems, filter))
    );
  }
}