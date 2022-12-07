describe('Transparency ranking page', function () {
  beforeEach(function () {
    cy.interceptMapRequests(); // keep if we won't test the map
    cy.visit('http://localhost:4000/operators');
  })

  it('displays the page', function () {
    cy.contains('Transparency Ranking');

    // loads ranking
    cy.get('.c-ranking table tbody').find('tr').should('have.length.at.least', 1);
  })

  describe('filters', function () {
    it('can filter by producer name', function () {
      cy.get('.search-input').clear().type('lorem')
      cy.get('.c-ranking table tbody').find('tr').should('have.length', 1);
    })
  })
});
