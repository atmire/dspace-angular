import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DynamicCheckboxModel, DynamicSelectModel } from '@ng-dynamic-forms/core';

export const accessConditionChangeEvent = {
  $event: {
    bubbles: true,
    cancelBubble: false,
    cancelable: false,
    composed: false,
    currentTarget: null,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    returnValue: true,
    timeStamp: 143042.8999999999,
    type: 'change',
  },
  context: null,
  control: new UntypedFormControl({
    errors: null,
    pristine: false,
    status: 'VALID',
    statusChanges: { _isScalar: false, observers: [], closed: false, isStopped: false, hasError: false },
    touched: true,
    value: { year: 2021, month: 12, day: 30 },
    valueChanges: { _isScalar: false, observers: [], closed: false, isStopped: false, hasError: false },
    _updateOn: 'change',
  }),
  group: new UntypedFormGroup({}),
  model: new DynamicSelectModel({
    additional: null,
    asyncValidators: null,
    controlTooltip: null,
    errorMessages: { required: 'submission.sections.upload.form.date-required-until' },
    hidden: false,
    hint: null,
    id: 'endDate',
    label: 'submission.sections.upload.form.until-label',
    labelTooltip: null,
    name: 'endDate',
    placeholder: 'Until',
    prefix: null,
    relations: [],
    required: true,
    suffix: null,
    tabIndex: null,
    updateOn: null,
    validators: { required: null },
  }),
  type: 'change'
};


export const checkboxChangeEvent = {
  $event: {
    bubbles: true,
    cancelBubble: false,
    cancelable: false,
    composed: false,
    currentTarget: null,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    returnValue: true,
    timeStamp: 143042.8999999999,
    type: 'change',
  },
  context: null,
  control: new UntypedFormControl({
    errors: null,
    pristine: false,
    status: 'VALID',
    statusChanges: { _isScalar: false, observers: [], closed: false, isStopped: false, hasError: false },
    touched: true,
    value: { year: 2021, month: 12, day: 30 },
    valueChanges: { _isScalar: false, observers: [], closed: false, isStopped: false, hasError: false },
    _updateOn: 'change',
  }),
  group: new UntypedFormGroup({}),
  model: new DynamicCheckboxModel({
    additional: null,
    asyncValidators: null,
    controlTooltip: null,
    errorMessages: null,
    hidden: false,
    hint: null,
    id: 'discoverable',
    indeterminate: false,
    label: 'Discoverable',
    labelPosition: null,
    labelTooltip: null,
    name: 'discoverable',
    relations: [],
    required: false,
    tabIndex: null,
    updateOn: null,
    validators: { required: null },
  }),
  type: 'change'
};
