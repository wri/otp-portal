import 'cypress-file-upload';
import '@frsource/cypress-plugin-visual-regression-diff';
import './commands/operator';

Cypress.Commands.add('interceptMapRequests', () => {
  cy.intercept({ hostname: 'earthengine.google.org' }, { statusCode: 404 });
  cy.intercept({ hostname: 'localhost', port: 3000, url: '/fmus/tiles/*' }, { statusCode: 404 });
  cy.intercept({ hostname: 'storage.googleapis.com' }, { statusCode: 404 });
  cy.intercept({ hostname: 'a.gusc.cartocdn.com' }, { statusCode: 404 });
  cy.intercept({ hostname: 'api.mapbox.com' }, { statusCode: 404 });
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
  cy.exec(`cd ${apiPath}; RAILS_ENV=e2e bin/rails e2e:db_reset`);
});
