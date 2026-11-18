import 'cypress-file-upload';
import '@frsource/cypress-plugin-visual-regression-diff';
import './commands/operator';
import './commands/map';

// External tiles are always blocked. With { loadMap: true } the map still loads: the Mapbox style
// comes from a fixture and the FMU tiles come from the e2e API's seed data.
Cypress.Commands.add('interceptMapRequests', ({ loadMap = false } = {}) => {
  cy.intercept({ hostname: 'earthengine.google.org' }, { statusCode: 404 });
  cy.intercept({ hostname: 'storage.googleapis.com' }, { statusCode: 404 });
  cy.intercept({ hostname: 'a.gusc.cartocdn.com' }, { statusCode: 404 });
  cy.intercept({ hostname: 'tiles.globalforestwatch.org' }, { statusCode: 404 });
  cy.intercept({ hostname: 'events.mapbox.com' }, { statusCode: 204 });
  cy.intercept({ hostname: 'api.mapbox.com' }, { statusCode: 404 });

  if (loadMap) {
    cy.intercept({ hostname: 'api.mapbox.com', pathname: '/styles/v1/mapbox/light-v9' }, { fixture: 'map-style.json' });
    // empty glyphs and basemap tiles parse as "nothing to draw"
    cy.intercept({ hostname: 'api.mapbox.com', pathname: /^\/(fonts|e2e-tiles)\// }, { statusCode: 200, body: '' });
    // wins over the 404 an earlier interceptMapRequests() in the same test set up
    cy.intercept({ hostname: 'localhost', port: 3000, pathname: /^\/fmus\/tiles\// }, (req) => req.continue());
  } else {
    cy.intercept({ hostname: 'localhost', port: 3000, url: '/fmus/tiles/*' }, { statusCode: 404 });
  }
});

Cypress.Commands.add('login', (username, password) => {
  cy.session(
    [username, password],
    () => {
      cy.visit('/');
      cy.get('div[role=button]').contains('Sign in').click();
      cy.get('#input-email').type(username);
      cy.get('#input-password').type(password);
      cy.get('button').contains('Log in').click();
      cy.get('div[role=button]').contains('My account').should('exist');
    },
    {
      cacheAcrossSpecs: true
    }
  );
  cy.visit('/');
});

Cypress.Commands.add('selectOption', (selector, text, option) => {
  if (text) {
    cy
      .get(selector)
      .parents('.react-select-container').first()
      .find('.react-select__control input').first().click({ force: true }).type(text, { force: true })
  } else {
    cy
      .get(selector)
      .parents('.react-select-container').first()
      .find('.react-select__control input').first().click({ force: true })
  }

  cy.get(selector)
    .parents('.react-select-container').first()
    .find('.react-select__menu').contains(option).click();
});

Cypress.Commands.add('resetDB', () => {
  const apiPath = Cypress.env('API_PATH') || '../../otp-api';
  const fastReset = `${apiPath}/bin/e2e-db-reset`;
  // The rake task is ~2s slower because every rake entry point loads the whole
  // Rails app first. Fall back to it while the API repo is missing the script.
  cy.exec(
    `if [ -f ${fastReset} ]; then sh ${fastReset}; else cd ${apiPath}; RAILS_ENV=e2e bin/rails e2e:db_reset; fi`
  );
});
