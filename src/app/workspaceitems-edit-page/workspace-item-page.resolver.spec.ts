import { WorkspaceitemDataService, createSuccessfulRemoteDataObject$ } from '@dspace/core'
import { first } from 'rxjs/operators';

import { workspaceItemPageResolver } from './workspace-item-page.resolver';

describe('workspaceItemPageResolver', () => {
  describe('resolve', () => {
    let resolver: any;
    let wsiService: WorkspaceitemDataService;
    const uuid = '1234-65487-12354-1235';

    beforeEach(() => {
      wsiService = {
        findById: (id: string) => createSuccessfulRemoteDataObject$({ id }),
      } as any;
      resolver = workspaceItemPageResolver;
    });

    it('should resolve a workspace item with the correct id', (done) => {
      resolver({ params: { id: uuid } } as any, undefined, wsiService)
        .pipe(first())
        .subscribe(
          (resolved) => {
            expect(resolved.payload.id).toEqual(uuid);
            done();
          },
        );
    });
  });
});
