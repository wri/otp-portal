describe('Document database page', function () {
  beforeEach(function () {
    cy.interceptMapRequests(); // keep if we won't test the map
    cy.visit('/database');
  })

  it('displays the page', function () {
    cy.contains('Producer documents database');

    // it display full page of observations
    cy.get('.rt-tbody').find('.rt-tr-group', {timeout: 10000}).should('have.length.greaterThan', 1);
  })

  describe('filters', function () {
    it('goes back to the first page when a filter changes', function () {
      cy.get('.rt-tbody').find('.rt-tr-group', {timeout: 10000}).should('have.length.greaterThan', 1);
      cy.get('.-pagination .-next button').click();
      cy.get('.-pagination .-pageJump input').should('have.value', '2');

      cy.selectOption('#react-select-operator_id-input', 'IFO', 'IFO / Interholco')
      cy.get('.-pagination .-pageJump input').should('have.value', '1');
    })

    it('can filter by producer and status', function () {
      cy.selectOption('#react-select-operator_id-input', 'IFO', 'IFO / Interholco')
      cy.selectOption('#react-select-status-input', 'pro', 'Provided (valid)');
      cy.get('.rt-tbody').find('.rt-tr-group').should('have.length.greaterThan', 1);
    })
  })

  describe('table columns', function () {
    it('adds and removes a column', function () {
      cy.get('.rt-thead').contains('Reason').should('not.exist');

      cy.get('.c-db-table').contains('label', 'Reason').click();
      cy.get('.rt-thead').contains('Reason');

      cy.get('.c-db-table').contains('label', 'Reason').click();
      cy.get('.rt-thead').contains('Reason').should('not.exist');
    })
  })
});
