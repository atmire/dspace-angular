import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { FormsModule } from '@angular/forms';
import { hasNoValue } from '../../../shared/empty.util';

@Component({
  selector: 'ds-date-field',
  standalone: true,
  imports: [
    FormlyModule,
    FormsModule
  ],
  templateUrl: './date-field.component.html',
  styleUrl: './date-field.component.scss'
})
export class DateFieldComponent extends FieldType<FieldTypeConfig> {
  year: number;
  month: number;
  day: number;

  ngOnInit() {
    const matches = this.model[this.key as string].match(/^(\d{4})-(\d{2})-(\d{2}).*$/);
    this.year = Number(matches[1]);
    this.month = Number(matches[2]);
    this.day = Number(matches[3]);
  }

  updateFormControl() {
    const year = `${this.year}`.padStart(4, '0');
    const month = `${this.month}`.padStart(2, '0');
    const day = `${this.day}`.padStart(2, '0');
    this.formControl.setValue(`${year}-${month}-${day}`);
  }

}
