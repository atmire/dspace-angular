/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
import { Injectable } from '@angular/core';

/**
 * Object-cache side effects. Timestamp reset after SSR rehydrate is done
 * explicitly in BrowserInitService so IndexedDB hydrate is not made to look fresh.
 */
@Injectable()
export class ObjectCacheEffects {
}
