import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  Community,
  CommunityDataService,
  createPaginatedList,
  createSuccessfulRemoteDataObject$,
  DSpaceObjectType,
  NotificationsService,
} from '@dspace/core';
import { TranslateModule } from '@ngx-translate/core';

import { ThemedLoadingComponent } from '../../../loading/themed-loading.component';
import { ListableObjectComponentLoaderComponent } from '../../../object-collection/shared/listable-object/listable-object-component-loader.component';
import { SearchService } from '../../../search/search.service';
import { VarDirective } from '../../../utils/var.directive';
import { AuthorizedCommunitySelectorComponent } from './authorized-community-selector.component';

describe('AuthorizedCommunitySelectorComponent', () => {
  let component: AuthorizedCommunitySelectorComponent;
  let fixture: ComponentFixture<AuthorizedCommunitySelectorComponent>;

  let communityService;
  let community;

  let notificationsService: NotificationsService;

  beforeEach(waitForAsync(() => {
    community = Object.assign(new Community(), {
      id: 'authorized-community',
    });
    communityService = jasmine.createSpyObj('communityService', {
      getAuthorizedCommunity: createSuccessfulRemoteDataObject$(createPaginatedList([community])),
    });
    notificationsService = jasmine.createSpyObj('notificationsService', ['error']);
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterTestingModule.withRoutes([]), AuthorizedCommunitySelectorComponent, VarDirective],
      providers: [
        { provide: SearchService, useValue: {} },
        { provide: CommunityDataService, useValue: communityService },
        { provide: NotificationsService, useValue: notificationsService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AuthorizedCommunitySelectorComponent, {
        remove: { imports: [ListableObjectComponentLoaderComponent, ThemedLoadingComponent] },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorizedCommunitySelectorComponent);
    component = fixture.componentInstance;
    component.types = [DSpaceObjectType.COMMUNITY];
    fixture.detectChanges();
  });

  describe('search', () => {
    it('should call getAuthorizedCommunity and return the authorized community in a SearchResult', (done) => {
      component.search('', 1).subscribe((resultRD) => {
        expect(communityService.getAuthorizedCommunity).toHaveBeenCalled();
        expect(resultRD.payload.page.length).toEqual(1);
        expect(resultRD.payload.page[0].indexableObject).toEqual(community);
        done();
      });
    });
  });
});
