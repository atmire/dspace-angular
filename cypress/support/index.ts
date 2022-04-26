// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// When a command from ./commands is ready to use, import with `import './commands'` syntax
// import './commands';

// Import Cypress Axe tools for all tests
// https://github.com/component-driven/cypress-axe
import 'cypress-axe';

// Runs once before the first test in each "block"
beforeEach(() => {
    // Pre-agree to all Klaro cookies by setting the klaro-anonymous cookie
    // This just ensures it doesn't get in the way of matching other objects in the page.
    cy.setCookie('klaro-anonymous', '{%22authentication%22:true%2C%22preferences%22:true%2C%22acknowledgement%22:true%2C%22google-analytics%22:true}');
});

// For better stability between tests, we visit "about:blank" (i.e. blank page) after each test.
// This ensures any remaining/outstanding XHR requests are killed, so they don't affect the next test.
// Borrowed from: https://glebbahmutov.com/blog/visit-blank-page-between-tests/
afterEach(() => {
    cy.window().then((win) => {
      win.location.href = 'about:blank';
    });
});

// Global constants used in tests
export const TEST_COLLECTION = '282164f5-d325-4740-8dd1-fa4d6d3e7200';
export const TEST_COMMUNITY = '0958c910-2037-42a9-81c7-dca80e3892b4';
export const TEST_ENTITY_PUBLICATION = 'e98b0f27-5c19-49a0-960d-eb6ad5287067';
