describe('Home Page', () => {
  beforeEach(() => {
    cy.interceptMapRequests();
    cy.visit('/');
  })

  it('displays the page', function () {
    cy.contains('Incentivizing legal timber by improving access to information');
  })

  describe('using operator search', () => {
    it('finds operator and goes to details page', function () {
      cy.get('.c-header [data-test-id=search-trigger]').click();
      cy.get('[data-test-id=search-modal-input]').type('sic');
      cy.get('[data-test-id=search-modal-results]').contains('SIFCO').click();
      cy.location('pathname', {timeout: 25000}).should('include', '/operators/');
      cy.get('.c-static-header').should('contains.text', 'SIFCO');
      cy.get('.c-static-header').should('contains.text', 'Transparency ranking');

      cy.get('.c-header [data-test-id=search-trigger]').click();
      cy.get('[data-test-id=search-modal-results]').should('contain.text', 'SIFCO');
      cy.get('[data-test-id=search-modal-clear-recent]').click();
      cy.get('[data-test-id=search-modal-results]').should('not.contain.text', 'SIFCO');
    });
  });
});
