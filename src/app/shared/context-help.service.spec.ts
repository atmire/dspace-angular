import { TestBed } from '@angular/core/testing';

import { ContextHelpService } from './context-help.service';
import { StoreModule, Store } from '@ngrx/store';
import { appReducers, storeModuleConfig } from '../app.reducer';
import { TestScheduler } from 'rxjs/testing';
import {of as observableOf } from 'rxjs';

describe('ContextHelpService', () => {
  let service: ContextHelpService;
  let store;
  let testScheduler;

  // mock the translateservice to just return the passed key
  let translateService = jasmine.createSpyObj('translateService', ['get']);
  translateService.get.and.callFake((arg) => observableOf(arg));

  const booleans = { f: false, t: true };
  const mkContextHelp = (id: string) => ({ 0: {id, isTooltipVisible: false, translationKey: id }, 1: {id, isTooltipVisible: true, translationKey: id}});

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(appReducers, storeModuleConfig)
      ]
    });
  });

  beforeEach(() => {
    store = TestBed.inject(Store);
    service = new ContextHelpService(store, translateService);
    testScheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('toggleIcons calls should be observable in shouldShowIcons$', () => {
    testScheduler.run(({cold, expectObservable}) => {
      const toggles = cold('-xxxxx');
      toggles.subscribe((_) => service.toggleIcons());
      expectObservable(service.shouldShowIcons$()).toBe('ftftft', booleans);
    });
  });

  it('add and remove calls should be observable in getContextHelp$', () => {
    testScheduler.run(({cold, expectObservable}) => {
      const modifications = cold('-abAcCB', {
        a: () => service.add({id: 'a', isTooltipVisible: false, translationKey: 'a'}),
        b: () => service.add({id: 'b', isTooltipVisible: false, translationKey: 'b'}),
        c: () => service.add({id: 'c', isTooltipVisible: false, translationKey: 'c'}),
        A: () => service.remove('a'), B: () => service.remove('b'), C: () => service.remove('c'),
      });
      modifications.subscribe(mod => mod());
      const match = (id) => ({ 0: undefined, 1: {id, isTooltipVisible: false, translationKey: id} });
      expectObservable(service.getContextHelp$('a')).toBe('01-0---', match('a'));
      expectObservable(service.getContextHelp$('b')).toBe('0-1---0', match('b'));
      expectObservable(service.getContextHelp$('c')).toBe('0---10-', match('c'));
    });
  });

  it('toggleTooltip calls should be observable in getContextHelp$', () => {
    service.add({id: 'a', isTooltipVisible: false, translationKey: 'a'});
    service.add({id: 'b', isTooltipVisible: false, translationKey: 'b'});
    testScheduler.run(({cold, expectObservable}) => {
      const toggles = cold('-aaababbabba');
      toggles.subscribe(id => service.toggleTooltip(id));
      expectObservable(service.getContextHelp$('a')).toBe('0101-0--1--0', mkContextHelp('a'));
      expectObservable(service.getContextHelp$('b')).toBe('0---1-01-01-', mkContextHelp('b'));
    });
  });

  it('hideTooltip and showTooltip calls should be observable in getContextHelp$', () => {
    service.add({id: 'a', isTooltipVisible: false, translationKey: 'a'});
    testScheduler.run(({cold, expectObservable}) => {
      const hideShowCalls = cold('-shssshhs', {
        s: () => service.showTooltip('a'), h: () => service.hideTooltip('a')
      });
      hideShowCalls.subscribe(fn => fn());
      expectObservable(service.getContextHelp$('a')).toBe('010111001', mkContextHelp('a'));
    });
  });
});
