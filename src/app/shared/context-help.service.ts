import { Injectable } from '@angular/core';
import { ContextHelp } from './context-help.model';
import { Store, createFeatureSelector, createSelector, select, MemoizedSelector } from '@ngrx/store';
import { ContextHelpState, ContextHelpModels } from './context-help.reducer';
import {
  ContextHelpToggleIconsAction,
  ContextHelpAddAction,
  ContextHelpRemoveAction,
  ContextHelpShowTooltipAction,
  ContextHelpHideTooltipAction,
  ContextHelpToggleTooltipAction
} from './context-help.actions';
import { from, Observable } from 'rxjs';
import {map, mergeAll, reduce, switchMap, } from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';

const contextHelpStateSelector =
  createFeatureSelector<ContextHelpState>('contextHelp');
const allIconsVisibleSelector = createSelector(
  contextHelpStateSelector,
  (state: ContextHelpState): boolean => state.allIconsVisible
);
const contextHelpSelector =
  (id: string): MemoizedSelector<ContextHelpState, ContextHelp> => createSelector(
    contextHelpStateSelector,
    (state: ContextHelpState) => state.models[id]
  );
const allContextHelpSelector = createSelector(
  contextHelpStateSelector,
  ((state: ContextHelpState) => state.models)
);

@Injectable({
  providedIn: 'root'
})
export class ContextHelpService {
  constructor(private store: Store<ContextHelpState>,
              private translateService: TranslateService) { }

  /**
   * Observable keeping track of whether context help icons should be visible globally.
   */
  shouldShowIcons$(): Observable<boolean> {
    return this.store.pipe(select(allIconsVisibleSelector));
  }

  /**
   * Observable that tracks the state for a specific context help icon.
   *
   * @param id: id of the context help icon.
   */
  getContextHelp$(id: string): Observable<ContextHelp> {
    return this.store.pipe(select(contextHelpSelector(id)));
  }

  /**
   * Observable that emits the number of context help icons that have a translation key different from the key itself.
   * This is done since we don't want to count the icons that have no translation key, as they won't be shown.
   */
  tooltipCount$(): Observable<number> {
    return this.store.pipe(
      select(allContextHelpSelector),
      switchMap((models: ContextHelpModels) => {
        return from(Object.values(models).map((contextHelp: ContextHelp) => this.translateService.get(contextHelp.translationKey).pipe(
          map(translatedText => {
            return translatedText !== contextHelp.translationKey ? 1 : 0;
          }),
        ))).pipe(
          mergeAll(),
          reduce((acc, count) => acc + count, 0),
        );
      }),
    );
  }

  /**
   * Toggles the visibility of all context help icons.
   */
  toggleIcons() {
    this.store.dispatch(new ContextHelpToggleIconsAction());
  }

  /**
   * Registers a new context help icon to the store.
   *
   * @param contextHelp: the initial state of the new help icon.
   */
  add(contextHelp: ContextHelp) {
    this.store.dispatch(new ContextHelpAddAction(contextHelp));
  }

  /**
   * Removes a context help icon from the store.
   *
   * @id: the id of the help icon to be removed.
   */
  remove(id: string) {
    this.store.dispatch(new ContextHelpRemoveAction(id));
    // When a context help icon is removed, the visible tooltip count should be updated
    this.tooltipCount$().subscribe();
  }

  /**
   * Toggles the tooltip of a single context help icon.
   *
   * @id: the id of the help icon for which the visibility will be toggled.
   */
  toggleTooltip(id: string) {
    this.store.dispatch(new ContextHelpToggleTooltipAction(id));
  }

  /**
   * Shows the tooltip of a single context help icon.
   *
   * @id: the id of the help icon that will be made visible.
   */
  showTooltip(id: string) {
    this.store.dispatch(new ContextHelpShowTooltipAction(id));
  }

  /**
   * Hides the tooltip of a single context help icon.
   *
   * @id: the id of the help icon that will be made invisible.
   */
  hideTooltip(id: string) {
    this.store.dispatch(new ContextHelpHideTooltipAction(id));
  }
}
