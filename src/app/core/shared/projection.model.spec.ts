/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
import { Projection } from './projection.model';

describe('Projection', () => {
  describe('toString', () => {
    it('should start with the name', () => {
      const projection = new Projection('someName', 'param1', 'param2', 'param3');
      expect(projection.toString()).toContain('projection=someName');
    });

    it('should omit parameters if none are given', () => {
      const projection = new Projection('someName');
      expect(projection.toString()).toBe('projection=someName');
    });

    it('should include concatenated parameters', () => {
      const projection1 = new Projection('someName', 'param1');
      const projection2 = new Projection('someName', 'param1', 'param2');
      const projection3 = new Projection('someName', 'param1', 'param2', 'param3');

      expect(projection1.toString()).toBe('projection=someName&param1');
      expect(projection2.toString()).toBe('projection=someName&param1=param2');
      expect(projection3.toString()).toBe('projection=someName&param1=param2=param3');
    });
  });
});
