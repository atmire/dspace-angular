import { ChangeDetectorRef, Component, ComponentFactoryResolver } from '@angular/core';
import { ContextHelpToggleComponent } from './context-help-toggle.component';
import { ThemedComponent } from '../../shared/theme-support/themed.component';
import { ThemeService } from '../../shared/theme-support/theme.service';

/**
 * Themed wrapper for ContextHelpToggleComponent
 */
@Component({
  selector: 'ds-themed-context-help-toggle',
  styleUrls: [],
  templateUrl: '../../shared/theme-support/themed.component.html',
})
export class ThemedContextHelpToggleComponent extends ThemedComponent<ContextHelpToggleComponent> {
  protected inAndOutputNames: (keyof ContextHelpToggleComponent & keyof this)[] = [];

  constructor(
    protected resolver: ComponentFactoryResolver,
    protected cdr: ChangeDetectorRef,
    protected themeService: ThemeService
  ) {
    super(resolver, cdr, themeService);
  }

  protected getComponentName(): string {
    return 'ContextHelpToggleComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/header/context-help-toggle/context-help-toggle.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import('./context-help-toggle.component');
  }
}
