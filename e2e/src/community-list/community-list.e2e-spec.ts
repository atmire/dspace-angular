import { ProtractorPage } from './community-list.po';
import {browser, by} from 'protractor';

describe('protractor SearchPage', () => {
  let page: ProtractorPage;

  beforeEach(() => {
    page = new ProtractorPage();
  });

  it('should have a community', () => {
    page.navigateToCommunityList();
    page.waitUntilNotLoading();
    browser.sleep(1000);
    const url = page.getRandomCommunity().element(by.tagName('a')).getAttribute('href');
    expect<any>(url).toContain('/communities/');
  });

  it('should have a community with children', () => {
    page.navigateToCommunityList();
    page.waitUntilNotLoading();
    browser.sleep(1000);
    const community = page.getRandomCommunityWithChildren();
    expect<any>(community).toBeDefined();
    const url = community.element(by.tagName('a')).getAttribute('href');
    expect<any>(url).toContain('/communities/');
  });

  // it('should not have a community without children', () => {
  //   page.navigateToCommunityList();
  //   page.waitUntilNotLoading();
  //   const community = page.getRandomCommunityWithoutChildren();
  //   expect<any>(community).not.toContain('/communities/');
  //   expect<any>(community).not.toBeDefined();
  // });

  it('should have a community without children', () => {
    page.navigateToCommunityList();
    page.waitUntilNotLoading();
    browser.sleep(100);
    const community = page.getRandomCommunityWithoutChildren();
    expect<any>(community).toBeDefined();
    const url = community.element(by.tagName('a')).getAttribute('href');
    expect<any>(url).toContain('/communities/');
  });

  it('should be able to open community with children', () => {
    page.navigateToCommunityList();
    page.waitUntilNotLoading();
    browser.sleep(1000);
    const community = page.getRandomCommunityWithChildren();
    expect<any>(community).toBeDefined();
    const nodes = page.countNodes();
    // amount should increase when clicking the button
    page.waitUntilNotLoading()
      .then(() => page.countNodes() )
      .then((count: number) => {
        page.clickButtonForCommunity(community)
        const nodes2 = page.countNodes();
        return expect<any>(nodes2).toBeGreaterThan(count);
      });
    // amount should decrease when clicking the same button
    page.waitUntilNotLoading()
      .then(() => page.countNodes() )
      .then((count: number) => {
        page.clickButtonForCommunity(community)
        const nodes2 = page.countNodes();
        return expect<any>(nodes2).toBeLessThan(count);
      });
    // amount should be identical to initial amount
    page.waitUntilNotLoading()
      .then(() => page.countNodes() )
      .then((count: number) => {
        return expect<any>(nodes).toBe(count);
      });
  });

  it('test page contents', () => {
    page.navigateToCommunityList();
    page.waitUntilNotLoading();
    const text = page.elementTags('div').getText();
    expect<any>(text).toContain('THIS IS NOT PRESENT, SO THE TEST WILL FAIL');
  });

  it('test URI contents', () => {
    page.navigateToCommunityList();
    page.waitUntilNotLoading();
    const text = page.elementTags('a').getAttribute('href');
    expect<any>(text).toContain('THIS IS NOT PRESENT, SO THE TEST WILL FAIL');
  });

});
