import { Component, Input } from '@angular/core';

@Component({
  selector: 'table-expansion-row',
  standalone: true,
  template: `
    <div class="card ">
      <div class="card-body">
        <h5 class="card-title">{{ data.title }}</h5>
        <h6 class="card-subtitle mb-2 text-body-secondary">{{ data.state }}</h6>
        <p class="card-text">
          {{ data.body }}
        </p>
        <a href="#" class="card-link">Card link</a>
        <a href="#" class="card-link">Another link</a>
      </div>
    </div>
  `,
})
export class ExpansionRowComponent {
  @Input({ required: true }) data: any;
}
