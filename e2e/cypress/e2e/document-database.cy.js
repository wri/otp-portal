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
    /* it('can filter by producer', function () {

     * }) */
  })
});
