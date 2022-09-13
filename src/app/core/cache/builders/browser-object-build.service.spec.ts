/* eslint-disable max-classes-per-file */
import { NativeWindowRef } from '../../services/window.service';
import { typedObject } from './build-decorators';
import { ResourceType } from '../../shared/resource-type';
import { BrowserObjectBuildService } from './browser-object-build.service';
import { Item } from '../../shared/item.model';
import { Bitstream } from '../../shared/bitstream.model';
import { Bundle } from '../../shared/bundle.model';

const machineType = 'machine';
const capsuleType = 'capsule';
const toyType = 'toy';

describe('BrowserObjectBuildService', () => {
  let service: BrowserObjectBuildService;
  let windowRef: NativeWindowRef;
  let cerializeTypeMap: Map<any, any>;

  beforeEach(() => {
    cerializeTypeMap = new Map();
    cerializeTypeMap.set(Item, [{deserializedType: Bundle, deserializedKey: 'bundle'}]);
    cerializeTypeMap.set(Bundle, [{deserializedType: Bitstream, deserializedKey: 'bitstream'}]);
    windowRef = {
      nativeWindow: {
        __CerializeTypeMap: cerializeTypeMap
      }} as NativeWindowRef;
    service = new BrowserObjectBuildService(windowRef);
  });

  describe(`getCerializeTypeMap`, () => {
      it(`should return the cerialize map from the window`, () => {
        const result = (service as any).getCerializeTypeMap();
        expect(result).toBe(cerializeTypeMap);

      });
    });
});
