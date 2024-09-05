import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkspaceitemDataService } from '../../core/submission/workspaceitem-data.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';
import { WorkspaceItem } from '../../core/submission/models/workspaceitem.model';
import { RemoteData } from '../../core/data/remote-data';
import { switchMap, map } from 'rxjs/operators';
import {
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteData
} from '../../core/shared/operators';
import { hasValue } from '../../shared/empty.util';
import { NgIf, AsyncPipe } from '@angular/common';
import { ThemedLoadingComponent } from '../../shared/loading/themed-loading.component';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { observe, generate } from 'fast-json-patch';
import { HrefOnlyDataService } from '../../core/data/href-only-data.service';
import { RESTURLCombiner } from '../../core/url-combiner/rest-url-combiner';
import {
  SubmissionFormModel,
  FormRowModel
} from '../../core/config/models/config-submission-form.model';
import { FormFieldModel } from '../../shared/form/builder/models/form-field.model';
import { DateFieldComponent } from './date-field/date-field.component';
import { RequestService } from '../../core/data/request.service';
import { PatchRequest } from '../../core/data/request.models';

const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

@Component({
  selector: 'ds-submission-page',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    ThemedLoadingComponent,
    ReactiveFormsModule,
    FormlyModule,
    FormlyBootstrapModule,
    DateFieldComponent
  ],
  templateUrl: './submission-page.component.html',
  styleUrl: './submission-page.component.scss'
})
export class SubmissionPageComponent implements OnInit, OnDestroy {
  protected subs: Subscription[] = [];

  wsiRd$: BehaviorSubject<RemoteData<WorkspaceItem>> = new BehaviorSubject(undefined);
  sectionRd$: BehaviorSubject<RemoteData<SubmissionFormModel>> = new BehaviorSubject(undefined);
  fields$: BehaviorSubject<FormlyFieldConfig[]> = new BehaviorSubject([]);
  form = new FormGroup({});
  model = {};
  count = 1;
  focusField: string;
  modelChanges;

  constructor(
    protected route: ActivatedRoute,
    protected hrefOnlyDataService: HrefOnlyDataService,
    protected wsiDataService: WorkspaceitemDataService,
    protected requestService: RequestService,
  ) {
  }

  ngOnInit(): void {
    this.subs.push(this.route.data.pipe(
      map((data: any) => data.wsi),
      getFirstCompletedRemoteData(),
      switchMap((wsiRd: RemoteData<WorkspaceItem>) => {
        if (wsiRd.hasSucceeded) {
          return this.wsiDataService.findById(wsiRd.payload.id);
        } else {
          return [wsiRd];
        }
      })
    ).subscribe((wsiRd: RemoteData<WorkspaceItem>) => this.wsiRd$.next(wsiRd)));

    this.wsiRd$.pipe(getFirstSucceededRemoteData()).subscribe((wsiRd: RemoteData<WorkspaceItem>) => {
      Object.entries(wsiRd.payload.sections['publicationStep']).forEach(([key, mdv]) => {
        this.model[key.replace(/\./g, '-')] = mdv[0].value;
      });
      this.modelChanges = observe(this.model);
    });

    //Todo we should get this by following links from the wsi, but that doesn't work on the backend, so it's a hardcoded link for now:
    this.subs.push(this.hrefOnlyDataService.findByHref<SubmissionFormModel>(
      new RESTURLCombiner('/config/submissionforms/traditionalpageone').toString()
    ).subscribe((formRd: RemoteData<SubmissionFormModel>) => {
      this.sectionRd$.next(formRd);
    }));

    this.subs.push(this.sectionRd$.subscribe((formRd: RemoteData<SubmissionFormModel>) => {
      if (hasValue(formRd) && formRd.hasSucceeded) {
        const fields = formRd.payload.rows.map((row: FormRowModel) => {
          const colsize = 12 / row.fields.length;

          const fieldGroup = row.fields.map((field: FormFieldModel) => {
            const key = field.selectableMetadata[0].metadata.replace(/\./g, '-');

            // generate default values if there are none yet
            // if (this.focusField !== key && isEmpty(this.model[key])) {
            //   if (field.input.type === 'date') {
            //     this.model[key] = randomDate(new Date('2010'), new Date()).toISOString().split('T')[0];
            //   } else {
            //     this.model[key] = `${field.label} ${this.count}`;
            //   }
            // }

            return {
              className: `col-${colsize}`,
              type: field.input.type === 'date' ? DateFieldComponent : 'input',
              key: key,
              props: {
                label: field.label,
                description: field.hints,
                required: field.mandatory,
                focus: () => this.focusField = key,
                blur: () => {
                  if (this.focusField === key) {
                    this.focusField = undefined;
                  }
                },
              },
            };
          });

          return {
            fieldGroupClassName: 'row',
            fieldGroup
          }
        });
        this.fields$.next(fields as any as FormlyFieldConfig[]);
      }

    }));
  }

  onSubmit(model) {
    const patch = generate(this.modelChanges).map((operation) => {
      return Object.assign(operation, {
        path: `/sections/publicationStep${operation.path.replace(/-/g, '.')}`,
        value: [{
          value: (operation as any).value,
          authority: null,
          language: null
        }]
      })
    });
    console.log('patch', patch);
    const requestId = this.requestService.generateRequestId();
    const request = new PatchRequest(requestId, this.wsiRd$.getValue().payload.self, patch);
    this.requestService.send(request);
  }

  ngOnDestroy(): void {
    this.subs
      .filter((sub: Subscription) => hasValue(sub))
      .forEach((sub: Subscription) => sub.unsubscribe());
  }
}
