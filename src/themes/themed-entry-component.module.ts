import { NgModule } from '@angular/core';
import { ENTRY_COMPONENTS as CUSTOM } from './custom/entry-components';
import { ENTRY_COMPONENTS as THEME_B } from './theme-b/entry-components';

const ENTRY_COMPONENTS = [
  ...CUSTOM,
  ...THEME_B,
];


/**
 * This module only serves to ensure themed entry components are discoverable. It's kept separate
 * from the theme modules to ensure only the minimal number of theme components is loaded ahead of
 * time
 */
@NgModule()
export class ThemedEntryComponentModule {
  static withEntryComponents() {
    return {
      ngModule: ThemedEntryComponentModule,
      providers: ENTRY_COMPONENTS.map((component) => ({provide: component}))
    };
  }

}
