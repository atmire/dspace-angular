import {
  AsyncPipe,
  isPlatformServer,
  Location,
} from '@angular/common';
import {
  Component,
  Inject,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Params,
  Router,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  combineLatest as observableCombineLatest,
  Observable,
  of as observableOf,
} from 'rxjs';
import {
  filter,
  map,
  switchMap,
  take,
} from 'rxjs/operators';
import { LinkService } from 'src/app/core/cache/builders/link.service';

import {
  getBitstreamRequestACopyRoute,
  getForbiddenRoute,
} from '../../app-routing-paths';
import { AuthService } from '../../core/auth/auth.service';
import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { ConfigurationDataService } from '../../core/data/configuration-data.service';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { RemoteData } from '../../core/data/remote-data';
import { SignpostingDataService } from '../../core/data/signposting-data.service';
import { SignpostingLink } from '../../core/data/signposting-links.model';
import { HardRedirectService } from '../../core/services/hard-redirect.service';
import { ServerResponseService } from '../../core/services/server-response.service';
import { redirectOn4xx } from '../../core/shared/authorized.operators';
import { Bitstream } from '../../core/shared/bitstream.model';
import { FileService } from '../../core/shared/file.service';
import {
  getFirstCompletedRemoteData,
  getRemoteDataPayload,
} from '../../core/shared/operators';
import {
  hasValue,
  isNotEmpty,
} from '../../shared/empty.util';
import { followLink } from '../../shared/utils/follow-link-config.model';
import { MatomoService } from '../../statistics/matomo.service';

@Component({
  selector: 'ds-bitstream-download-page',
  templateUrl: './bitstream-download-page.component.html',
  imports: [
    AsyncPipe,
    TranslateModule,
  ],
  standalone: true,
})
/**
 * Page component for downloading a bitstream
 */
export class BitstreamDownloadPageComponent implements OnInit {

  bitstream$: Observable<Bitstream>;
  bitstreamRD$: Observable<RemoteData<Bitstream>>;

  configService = inject(ConfigurationDataService);

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
    private matomoService: MatomoService,
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
    const accessToken$: Observable<string> = this.route.queryParams.pipe(
      map((queryParams: Params) => queryParams?.accessToken || null),
      take(1),
    );

    this.bitstreamRD$ = this.route.data.pipe(
      map((data) => data.bitstream));

    this.bitstream$ = this.bitstreamRD$.pipe(
      redirectOn4xx(this.router, this.auth),
      getRemoteDataPayload(),
    );

    this.bitstream$.pipe(
      switchMap((bitstream: Bitstream) => {
        if (!bitstream) {
          return observableOf([false, false, false, bitstream, ''] as const);
        }
        const canDownload$ = this.authorizationService.isAuthorized(
          FeatureID.CanDownload,
          bitstream.self,
        );

        const canRequestCopy$ = this.authorizationService.isAuthorized(
          FeatureID.CanRequestACopy,
          bitstream.self,
        );
        const isLoggedIn$ = this.auth.isAuthenticated();
        const isMatomoEnabled$ = this.matomoService.isMatomoEnabled$();

        return observableCombineLatest([
          canDownload$,
          canRequestCopy$,
          isLoggedIn$,
          isMatomoEnabled$,
          accessToken$,
          observableOf(bitstream)]);
      }),
      filter(([canDownload, canRequestCopy, isLoggedIn, isMatomoEnabled, accessToken, bitstream]: [boolean, boolean, boolean, boolean, string, Bitstream]) => {
        return (hasValue(canDownload) && hasValue(canRequestCopy) && hasValue(isLoggedIn)) || hasValue(accessToken);
      }),
      take(1),
      switchMap(([canDownload, canRequestCopy, isLoggedIn, isMatomoEnabled, accessToken, bitstream]: [boolean, boolean, boolean, boolean, string, Bitstream]) => {
        if (canDownload && isLoggedIn) {
          return this.fileService.retrieveFileDownloadLink(bitstream._links.content.href).pipe(
            filter((fileLink) => hasValue(fileLink)),
            take(1),
            map((fileLink) => {
              return [canDownload, canRequestCopy, isLoggedIn, isMatomoEnabled, bitstream, fileLink];
            }));
        } else if (hasValue(accessToken)) {
          return [[canDownload, canRequestCopy, !isLoggedIn, isMatomoEnabled, bitstream, '', accessToken]];
        } else {
          return [[canDownload, canRequestCopy, isLoggedIn, isMatomoEnabled, bitstream, bitstream._links.content.href]];
        }
      }),
      switchMap(([canDownload, canRequestCopy, isLoggedIn, isMatomoEnabled, bitstream, fileLink, accessToken]: [boolean, boolean, boolean, boolean, Bitstream, string, string]) => {
        if (isMatomoEnabled) {
          return this.matomoService.appendVisitorId(fileLink).pipe(
            map((fileLinkWithVisitorId) => [canDownload, canRequestCopy, isLoggedIn, bitstream, fileLinkWithVisitorId, accessToken]),
          );
        }
        return observableOf([canDownload, canRequestCopy, isLoggedIn, bitstream, fileLink, accessToken]);
      }),
    ).subscribe(([canDownload, canRequestCopy, isLoggedIn, bitstream, fileLink, accessToken]: [boolean, boolean, boolean, Bitstream, string, string]) => {
      if (canDownload && isLoggedIn && isNotEmpty(fileLink)) {
        this.hardRedirectService.redirect(fileLink);
      } else if (canDownload && !isLoggedIn && !hasValue(accessToken)) {
        this.hardRedirectService.redirect(fileLink);
      } else if (!canDownload) {
        // Either we have an access token, or we are logged in, or we are not logged in.
        // For now, the access token does not care if we are logged in or not.
        if (hasValue(accessToken)) {
          this.hardRedirectService.redirect(bitstream._links.content.href + '?accessToken=' + accessToken);
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
        } else if (isLoggedIn && !canRequestCopy) {
          this.router.navigateByUrl(getForbiddenRoute(), { skipLocationChange: true });
        } else if (!isLoggedIn) {
          this.auth.setRedirectUrl(this.router.url);
          this.router.navigateByUrl('login', { replaceUrl: true });
        }
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
