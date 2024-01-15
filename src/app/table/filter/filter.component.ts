import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface FilterObject {
  filter: Function;
}

@Component({
  standalone: true,
  selector: 'app-default-filter',
  template: `
    <form [formGroup]="form">
      <div class="mb-3">
        <input
          type="text"
          class="form-control"
          id="filter"
          placeholder="Filter"
          formControlName="filter"
        />
      </div>
    </form>
  `,
  imports: [ReactiveFormsModule],
})
export class FilterComponent {
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.nonNullable.group({
    filter: [''],
  });

  filter: (data: any) => boolean = (data: any): boolean => {
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
    const transformedFilter = this.form
      .getRawValue()
      .filter.trim()
      .toLowerCase();

    return dataStr.indexOf(transformedFilter) != -1;
  };
}
