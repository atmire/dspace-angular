import 'altcha';

import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  APP_ID,
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  makeStateKey,
  mergeApplicationConfig,
  TransferState,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  AuthService,
  AuthRequestService,
  BrowserAuthRequestService,
  BrowserOrejimeService,
  ClientCookieService,
  CookieService,
  OrejimeService,
  coreEffects,
  coreReducers,
  CoreState,
  LocaleService,
  BrowserReferrerService,
  BrowserHardRedirectService,
  locationProvider,
  LocationToken,
  HardRedirectService,
  ReferrerService,
  ClientMathService,
  MathService,
  BrowserXSRFService,
  XSRFService,
} from '@dspace/core'
import { EffectsModule } from '@ngrx/effects';
import { Action, StoreConfig, StoreModule } from '@ngrx/store';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Angulartics2GoogleTagManager, Angulartics2RouterlessModule } from 'angulartics2';
import { provideMatomo, withRouteData, withRouter } from 'ngx-matomo-client';
import { REQUEST } from '@dspace/core';

import { commonAppConfig } from '../../app/app.config';
import { storeModuleConfig } from '../../app/app.reducer';
import { MissingTranslationHelper } from '../../app/shared/translate/missing-translation.helper';
import { GoogleAnalyticsService } from '../../app/statistics/google-analytics.service';
import { SubmissionService } from '../../app/submission/submission.service';
import { TranslateBrowserLoader } from '../../ngx-translate-loaders/translate-browser.loader';
import { BrowserInitService } from './browser-init.service';

export const REQ_KEY = makeStateKey<string>('req');

export function createTranslateLoader(transferState: TransferState, http: HttpClient) {
  return new TranslateBrowserLoader(transferState, http, 'assets/i18n/', '.json');
}

export function getRequest(transferState: TransferState): any {
  return transferState.get<any>(REQ_KEY, {});
}

export const browserAppConfig: ApplicationConfig = mergeApplicationConfig({
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideClientHydration(),
    importProvidersFrom(
      // forRoot ensures the providers are only created once
      Angulartics2RouterlessModule.forRoot(),
      StoreModule.forFeature('core', coreReducers, storeModuleConfig as StoreConfig<CoreState, Action>),
      EffectsModule.forFeature(coreEffects),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [TransferState, HttpClient],
        },
        missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MissingTranslationHelper },
        useDefaultLang: true,
      }),
    ),
    ...BrowserInitService.providers(),
    { provide: APP_ID, useValue: 'dspace-angular' },
    {
      provide: REQUEST,
      useFactory: getRequest,
      deps: [TransferState],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (xsrfService: XSRFService, httpClient: HttpClient) => xsrfService.initXSRFToken(httpClient),
      deps: [ XSRFService, HttpClient ],
      multi: true,
    },
    {
      provide: XSRFService,
      useClass: BrowserXSRFService,
    },
    {
      provide: AuthService,
      useClass: AuthService,
    },
    {
      provide: CookieService,
      useClass: ClientCookieService,
    },
    {
      provide: OrejimeService,
      useClass: BrowserOrejimeService,
    },
    {
      provide: SubmissionService,
      useClass: SubmissionService,
    },
    {
      provide: LocaleService,
      useClass: LocaleService,
    },
    {
      provide: HardRedirectService,
      useClass: BrowserHardRedirectService,
    },
    {
      provide: GoogleAnalyticsService,
      useClass: GoogleAnalyticsService,
    },
    {
      provide: Angulartics2GoogleTagManager,
      useClass: Angulartics2GoogleTagManager,
    },
    {
      provide: AuthRequestService,
      useClass: BrowserAuthRequestService,
    },
    {
      provide: ReferrerService,
      useClass: BrowserReferrerService,
    },
    {
      provide: LocationToken,
      useFactory: locationProvider,
    },
    {
      provide: MathService,
      useClass: ClientMathService,
    },
    provideMatomo(
      {
        mode: 'deferred',
      },
      withRouter(),
      withRouteData(),
    ),
  ],
}, commonAppConfig);
