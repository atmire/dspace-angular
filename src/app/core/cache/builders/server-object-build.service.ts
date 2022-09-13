import { Injectable } from '@angular/core';
import { ObjectBuildService } from './object-build.service';

@Injectable()
export class ServerObjectBuildService extends ObjectBuildService {
  protected getCerializeTypeMap() {
    return (global as any).__CerializeTypeMap;
  }
}
