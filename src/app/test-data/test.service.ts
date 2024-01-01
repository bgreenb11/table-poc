import { Injectable, computed, signal } from '@angular/core';
import { ELEMENT_DATA } from './test.data';
import { Observable, map } from 'rxjs';
import { __values } from 'tslib';

@Injectable({
  providedIn: 'root',
})
export class TestService {
  state = signal<any>({
    data: ELEMENT_DATA,
  });

  data = computed(() => this.state().data);
}
