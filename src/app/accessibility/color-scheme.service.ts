import {
  DOCUMENT,
  Inject,
  Injectable,
} from '@angular/core';
import {
  APP_CONFIG,
  AppConfig,
} from '@dspace/config/app-config.interface';

/**
 * Applies the opt-in prefers-color-scheme dark mapping class based on
 * {@link AccessibilitySettingsConfig#enablePrefersColorScheme}.
 */
@Injectable({
  providedIn: 'root',
})
export class ColorSchemeService {

  DS_ENABLE_PREFERS_COLOR_SCHEME_CLASS = 'ds-enable-prefers-color-scheme';

  constructor(
    @Inject(DOCUMENT) protected document: Document,
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
  ) {
  }

  /**
   * Add or remove the prefers-color-scheme opt-in class on <html>
   * according to the current accessibility configuration.
   */
  init(): void {
    const html = this.document.documentElement;
    if (this.appConfig.accessibility?.enablePrefersColorScheme) {
      html.classList.add(this.DS_ENABLE_PREFERS_COLOR_SCHEME_CLASS);
    } else {
      html.classList.remove(this.DS_ENABLE_PREFERS_COLOR_SCHEME_CLASS);
    }
  }
}
