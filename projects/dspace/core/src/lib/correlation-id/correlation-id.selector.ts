import { createSelector } from '@ngrx/store';

import { coreSelector } from '../core.selectors';
import { CoreState } from '../core-state.model';

export const correlationIdSelector = createSelector(coreSelector, (state: CoreState) => state.correlationId);
