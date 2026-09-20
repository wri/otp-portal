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

const clearNotificationsShown = (win) => win.localStorage.removeItem('notificationsShown');

// the count doubles as a check that the mocked payload was parsed into the store
const openFromUserMenu = (count) => {
  cy.get('div[role=button]').contains('My account').click();
  cy.contains('a', `Notifications (${count})`).click();
  return cy.get('.c-notifications', { timeout: 25000 }).should('exist');
};

const login = (data) => {
  cy.intercept('GET', '**/notifications*', { body: { data } }).as('getNotifications');
  cy.login('operator@example.com', 'Supersecret1');
  // The modal shows itself once per browser and stores that in localStorage. The login may
  // already have shown it, so the flag is cleared for this load. It is cleared in
  // onBeforeLoad so it is gone before the page boots and reads it: clearing it on an
  // already loaded page would race with that page storing it itself.
  cy.visit('/', { onBeforeLoad: clearNotificationsShown });
  cy.wait('@getNotifications');
};

describe('Notifications', function () {
  beforeEach(function () {
    login(NOTIFICATIONS);
  })

  it('opens once on the first visit, lists expired and expiring documents and links to the documentation', function () {
    cy.get('.c-notifications', { timeout: 25000 }).should('exist').within(() => {
      cy.contains('h3', 'AFRIWOOD INDUSTRIES has documents that have expired');
      cy.contains('p', 'Annual work plan');
      cy.contains('h3', 'AFRIWOOD INDUSTRIES has documents that are expiring soon');
      cy.contains('p', 'Tax clearance (Nkola)');

      cy.contains('button', 'Remind me later').click();
    });
    cy.get('.c-notifications').should('not.exist');

    // the flag is set by now, so the modal stays closed until it is asked for
    cy.visit('/');
    cy.wait('@getNotifications');
    cy.get('.c-notifications').should('not.exist');

    openFromUserMenu(2).contains('a', 'Update Now').click();
    cy.location('pathname', { timeout: 25000 }).should('include', '/documentation');
  })

  it('dismisses every notification', function () {
    cy.intercept('PUT', '**/notifications/*/dismiss', { statusCode: 200, body: {} }).as('dismiss');

    cy.get('.c-notifications', { timeout: 25000 }).should('exist')
      .contains('button', 'Dismiss All').click();

    // one PUT per notification, and the two waits match them in turn
    cy.wait('@dismiss');
    cy.wait('@dismiss');
    cy.get('.c-notifications').should('not.exist');
  })
});

describe('Notifications, with nothing to report', function () {
  beforeEach(function () {
    login([]);
  })

  it('does not open a modal on its own and says there is nothing when opened from the user menu', function () {
    cy.get('.c-notifications').should('not.exist');

    openFromUserMenu(0).within(() => {
      cy.contains('There are no new notifications.');
      cy.contains('button', 'Close').click();
    });
    cy.get('.c-notifications').should('not.exist');
  })
});
