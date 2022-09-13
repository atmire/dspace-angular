/* eslint-disable max-classes-per-file */
import { ObjectBuildService } from './object-build.service';
import { NativeWindowRef } from '../../services/window.service';
import { typedObject } from './build-decorators';
import { ResourceType } from '../../shared/resource-type';
import { Injectable } from '@angular/core';

const machineType = 'machine';
const capsuleType = 'capsule';
const toyType = 'toy';
let cerializeTypeMap: Map<any, any>;

describe('ObjectBuildService', () => {
  let service: ObjectBuildService;
  let gashaponMachineJson: object;


  beforeEach(() => {
    gashaponMachineJson = {
      type: machineType,
      capsules: [
        {
          type: capsuleType,
          colour: 'red',
          toy: {
            type: toyType,
            name: 'car'
          }
        },
        {
          type: capsuleType,
          colour: 'blue',
          toy: {
            type: toyType,
            name: 'bouncy ball'
          }
        },
        {
          type: capsuleType,
          colour: 'green',
          toy: {
            type: toyType,
            name: 'bracelet'
          }
        },
      ]
    };
    cerializeTypeMap = new Map();
    cerializeTypeMap.set(GashaponMachine, [{deserializedType: Capsule, deserializedKey: 'capsules'}]);
    cerializeTypeMap.set(Capsule, [{deserializedType: Toy, deserializedKey: 'toy'}]);
    service = new TestObjectBuildService();
  });

  describe(`plainObjectToInstance`, () => {
    describe(`when the object has a recognized type property`, () => {
      it(`should return a new instance of that type`, () => {

        const result = (service as any).plainObjectToInstance(gashaponMachineJson);

        expect(result).toEqual(jasmine.any(GashaponMachine));
        expect(result.capsules.length).toBe(3);
        expect(result.capsules[0]).toEqual(jasmine.any(Capsule));
        expect(result.capsules[0].toy).toEqual(jasmine.any(Toy));
        expect(typeof result.capsules[2].open).toEqual('function');
        expect(typeof result.capsules[1].toy.assemble).toEqual('function');
      });
    });
    describe(`when the object doesn't have a recognized type property`, () => {
      it(`should return a new plain JS object`, () => {
        const source: any = {
          type: 'foobar',
          uuid: 'some-uuid'
        };

        const result = (service as any).plainObjectToInstance(source);
        result.foo = 'bar';

        expect(result).toEqual(jasmine.any(Object));
        expect(result.uuid).toEqual('some-uuid');
        expect(result.foo).toEqual('bar');
        expect(source.foo).toBeUndefined();
      });
    });
  });

});

@typedObject
class Toy {
  static type = new ResourceType(toyType);
  name: string;
  assemble() {/* assemble toy */}
}

@typedObject
class Capsule {
  static type = new ResourceType(capsuleType);
  colour: string;
  toy: Toy;
  open() {/* open */}
}

@typedObject
class GashaponMachine {
  static type = new ResourceType(machineType);
  capsules: Capsule[];
  turn(coin) {/* return capsule from list */}
}

@Injectable()
class TestObjectBuildService extends ObjectBuildService {
  protected getCerializeTypeMap() {
    return cerializeTypeMap;
  }
}
