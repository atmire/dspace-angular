import { Item } from '../../../../core/shared/item.model';
import { of as observableOf } from 'rxjs';
import { ProjectGridElementComponent } from './project-grid-element.component';
import { createSuccessfulRemoteDataObject$ } from '../../../../shared/remote-data.utils';
import { buildPaginatedList } from '../../../../core/data/paginated-list.model';
import { PageInfo } from '../../../../core/shared/page-info.model';
import { waitForAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TruncatePipe } from '../../../../shared/utils/truncate.pipe';
import { TruncatableService } from '../../../../shared/truncatable/truncatable.service';
import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

const mockItem = Object.assign(new Item(), {
  bundles: createSuccessfulRemoteDataObject$(
    buildPaginatedList(new PageInfo(), [])
  ),
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'This is just another title',
      },
    ],
    'dc.description': [
      {
        language: 'en_US',
        value: 'The project description',
      },
    ],
  },
});

describe('ProjectGridElementComponent', () => {
  let comp;
  let fixture;

  const truncatableServiceStub: any = {
    isCollapsed: (id: number) => observableOf(true),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [ProjectGridElementComponent, TruncatePipe],
      providers: [
        { provide: TruncatableService, useValue: truncatableServiceStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ProjectGridElementComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default },
      })
      .compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ProjectGridElementComponent);
    comp = fixture.componentInstance;
  }));

  describe(`when the project is rendered`, () => {
    beforeEach(() => {
      comp.object = mockItem;
      fixture.detectChanges();
    });

    it(`should contain a ProjectGridElementComponent`, () => {
      const projectGridElement = fixture.debugElement.query(
        By.css(`ds-project-search-result-grid-element`)
      );
      expect(projectGridElement).not.toBeNull();
    });
  });
});
