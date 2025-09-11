import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import {
  authReducer,
  AuthService,
  AuthMethod,
  AuthMethodType,
  AuthorizationDataService,
  HardRedirectService,
  AuthServiceStub,
  AuthorizationDataServiceStub,
  createTestComponent,
} from '@dspace/core'
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { LogInContainerComponent } from './log-in-container.component';

describe('LogInContainerComponent', () => {

  let component: LogInContainerComponent;
  let fixture: ComponentFixture<LogInContainerComponent>;

  const authMethod = new AuthMethod(AuthMethodType.Password, 0);

  let hardRedirectService: HardRedirectService;

  beforeEach(waitForAsync(() => {
    hardRedirectService = jasmine.createSpyObj('hardRedirectService', {
      redirect: {},
      getCurrentRoute: {},
    });
    // refine the test module by declaring the test component
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        StoreModule.forRoot(authReducer),
        TranslateModule.forRoot(),
        RouterTestingModule,
        TestComponent,
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: AuthorizationDataService, useClass: AuthorizationDataServiceStub },
        { provide: HardRedirectService, useValue: hardRedirectService },
        LogInContainerComponent,
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
      ],
    })
      .compileComponents();

  }));

  describe('', () => {
    let testComp: TestComponent;
    let testFixture: ComponentFixture<TestComponent>;

    // synchronous beforeEach
    beforeEach(() => {
      const html = `<ds-log-in-container [authMethod]="authMethod"> </ds-log-in-container>`;

      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;

    });

    afterEach(() => {
      testFixture.destroy();
    });

    it('should create LogInContainerComponent', inject([LogInContainerComponent], (app: LogInContainerComponent) => {

      expect(app).toBeDefined();

    }));
  });

  describe('', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(LogInContainerComponent);
      component = fixture.componentInstance;

      spyOn(component, 'getAuthMethodContent').and.callThrough();
      component.authMethod = authMethod;
      fixture.detectChanges();
    });

    afterEach(() => {
      fixture.destroy();
      component = null;
    });

    it('should inject component properly', () => {

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.getAuthMethodContent).toHaveBeenCalled();

    });

  });

});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``,
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    RouterTestingModule],
})
class TestComponent {

  isStandalonePage = true;
  authMethod = new AuthMethod(AuthMethodType.Password, 0);

}
