import {browser, by, element, ElementFinder, protractor} from 'protractor';
import { promise } from 'selenium-webdriver';

export class ProtractorPage {
  COMMUNITYLIST = '/community-list';

  navigateToCommunityList() {
    return browser.get(this.COMMUNITYLIST);
  }

  getRandomCommunity() {
    return element(by.xpath('//ds-community-list//cdk-tree-node'));
  }

  getRandomCommunityWithChildren() {
    return element(by.xpath('//ds-community-list//cdk-tree-node[div/button[contains(@class,\'visible\') and not(contains(@class,\'invisible\'))]]'));
  }

  countNodes() {
    return element.all(by.xpath('//ds-community-list//cdk-tree-node')).count();
  }

  getRandomCommunityWithoutChildren() {
    return element(by.xpath('//ds-community-list//cdk-tree-node[div/button[contains(@class,\'invisible\')]]'));
  }

  clickButtonForCommunity(community: ElementFinder) {
    return community.element(by.xpath('div/button')).click();

  }

  waitUntilNotLoading(): promise.Promise<unknown> {
    const loading = element(by.css('.loader'));
    const EC = protractor.ExpectedConditions;
    const notLoading = EC.not(EC.presenceOf(loading));
    return browser.wait(notLoading, 10000);
  }
}
