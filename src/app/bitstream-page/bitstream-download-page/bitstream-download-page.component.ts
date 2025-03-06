import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { hasValue, isNotEmpty} from '../../shared/empty.util';
import { getAllCompletedRemoteData, getAllSucceededRemoteData, getFirstCompletedRemoteData, getRemoteDataPayload } from '../../core/shared/operators';
import { Bitstream } from '../../core/shared/bitstream.model';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { AuthService } from '../../core/auth/auth.service';
import { combineLatest as observableCombineLatest, Observable, of as observableOf } from 'rxjs';
import { FileService } from '../../core/shared/file.service';
import { HardRedirectService } from '../../core/services/hard-redirect.service';
import {getBitstreamRequestACopyRoute, getForbiddenRoute} from '../../app-routing-paths';
import { RemoteData } from '../../core/data/remote-data';
import { redirectOn4xx } from '../../core/shared/authorized.operators';
import { isPlatformServer, Location } from '@angular/common';
import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { SignpostingDataService } from '../../core/data/signposting-data.service';
import { ServerResponseService } from '../../core/services/server-response.service';
import { SignpostingLink } from '../../core/data/signposting-links.model';
import {BundleDataService} from '../../core/data/bundle-data.service';
import { followLink } from '../../shared/utils/follow-link-config.model';
import { LinkService } from 'src/app/core/cache/builders/link.service';
import { hasSucceeded } from '../../core/data/request-entry-state.model';

@Component({
  selector: 'ds-bitstream-download-page',
  templateUrl: './bitstream-download-page.component.html'
})
/**
 * Page component for downloading a bitstream
 */
export class BitstreamDownloadPageComponent implements OnInit {

  bitstream$: Observable<Bitstream>;
  bitstreamRD$: Observable<RemoteData<Bitstream>>;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private authorizationService: AuthorizationDataService,
    private auth: AuthService,
    private fileService: FileService,
    private hardRedirectService: HardRedirectService,
    private location: Location,
    public dsoNameService: DSONameService,
    private signpostingDataService: SignpostingDataService,
    private responseService: ServerResponseService,
    private bundleService: BundleDataService,
    @Inject(PLATFORM_ID) protected platformId: string,
    protected linkService: LinkService,
  ) {
    this.initPageLinks();
  }

  back(): void {
    const previousPath = this.location.path();

    const sub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const finalUrl = event.urlAfterRedirects;

        if (finalUrl === previousPath) {
          this.location.back();
        } else {
          sub.unsubscribe();
        }
      });

    this.location.back();
  }




  ngOnInit(): void {

    this.bitstreamRD$ = this.route.data.pipe(
      map((data) => data.bitstream)
    );

    this.bitstream$ = this.bitstreamRD$.pipe(
      redirectOn4xx(this.router, this.auth),
      getRemoteDataPayload()
    );

    this.bitstream$.pipe(
      switchMap((bitstream: Bitstream) => {
        if (!bitstream) {
          return observableOf([false, false, false, bitstream, ''] as const);
        }
        const canDownload$ = this.authorizationService.isAuthorized(
          FeatureID.CanDownload,
          bitstream.self
        );

        const canRequestCopy$ = this.authorizationService.isAuthorized(
          FeatureID.CanRequestACopy,
          bitstream.self
        );
        const isLoggedIn$ = this.auth.isAuthenticated();

        return observableCombineLatest([
          canDownload$,
          canRequestCopy$,
          isLoggedIn$,
          observableOf(bitstream)
        ]);
      }),
      filter(([canDownload, canRequestCopy, isLoggedIn, bitstream]) => {
        return hasValue(canDownload) && hasValue(canRequestCopy) && hasValue(isLoggedIn);
      }),
      take(1),
      switchMap(([canDownload, canRequestCopy, isLoggedIn, bitstream]) => {
        if (canDownload && isLoggedIn) {
          // retrieve the actual download link
          return this.fileService.retrieveFileDownloadLink(bitstream._links.content.href).pipe(
            filter((fileLink) => hasValue(fileLink)),
            take(1),
            map((fileLink) =>
              [canDownload, canRequestCopy, isLoggedIn, bitstream, fileLink] as const
            )
          );
        } else {
          // no need for fileLink if you cannot download
          return observableOf([canDownload, canRequestCopy, isLoggedIn, bitstream, ''] as const);
        }
      })
    ).subscribe(([canDownload, canRequestCopy, isLoggedIn, bitstream, fileLink]) => {

      if (canDownload && isLoggedIn && isNotEmpty(fileLink)) {
        this.hardRedirectService.redirect(fileLink);
      } else if (canDownload && !isLoggedIn) {
        this.hardRedirectService.redirect(bitstream._links.content.href);
      } else if (!canDownload && canRequestCopy) {
        // resolve the Item from the Bitstream (should only send requests if it wasn't embedded previously)
        this.linkService.resolveLink(bitstream, followLink('bundle', {}, followLink('item')));
        bitstream.bundle.pipe(
          getFirstCompletedRemoteData(),
          switchMap(bundleRD => bundleRD?.payload?.item),
          getFirstCompletedRemoteData(),
          map(itemRD => {
            if (itemRD.hasSucceeded && hasValue(itemRD?.payload)) {
              return getBitstreamRequestACopyRoute(itemRD.payload, bitstream);
            } else {
              return null;
            }
          }),
        ).subscribe(routeObj => {  // todo: nested subscribe should be avoided, but there is no easy way around it here
          if (hasValue(routeObj)) {
            this.router.navigate([routeObj.routerLink], { queryParams: routeObj.queryParams, replaceUrl: true });
          } else {
            this.router.navigateByUrl(getForbiddenRoute(), { skipLocationChange: true });
          }
        });
      } else if (!canDownload && isLoggedIn && !canRequestCopy) {
        this.router.navigateByUrl(getForbiddenRoute(), { skipLocationChange: true });
      } else if (!isLoggedIn) {
        this.auth.setRedirectUrl(this.router.url);
        this.router.navigateByUrl('login', { replaceUrl: true });
      }
    });
  }

  /**
   * Create page links if any are retrieved by signposting endpoint
   *
   * @private
   */
  private initPageLinks(): void {
    if (isPlatformServer(this.platformId)) {
      this.route.params.subscribe(params => {
        this.signpostingDataService.getLinks(params.id).pipe(take(1)).subscribe((signpostingLinks: SignpostingLink[]) => {
          let links = '';

          signpostingLinks.forEach((link: SignpostingLink) => {
            links = links + (isNotEmpty(links) ? ', ' : '') + `<${link.href}> ; rel="${link.rel}"` + (isNotEmpty(link.type) ? ` ; type="${link.type}" ` : ' ');
          });

          this.responseService.setHeader('Link', links);
        });
      });
    }
  }
}
