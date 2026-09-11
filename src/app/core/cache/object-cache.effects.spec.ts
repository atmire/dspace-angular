import { TestBed } from '@angular/core/testing';

import { ObjectCacheEffects } from './object-cache.effects';

describe('ObjectCacheEffects', () => {
  let cacheEffects: ObjectCacheEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ObjectCacheEffects,
      ],
    });

    cacheEffects = TestBed.inject(ObjectCacheEffects);
  });

  it('should be created', () => {
    expect(cacheEffects).toBeTruthy();
  });
});
