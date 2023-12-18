describe('Home Page', () => {
  beforeEach(() => {
    cy.interceptMapRequests();
    cy.visit('http://localhost:4000/');
  })

  describe('content', () => {
    it('matches visually', function () {
      cy.matchImage();
    })
  })

  describe('using operator search', () => {
    it('finds operator and goes to details page', function () {
      cy.get('.c-header [data-test-id=search-input]').type('sic')
      cy.get('.c-header [data-test-id=search-results]').contains('SIFCO').click();
      cy.location('pathname', {timeout: 25000}).should('include', '/operators/');
      cy.get('.c-static-header').should('contains.text', 'SIFCO');
      cy.get('.c-static-header').should('contains.text', 'Transparency ranking');
    });
  });
});
