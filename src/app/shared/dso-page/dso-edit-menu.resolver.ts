import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { combineLatest, Observable, of, of as observableOf } from 'rxjs';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { MenuService } from '../menu/menu.service';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { Injectable } from '@angular/core';
import { LinkMenuItemModel } from '../menu/menu-item/models/link.model';
import { Item } from '../../core/shared/item.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OnClickMenuItemModel } from '../menu/menu-item/models/onclick.model';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { map, switchMap } from 'rxjs/operators';
import { DSpaceObjectDataService } from '../../core/data/dspace-object-data.service';
import { URLCombiner } from '../../core/url-combiner/url-combiner';
import { DsoVersioningModalService } from './dso-versioning-modal-service/dso-versioning-modal.service';
import { hasValue } from '../empty.util';
import { MenuID } from '../menu/menu-id.model';
import { MenuItemType } from '../menu/menu-item-type.model';
import { MenuSection } from '../menu/menu-section.model';
import { TextMenuItemModel } from '../menu/menu-item/models/text.model';

/**
 * Creates the menus for the dspace object pages
 */
@Injectable({
  providedIn: 'root'
})
export class DSOEditMenuResolver implements Resolve<{ [key: string]: MenuSection[] }> {

  constructor(
    protected dSpaceObjectDataService: DSpaceObjectDataService,
    protected menuService: MenuService,
    protected authorizationService: AuthorizationDataService,
    protected modalService: NgbModal,
    protected dsoVersioningModalService: DsoVersioningModalService,
  ) {
  }

  /**
   * Initialise all dspace object related menus
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ [key: string]: MenuSection[] }> {
    const uuid = route.params.id;
    return this.dSpaceObjectDataService.findById(uuid, true, false).pipe(
      getFirstCompletedRemoteData(),
      switchMap((dsoRD) => {
        if (dsoRD.hasSucceeded) {
          const dso = dsoRD.payload;
          return combineLatest(this.getDsoMenus(dso, route, state)).pipe(
            // Menu sections are retrieved as an array of arrays and flattened into a single array
            map((combinedMenus) => [].concat.apply([], combinedMenus)),
            map((menus) => this.addDsoUuidToMenuIDs(menus, dso)),
            map((menus) => {
              return {
                ...route.data?.menu,
                [MenuID.DSO_EDIT]: menus
              };
            })
          );
        } else {
          return observableOf({...route.data?.menu});
        }
      })
    );
  }

  /**
   * Return all the menus for a dso based on the route and state
   */
  getDsoMenus(dso, route, state): Observable<MenuSection[]>[] {
    return [
      this.getItemMenu(dso),
      this.getCommonMenu(dso, state),
      this.getTestMenus(),
    ];
  }

  getTestMenus() {
    return of([
      // Just a button
      {
        id: 'test1',
        active: false,
        visible: true,
        model: {
          type: MenuItemType.LINK,
          text: 'Go home',
          link: '/home',
        } as LinkMenuItemModel,
        icon: 'home',
        index: 2,
      },

      // Dropdown menu where some entries have icons
      {
        id: 'test2-sub1',
        parentID: 'test2',
        active: false,
        visible: true,
        model: {
          type: MenuItemType.LINK,
          text: 'Go home from this dropdown',
          link: '/home',
        } as LinkMenuItemModel,
        icon: 'home',
        index: 1,
      },
      {
        id: 'test2-sub2',
        parentID: 'test2',
        active: false,
        visible: true,
        model: {
          type: MenuItemType.LINK,
          text: 'Go home from this dropdown, but without an icon',
          link: '/home',
        } as LinkMenuItemModel,
        index: 2,
      },
      {
        id: 'test2-sub3',
        parentID: 'test2',
        active: false,
        visible: true,
        model: {
          type: MenuItemType.LINK,
          text: 'Go home from this dropdown, but with a different icon now',
          link: '/home',
        } as LinkMenuItemModel,
        icon: 'tree',
        index: 3,
      },
      {
        id: 'test2',
        active: false,
        visible: true,
        model: {
          type: MenuItemType.TEXT,
          text: 'Go home dropdown'
        } as TextMenuItemModel,
        icon: 'arrow-down',
        index: 3,
      },

      // Drodown menu where none of the entries have icons
      {
        id: 'test3-sub1',
        parentID: 'test3',
        active: false,
        visible: true,
        model: {
          type: MenuItemType.LINK,
          text: 'Go home from this dropdown, no icon here either',
          link: '/home',
        } as LinkMenuItemModel,
        index: 1,
      },
      {
        id: 'test3-sub2',
        parentID: 'test3',
        active: false,
        visible: true,
        model: {
          type: MenuItemType.LINK,
          text: 'Go home from this dropdown, still no icon',
          link: '/home',
        } as LinkMenuItemModel,
        index: 2,
      },
      {
        id: 'test3',
        active: false,
        visible: true,
        model: {
          type: MenuItemType.TEXT,
          text: 'Go home dropdown, again'
        } as TextMenuItemModel,
        icon: 'bars',
        index: 4,
      }
    ]);
  }

  /**
   * Get the common menus between all dspace objects
   */
  protected getCommonMenu(dso, state): Observable<MenuSection[]> {
    return combineLatest([
      this.authorizationService.isAuthorized(FeatureID.CanEditMetadata, dso.self),
    ]).pipe(
      map(([canEditItem]) => {
        return [
          {
            id: 'edit-dso',
            active: false,
            visible: canEditItem,
            model: {
              type: MenuItemType.LINK,
              text: this.getDsoType(dso) + '.page.edit',
              link: new URLCombiner(state.url, 'edit', 'metadata').toString()
            } as LinkMenuItemModel,
            icon: 'pencil-alt',
            index: 1
          },
        ];
      })
    );
  }

  /**
   * Get item sepcific menus
   */
  protected getItemMenu(dso): Observable<MenuSection[]> {
    if (dso instanceof Item) {
      return combineLatest([
        this.authorizationService.isAuthorized(FeatureID.CanCreateVersion, dso.self),
        this.dsoVersioningModalService.isNewVersionButtonDisabled(dso),
        this.dsoVersioningModalService.getVersioningTooltipMessage(dso, 'item.page.version.hasDraft', 'item.page.version.create')
      ]).pipe(
        map(([canCreateVersion, disableVersioning, versionTooltip]) => {
          return [
            {
              id: 'version-dso',
              active: false,
              visible: canCreateVersion,
              model: {
                type: MenuItemType.ONCLICK,
                text: versionTooltip,
                disabled: disableVersioning,
                function: () => {
                  this.dsoVersioningModalService.openCreateVersionModal(dso);
                }
              } as OnClickMenuItemModel,
              icon: 'code-branch',
              index: 0
            },
          ];
        }),
      );
    } else {
      return observableOf([]);
    }
  }

  /**
   * Retrieve the dso or entity type for an object to be used in generic messages
   */
  protected getDsoType(dso) {
    const renderType = dso.getRenderTypes()[0];
    if (typeof renderType === 'string' || renderType instanceof String) {
      return renderType.toLowerCase();
    } else {
      return dso.type.toString().toLowerCase();
    }
  }

  /**
   * Add the dso uuid to all provided menu ids and parent ids
   */
  protected addDsoUuidToMenuIDs(menus, dso) {
    return menus.map((menu) => {
      Object.assign(menu, {
        id: menu.id + '-' + dso.uuid
      });
      if (hasValue(menu.parentID)) {
        Object.assign(menu, {
          parentID: menu.parentID + '-' + dso.uuid
        });
      }
      return menu;
    });
  }
}
