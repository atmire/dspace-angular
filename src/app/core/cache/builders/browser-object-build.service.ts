import { Inject, Injectable } from '@angular/core';
import { ObjectBuildService } from './object-build.service';
import { NativeWindowRef, NativeWindowService } from '../../services/window.service';

@Injectable()
export class BrowserObjectBuildService extends ObjectBuildService {
  constructor(@Inject(NativeWindowService) private _window: NativeWindowRef) {
    super();
  }

  protected getCerializeTypeMap() {
    return (this._window.nativeWindow as any).__CerializeTypeMap;
  }
}
