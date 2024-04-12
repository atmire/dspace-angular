import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouteService } from '../../core/services/route.service';
import { SharedModule } from '../../shared/shared.module';
import { CollectionDataService } from '../../core/data/collection-data.service';
import { of as observableOf } from 'rxjs';
import { CommunityDataService } from '../../core/data/community-data.service';
import { CreateCollectionPageComponent } from './create-collection-page.component';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { RequestService } from '../../core/data/request.service';
import {Store} from '@ngrx/store';
import {TruncatablesState} from '../../shared/truncatable/truncatable.reducer';
import {DSpaceObjectDataService} from '../../core/data/dspace-object-data.service';

describe('CreateCollectionPageComponent', () => {
  let comp: CreateCollectionPageComponent;
  let fixture: ComponentFixture<CreateCollectionPageComponent>;
  const store: Store<TruncatablesState> = jasmine.createSpyObj('store', {
    /* eslint-disable no-empty,@typescript-eslint/no-empty-function */
    dispatch: {},
    /* eslint-enable no-empty, @typescript-eslint/no-empty-function */
    pipe: observableOf(true)
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), SharedModule, CommonModule, RouterTestingModule],
      declarations: [CreateCollectionPageComponent],
      providers: [
        { provide: CollectionDataService, useValue: {} },
        {
          provide: CommunityDataService,
          useValue: { findById: () => observableOf({ payload: { name: 'test' } }) }
        },
        { provide: RouteService, useValue: { getQueryParameterValue: () => observableOf('1234') } },
        { provide: Router, useValue: {} },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: RequestService, useValue: {}},
        { provide: Store, useValue: store },
        { provide: DSpaceObjectDataService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCollectionPageComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('frontendURL', () => {
    it('should have the right frontendURL set', () => {
      expect((comp as any).frontendURL).toEqual('/collections/');
    });
  });
});
