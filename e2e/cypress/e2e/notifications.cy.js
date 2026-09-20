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

const setNotificationsShown = (win) => win.localStorage.setItem('notificationsShown', 'true');
const clearNotificationsShown = (win) => win.localStorage.removeItem('notificationsShown');

// the count doubles as a check that the mocked payload was parsed into the store
const openFromUserMenu = (count) => {
  cy.get('div[role=button]').contains('My account').click();
  cy.contains('a', `Notifications (${count})`).click();
  return cy.get('.c-notifications', { timeout: 25000 }).should('exist');
};

describe('Notifications', function () {
  beforeEach(function () {
    cy.intercept('GET', '**/notifications*', { body: { data: NOTIFICATIONS } }).as('getNotifications');
    cy.login('operator@example.com', 'Supersecret1');
    // The modal shows itself once per browser and stores that in localStorage. The flag is
    // set in onBeforeLoad, so it is in place before the page boots and reads it: setting it
    // on an already loaded page would race with that page storing it itself.
    cy.visit('/', { onBeforeLoad: setNotificationsShown });
    cy.wait('@getNotifications');
  })

  it('lists expired and expiring documents', function () {
    openFromUserMenu(2).within(() => {
      cy.contains('h3', 'AFRIWOOD INDUSTRIES has documents that have expired');
      cy.contains('p', 'Annual work plan');
      cy.contains('h3', 'AFRIWOOD INDUSTRIES has documents that are expiring soon');
      cy.contains('p', 'Tax clearance (Nkola)');
    });
  })

  it('closes with remind me later', function () {
    openFromUserMenu(2).contains('button', 'Remind me later').click();

    cy.get('.c-notifications').should('not.exist');
  })

  it('dismisses every notification', function () {
    cy.intercept('PUT', '**/notifications/*/dismiss', { statusCode: 200, body: {} }).as('dismiss');

    openFromUserMenu(2).contains('button', 'Dismiss All').click();

    cy.wait('@dismiss');
    cy.wait('@dismiss');
    cy.get('.c-notifications').should('not.exist');
  })

  it('links to the producer documentation', function () {
    openFromUserMenu(2).contains('a', 'Update Now').click();

    cy.location('pathname', { timeout: 25000 }).should('include', '/documentation');
  })
});

describe('Notifications, on the first visit', function () {
  beforeEach(function () {
    cy.intercept('GET', '**/notifications*', { body: { data: NOTIFICATIONS } }).as('getNotifications');
    cy.login('operator@example.com', 'Supersecret1');
    // the login may already have shown the modal, so the flag is cleared for this load
    cy.visit('/', { onBeforeLoad: clearNotificationsShown });
    cy.wait('@getNotifications');
  })

  it('shows the modal once, then leaves it closed', function () {
    cy.get('.c-notifications', { timeout: 25000 }).should('exist')
      .contains('button', 'Remind me later').click();
    cy.get('.c-notifications').should('not.exist');

    cy.visit('/');
    cy.wait('@getNotifications');
    cy.get('.c-notifications').should('not.exist');
  })
});

describe('Notifications, with nothing to report', function () {
  beforeEach(function () {
    cy.intercept('GET', '**/notifications*', { body: { data: [] } }).as('getNotifications');
    cy.login('operator@example.com', 'Supersecret1');
    cy.visit('/', { onBeforeLoad: clearNotificationsShown });
    cy.wait('@getNotifications');
  })

  it('does not open a modal on its own', function () {
    cy.get('.c-notifications').should('not.exist');
  })

  it('says there is nothing when opened from the user menu', function () {
    openFromUserMenu(0).within(() => {
      cy.contains('There are no new notifications.');
      cy.contains('button', 'Close').click();
    });
    cy.get('.c-notifications').should('not.exist');
  })
});
