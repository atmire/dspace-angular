import { isPlatformServer } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import {
  NotifyInfoService,
  LinkTagDefinition,
  LinkHeadService,
  ServerResponseService,
} from '@dspace/core'
import { isNotEmpty } from '@dspace/utils';
import { of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'ds-home-coar',
  template: '',
  standalone: true,
})
export class HomeCoarComponent implements OnInit, OnDestroy {

  /**
   * An array of LinkDefinition objects representing inbox links for the home page.
   */
  inboxLinks: LinkTagDefinition[] = [];

  subs: Subscription[] = [];

  constructor(
    protected linkHeadService: LinkHeadService,
    protected notifyInfoService: NotifyInfoService,
    protected responseService: ServerResponseService,
    @Inject(PLATFORM_ID) protected platformId: string,
  ) {
  }

  ngOnInit(): void {
    // Get COAR REST API URLs from REST configuration
    // only if COAR configuration is enabled
    this.subs.push(this.notifyInfoService.isCoarConfigEnabled().pipe(
      switchMap((coarLdnEnabled: boolean) => coarLdnEnabled ? this.notifyInfoService.getCoarLdnLocalInboxUrls() : of([])),
    ).subscribe((coarRestApiUrls: string[]) => {
      if (coarRestApiUrls.length > 0) {
        this.initPageLinks(coarRestApiUrls);
      }
    }));
  }

  /**
   * It removes the inbox links from the head of the html.
   */
  ngOnDestroy(): void {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe());
    this.inboxLinks.forEach((link: LinkTagDefinition) => {
      this.linkHeadService.removeTag(`href='${link.href}'`);
    });
  }

  /**
   * Initializes page links for COAR REST API URLs.
   * @param coarRestApiUrls An array of COAR REST API URLs.
   */
  private initPageLinks(coarRestApiUrls: string[]): void {
    const rel = this.notifyInfoService.getInboxRelationLink();
    let links = '';
    coarRestApiUrls.forEach((coarRestApiUrl: string) => {
      // Add link to head
      const tag: LinkTagDefinition = {
        href: coarRestApiUrl,
        rel: rel,
      };
      this.inboxLinks.push(tag);
      this.linkHeadService.addTag(tag);

      links = links + (isNotEmpty(links) ? ', ' : '') + `<${coarRestApiUrl}> ; rel="${rel}"`;
    });

    if (isPlatformServer(this.platformId)) {
      // Add link to response header
      this.responseService.setHeader('Link', links);
    }
  }

}
