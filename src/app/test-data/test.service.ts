import { Injectable, computed, signal } from '@angular/core';
import { ELEMENT_DATA, PeriodicElement } from './test.data';
import { Observable, Subject, concatMap, map, startWith } from 'rxjs';
import { __values } from 'tslib';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class TestService {
  state = signal<any>({
    data: [],
    page: 0,
    pageSize: 30,
  });

  data = computed(() => this.state().data);
  page = computed(() => this.state().page);
  pageSize = computed(() => this.state().pageSize);

  pagination$ = new Subject<void>();

  private dataLoaded$: Observable<PeriodicElement[]> = this.pagination$.pipe(
    startWith([]),
    map(() => this.loadData())
  );

  constructor() {
    this.dataLoaded$
      .pipe(takeUntilDestroyed())
      .subscribe((data: PeriodicElement[]) =>
        this.state.update((state) => ({
          ...state,
          data: [...state.data, ...data],
          page: state.page + 1,
        }))
      );
  }

  loadData(): PeriodicElement[] {
    const currentPage = this.page() + 1;
    const pageSize = this.pageSize();
    if (ELEMENT_DATA.length > (currentPage + 1) * pageSize) {
      return [];
    }

    return ELEMENT_DATA.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }
}
