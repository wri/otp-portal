import 'cypress-file-upload';
import './commands/operator';

Cypress.Commands.add('interceptMapRequests', () => {
  cy.intercept({ hostname: 'earthengine.google.org' }, { statusCode: 404 });
  cy.intercept({ hostname: 'localhost', port: 3000, url: '/fmus/tiles/*' }, { statusCode: 404 });
  cy.intercept({ hostname: 'storage.googleapis.com' }, { statusCode: 404 });
  cy.intercept({ hostname: 'a.gusc.cartocdn.com' }, { statusCode: 404 });
  cy.intercept({ hostname: 'api.mapbox.com' }, { statusCode: 404 });
});

Cypress.Commands.add('login', (username, password) => {
  cy.get('a').contains('Sign in').click();
  cy.get('#input-email').type(username);
  cy.get('#input-password').type(password);
  cy.get('button').contains('Log in').click();
  cy.get(':nth-child(2) > :nth-child(2) > .dropdown > .dropdown__trigger > .header-nav-list-item > span').should('have.text', 'My account');
});

Cypress.Commands.add('selectOption', (selector, text, option) => {
  if (text) {
    cy
      .get(selector)
      .parents('.Select-control').first()
      .find('input').first().click({ force: true }).type(text, { force: true })
  } else {
    cy
      .get(selector)
      .parents('.Select-control').first()
      .find('input').first().click({ force: true })
  }

  cy.get(selector)
    .parents('.Select').first()
    .find('.Select-menu').contains(option).click();
});
