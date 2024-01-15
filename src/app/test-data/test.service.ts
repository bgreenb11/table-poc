import { Injectable, computed, inject, signal } from '@angular/core';
import { ELEMENT_DATA, PeriodicElement } from './test.data';
import {
  Observable,
  Subject,
  concatMap,
  exhaustMap,
  map,
  startWith,
  switchMap,
} from 'rxjs';
import { __values } from 'tslib';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TestService {
  private http = inject(HttpClient);

  state = signal<any>({
    data: [],
    totalCount: 0,
    page: 0,
    pageSize: 30,
  });

  data = computed(() => this.state().data);
  page = computed(() => this.state().page);
  pageSize = computed(() => this.state().pageSize);
  totalCount = computed(() => this.state().totalCount);

  pagination$ = new Subject<void>();

  private dataLoaded$: Observable<GithubApi> = this.pagination$.pipe(
    startWith([]),
    exhaustMap(() => this.getRepoIssues(this.page(), this.pageSize()))
  );

  constructor() {
    this.dataLoaded$
      .pipe(takeUntilDestroyed())
      .subscribe((response: GithubApi) =>
        this.state.update((state) => ({
          ...state,
          data: [...state.data, ...response.items],
          page: state.page + 1,
        }))
      );
  }

  getRepoIssues(page: number, pageSize: number): Observable<GithubApi> {
    const href = 'https://api.github.com/search/issues';
    const requestUrl = `${href}?q=repo:angular/components&page=${
      page + 1
    }&per_page=${pageSize}`;

    return this.http.get<GithubApi>(requestUrl);
  }

  getEvents(url: string): Observable<any> {
    return this.http.get(url);
  }
}

export interface GithubApi {
  items: GithubIssue[];
  total_count: number;
}

export interface GithubIssue {
  created_at: string;
  number: string;
  state: string;
  title: string;
}
