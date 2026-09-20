// The seed database has no notifications, so the api response is mocked here
const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const notification = (id, attributes) => ({
  id,
  type: 'notifications',
  attributes: {
    'operator-id': 1,
    'operator-name': 'AFRIWOOD INDUSTRIES',
    'operator-document-id': id,
    'fmu-name': null,
    ...attributes
  }
});

const NOTIFICATIONS = [
  notification('1', { 'operator-document-name': 'Annual work plan', 'expiration-date': daysFromNow(-10) }),
  notification('2', { 'operator-document-name': 'Tax clearance', 'fmu-name': 'Nkola', 'expiration-date': daysFromNow(10) })
];

describe('Notifications', function () {
  beforeEach(function () {
    cy.intercept('GET', '**/notifications*', { body: { data: NOTIFICATIONS } }).as('getNotifications');
    cy.login('operator@example.com', 'Supersecret1');
    // the modal is shown once per browser, and cy.session restores what the login stored
    cy.clearLocalStorage();
    cy.visit('/');
    cy.wait('@getNotifications');
  })

  it('opens a modal listing expired and expiring documents', function () {
    cy.get('.c-notifications').within(() => {
      cy.contains('h3', 'AFRIWOOD INDUSTRIES has documents that have expired');
      cy.contains('p', 'Annual work plan');
      cy.contains('h3', 'AFRIWOOD INDUSTRIES has documents that are expiring soon');
      cy.contains('p', 'Tax clearance (Nkola)');
    });
  })

  it('closes with remind me later and does not reopen', function () {
    cy.get('.c-notifications').contains('button', 'Remind me later').click();
    cy.get('.c-notifications').should('not.exist');

    cy.visit('/');
    cy.get('.c-notifications').should('not.exist');
  })

  it('dismisses every notification', function () {
    cy.intercept('PUT', '**/notifications/*/dismiss', { statusCode: 200, body: {} }).as('dismiss');

    cy.get('.c-notifications').contains('button', 'Dismiss All').click();

    cy.wait('@dismiss');
    cy.wait('@dismiss');
    cy.get('.c-notifications').should('not.exist');
  })

  it('links to the producer documentation', function () {
    cy.get('.c-notifications').contains('a', 'Update Now').click();

    cy.location('pathname', { timeout: 25000 }).should('include', '/documentation');
  })

  it('opens from the user menu and counts the documents', function () {
    cy.get('.c-notifications').contains('button', 'Remind me later').click();

    cy.get('div[role=button]').contains('My account').click();
    cy.contains('a', 'Notifications (2)').click();

    cy.get('.c-notifications').contains('p', 'Annual work plan');
  })
});

describe('Notifications, with nothing to report', function () {
  beforeEach(function () {
    cy.intercept('GET', '**/notifications*', { body: { data: [] } }).as('getNotifications');
    cy.login('operator@example.com', 'Supersecret1');
    cy.clearLocalStorage();
    cy.visit('/');
    cy.wait('@getNotifications');
  })

  it('does not open a modal on its own', function () {
    cy.get('.c-notifications').should('not.exist');
  })

  it('says there is nothing when opened from the user menu', function () {
    cy.get('div[role=button]').contains('My account').click();
    cy.contains('a', 'Notifications (0)').click();

    cy.get('.c-notifications').within(() => {
      cy.contains('There are no new notifications.');
      cy.contains('button', 'Close').click();
    });
    cy.get('.c-notifications').should('not.exist');
  })
});
