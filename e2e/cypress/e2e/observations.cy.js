describe('Observations page', function () {
  beforeEach(function () {
    cy.interceptMapRequests(); // keep if we won't test the map
    cy.visit('http://localhost:4000/observations');
  })

  it('displays the page', function () {
    cy.contains('Overview by category');
    cy.contains('Observations List');

    // it display observations
    cy.get('.rt-tbody').find('.rt-tr-group', {timeout: 10000}).should('have.length.greaterThan', 1);
  })

  describe('filters', function () {
    it('can filter by producer', function () {
      cy.selectOption('#react-select-operator-input', 'AFRIWOOD', 'AFRIWOOD INDUSTRIES')
      cy.get('.rt-tbody').find('.rt-tr-group').should('have.length.greaterThan', 1);
    })
  })
});
