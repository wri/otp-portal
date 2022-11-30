describe('Document database page', function () {
  beforeEach(function () {
    cy.interceptMapRequests(); // keep if we won't test the map
    cy.visit('http://localhost:4000/database');
  })

  it('displays the page', function () {
    cy.contains('Producer documents database');

    // it display full page of observations
    cy.get('.rt-tbody').find('.rt-tr-group').should('have.length', 30);
  })

  describe('filters', function () {
    it('can filter by producer and status', function () {
      cy.selectOption('#react-select-operator_id--value', 'CFF Bois', 'CFF Bois International')
      cy.selectOption('#react-select-status--value', 'pro', 'Provided (valid)');
      cy.get('.rt-tbody').find('.rt-tr-group').should('have.length', 5);
    })
  })
});
