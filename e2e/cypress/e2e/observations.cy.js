describe('Observations page', function () {
  beforeEach(function () {
    cy.interceptMapRequests(); // keep if we won't test the map
    cy.visit('/observations');
  })

  it('displays the page', function () {
    cy.contains('Overview by category');
    cy.contains('Observations List');

    // it display observations
    cy.get('.rt-tbody').find('.rt-tr-group', {timeout: 10000}).should('have.length.greaterThan', 1);
  })

  describe('table columns', function () {
    it('adds and removes a column', function () {
      cy.get('.rt-thead').contains('Evidence').should('not.exist');

      cy.get('.c-field').contains('label', 'Evidence').click();
      cy.get('.rt-thead').contains('Evidence');

      cy.get('.c-field').contains('label', 'Evidence').click();
      cy.get('.rt-thead').contains('Evidence').should('not.exist');
    })

    it('opens the location of an observation', function () {
      cy.get('.c-field').contains('label', 'Location').click();

      cy.get('.rt-td.location button').first().click();
      cy.get('.c-map-sub-component').should('exist');
    })
  });

  describe('map view', function () {
    it('switches between the list and the map', function () {
      cy.contains('.tabs-btn', 'Map View').click();

      cy.get('.c-map-container').should('exist');
      cy.get('.rt-tbody').should('not.exist');

      cy.contains('.tabs-btn', 'Observations List').click();
      cy.get('.rt-tbody').should('exist');
    })
  });

  describe('filters', function () {
    it('can filter by producer', function () {
      cy.selectOption('#react-select-operator-input', 'AFRIWOOD', 'AFRIWOOD INDUSTRIES')
      cy.get('.rt-tbody').find('.rt-tr-group').should('have.length.greaterThan', 1);
    })
  })
});
