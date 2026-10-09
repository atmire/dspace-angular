import { Config } from './config.interface';

/**
 * Configuration interface used by the AccessibilitySettingsService
 */
export class AccessibilitySettingsConfig implements Config {
  /**
   * The duration in days after which the accessibility settings cookie expires
   */
  cookieExpirationDuration: number;

  /**
   * When true, honour the OS prefers-color-scheme: dark preference by remapping
   * a small set of CSS custom properties (background, surface, text, border)
   * in the active theme. Off by default so deployers can opt in.
   */
  enablePrefersColorScheme?: boolean;
}
