import 'altcha';

import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  APP_ID,
  ApplicationConfig,
  importProvidersFrom,
  inject,
  makeStateKey,
  mergeApplicationConfig,
  provideAppInitializer,
  TransferState,
} from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  AuthRequestService,
  AuthService,
  BrowserAuthRequestService,
  BrowserHardRedirectService,
  BrowserOrejimeService,
  BrowserReferrerService,
  BrowserXSRFService,
  ClientCookieService,
  ClientMathService,
  CookieService,
  coreEffects,
  coreReducers,
  CoreState,
  HardRedirectService,
  LocaleService,
  locationProvider,
  LocationToken,
  MathService,
  OrejimeService,
  ReferrerService,
  REQUEST,
  XSRFService,
} from '@dspace/core';
import { EffectsModule } from '@ngrx/effects';
import {
  Action,
  StoreConfig,
  StoreModule,
} from '@ngrx/store';
import {
  provideMissingTranslationHandler,
  provideTranslateService,
  TranslateLoader,
} from '@ngx-translate/core';
import {
  Angulartics2GoogleTagManager,
  Angulartics2RouterlessModule,
} from 'angulartics2';
import {
  provideMatomo,
  withRouteData,
  withRouter,
} from 'ngx-matomo-client';

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
    ),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [TransferState, HttpClient],
      },
      missingTranslationHandler: provideMissingTranslationHandler(MissingTranslationHelper),
    }),
    ...BrowserInitService.providers(),
    { provide: APP_ID, useValue: 'dspace-angular' },
    {
      provide: REQUEST,
      useFactory: getRequest,
      deps: [TransferState],
    },
    provideAppInitializer(() => {
      const initializerFn = ((xsrfService: XSRFService, httpClient: HttpClient) => xsrfService.initXSRFToken(httpClient))(inject(XSRFService), inject(HttpClient));
      return initializerFn();
    }),
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
