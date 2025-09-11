import { InjectionToken } from '@angular/core';
import {
  GenericConstructor,
  HALDataService,
} from '@dspace/core';

export type LazyDataServicesMap = Map<string, () => Promise<GenericConstructor<HALDataService<any>> | { default: GenericConstructor<HALDataService<any>> }>>;

export const APP_DATA_SERVICES_MAP: InjectionToken<LazyDataServicesMap> = new InjectionToken<LazyDataServicesMap>('APP_DATA_SERVICES_MAP');
