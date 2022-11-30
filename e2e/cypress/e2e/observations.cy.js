describe('Observations page', function () {
  beforeEach(function () {
    cy.interceptMapRequests(); // keep if we won't test the map
    cy.visit('http://localhost:4000/observations');
  })

  it('displays the page', function () {
    cy.contains('Overview by category');
    cy.contains('Observations List');

    // it display full page of observations
    cy.get('.rt-tbody').find('.rt-tr-group').should('have.length', 50);
  })

  describe('filters', function () {
    /* it('can filter by producer', function () {

     * }) */
  })
});
