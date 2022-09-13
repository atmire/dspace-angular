/* eslint-disable max-classes-per-file */
import { typedObject } from './build-decorators';
import { ResourceType } from '../../shared/resource-type';
import { ServerObjectBuildService } from './server-object-build.service';
import { Item } from '../../shared/item.model';
import { Bundle } from '../../shared/bundle.model';
import { Bitstream } from '../../shared/bitstream.model';

const machineType = 'machine';
const capsuleType = 'capsule';
const toyType = 'toy';

describe('ServerObjectBuildService', () => {
  let service: ServerObjectBuildService;
  let cerializeTypeMap: Map<any, any>;

  beforeEach(() => {
    cerializeTypeMap = new Map();
    cerializeTypeMap.set(Item, [{deserializedType: Bundle, deserializedKey: 'bundle'}]);
    cerializeTypeMap.set(Bundle, [{deserializedType: Bitstream, deserializedKey: 'bitstream'}]);
    service = new ServerObjectBuildService();
    global = {'__CerializeTypeMap': cerializeTypeMap} as any;
  });

  describe(`getCerializeTypeMap`, () => {
      it(`should return the cerialize map from the global variable`, () => {
        const result = (service as any).getCerializeTypeMap();
        expect(result).toBe(cerializeTypeMap);
      });
    });
});

