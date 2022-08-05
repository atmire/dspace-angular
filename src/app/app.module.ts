import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EffectsModule } from '@ngrx/effects';
import { RouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { MetaReducer, Store, StoreModule, USER_PROVIDED_META_REDUCERS } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import {
  DYNAMIC_ERROR_MESSAGES_MATCHER,
  DYNAMIC_MATCHER_PROVIDERS,
  DynamicErrorMessagesMatcher
} from '@ng-dynamic-forms/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { appEffects } from './app.effects';
import { appMetaReducers, debugMetaReducers } from './app.metareducers';
import { appReducers, AppState, storeModuleConfig } from './app.reducer';
import { CheckAuthenticationTokenAction } from './core/auth/auth.actions';
import { CoreModule } from './core/core.module';
import { ClientCookieService } from './core/services/client-cookie.service';
import { NavbarModule } from './navbar/navbar.module';
import { DSpaceRouterStateSerializer } from './shared/ngrx/dspace-router-state-serializer';
import { SharedModule } from './shared/shared.module';
import { environment } from '../environments/environment';
import { AuthInterceptor } from './core/auth/auth.interceptor';
import { LocaleInterceptor } from './core/locale/locale.interceptor';
import { XsrfInterceptor } from './core/xsrf/xsrf.interceptor';
import { LogInterceptor } from './core/log/log.interceptor';
import { EagerThemesModule } from '../themes/eager-themes.module';

import { APP_CONFIG, AppConfig } from '../config/app-config.interface';
import { RootModule } from './root.module';
import { defaultOptions, PrebootModule } from 'preboot';

export function getConfig() {
  return environment;
}

export function getBase(appConfig: AppConfig) {
  return appConfig.ui.nameSpace;
}

export function getMetaReducers(appConfig: AppConfig): MetaReducer<AppState>[] {
  return appConfig.debug ? [...appMetaReducers, ...debugMetaReducers] : appMetaReducers;
}

/**
 * Condition for displaying error messages on email form field
 */
export const ValidateEmailErrorStateMatcher: DynamicErrorMessagesMatcher =
  (control: AbstractControl, model: any, hasFocus: boolean) => {
    return (control.touched && !hasFocus) || (control.errors?.emailTaken && hasFocus);
  };

const IMPORTS = [
  CommonModule,
  SharedModule,
  NavbarModule,
  HttpClientModule,
  AppRoutingModule,
  CoreModule.forRoot(),
  ScrollToModule.forRoot(),
  NgbModule,
  TranslateModule.forRoot(),
  EffectsModule.forRoot(appEffects),
  StoreModule.forRoot(appReducers, storeModuleConfig),
  StoreRouterConnectingModule.forRoot(),
  EagerThemesModule,
  RootModule,
  BrowserModule.withServerTransition({ appId: 'dspace-angular' }),
  PrebootModule.withConfig({
    appRoot: 'ds-app',
    eventSelectors: [
      // Preboot defaults START

      // for recording changes in form elements
      {
        selector: 'input,textarea',
        events: ['keypress', 'keyup', 'keydown', 'input', 'change']
      },
      { selector: 'select,option', events: ['change'] },

      // when user hits return button in an input box
      {
        selector: 'input',
        events: ['keyup'],
        preventDefault: true,
        keyCodes: [13],
        freeze: true
      },

      // when user submit form (press enter, click on button/input[type="submit"])
      {
        selector: 'form',
        events: ['submit'],
        preventDefault: true,
        freeze: true
      },

      // for tracking focus (no need to replay)
      {
        selector: 'input,textarea',
        events: ['focusin', 'focusout', 'mousedown', 'mouseup'],
        replay: false
      },

      // // user clicks on a button
      // {
      //   selector: 'button',
      //   events: ['click'],
      //   preventDefault: true,
      //   freeze: true
      // },

      // Preboot defaults END

      // we have a lot of "link buttons"
      // we probably don't want to freeze either (or maybe make the overlay transparent?)
      {
        selector: 'a.preboot-replay,a.dropdown-toggle,button',
        events: ['click'],
        preventDefault: true,
      },
      // router links can misbehave with event replay enabled
      {
        selector: 'a',
        events: ['click'],
        preventDefault: true,
      }
    ]
  })
];

IMPORTS.push(
  StoreDevtoolsModule.instrument({
    maxAge: 1000,
    logOnly: environment.production,
  })
);

const PROVIDERS = [
  {
    provide: APP_CONFIG,
    useFactory: getConfig
  },
  {
    provide: APP_BASE_HREF,
    useFactory: getBase,
    deps: [APP_CONFIG]
  },
  {
    provide: USER_PROVIDED_META_REDUCERS,
    useFactory: getMetaReducers,
    deps: [APP_CONFIG]
  },
  {
    provide: RouterStateSerializer,
    useClass: DSpaceRouterStateSerializer
  },
  ClientCookieService,
  // Check the authentication token when the app initializes
  {
    provide: APP_INITIALIZER,
    useFactory: (store: Store<AppState>,) => {
      return () => store.dispatch(new CheckAuthenticationTokenAction());
    },
    deps: [Store],
    multi: true
  },
  // register AuthInterceptor as HttpInterceptor
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  },
  // register LocaleInterceptor as HttpInterceptor
  {
    provide: HTTP_INTERCEPTORS,
    useClass: LocaleInterceptor,
    multi: true
  },
  // register XsrfInterceptor as HttpInterceptor
  {
    provide: HTTP_INTERCEPTORS,
    useClass: XsrfInterceptor,
    multi: true
  },
  // register LogInterceptor as HttpInterceptor
  {
    provide: HTTP_INTERCEPTORS,
    useClass: LogInterceptor,
    multi: true
  },
  {
    provide: DYNAMIC_ERROR_MESSAGES_MATCHER,
    useValue: ValidateEmailErrorStateMatcher
  },
  ...DYNAMIC_MATCHER_PROVIDERS,
];

const DECLARATIONS = [
  AppComponent,
];

const EXPORTS = [
];

@NgModule({
  imports: [
    ...IMPORTS
  ],
  providers: [
    ...PROVIDERS
  ],
  declarations: [
    ...DECLARATIONS,
  ],
  exports: [
    ...EXPORTS,
    ...DECLARATIONS,
  ]
})
export class AppModule {

}
