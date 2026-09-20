describe('Home Page', () => {
  beforeEach(() => {
    cy.interceptMapRequests();
    cy.visit('/');
  })

  it('displays the page', function () {
    cy.contains('Incentivizing legal timber by improving access to information');
  })

  describe('using the search box on the page', () => {
    beforeEach(function () {
      cy.get('[data-test-id=search-input]').as('input');
    })

    it('shows matching operators and says when there are none', function () {
      cy.get('@input').type('sic');
      cy.get('[data-test-id=search-results]').contains('li', 'SIFCO');

      cy.get('@input').clear().type('zzzzzz');
      cy.get('[data-test-id=search-results]').contains('li', 'No results');
    })

    it('goes to the operator page when a result is clicked', function () {
      cy.get('@input').type('sic');
      cy.get('[data-test-id=search-results]').contains('a', 'SIFCO').click();

      cy.location('pathname', { timeout: 25000 }).should('include', '/operators/');
      cy.get('.c-static-header').should('contain.text', 'SIFCO');
    })

    it('walks the results with the arrow keys and opens one with enter', function () {
      cy.get('@input').type('a');
      cy.get('[data-test-id=search-results] li').should('have.length.at.least', 2);

      cy.get('@input').type('{downarrow}');
      cy.get('[data-test-id=search-results] li').eq(1).should('have.class', '-active');
      cy.get('@input').type('{uparrow}');
      cy.get('[data-test-id=search-results] li').eq(0).should('have.class', '-active');

      cy.get('[data-test-id=search-results] li').eq(0).find('a').invoke('attr', 'data-slug').then((slug) => {
        cy.get('@input').type('{enter}');
        cy.location('pathname', { timeout: 25000 }).should('eq', `/operators/${slug}/overview`);
      });
    })

    it('clears the search with the button and with escape', function () {
      cy.get('@input').type('sic');
      cy.get('.c-search button[aria-label="Clear search"]').click();
      cy.get('[data-test-id=search-results]').should('not.contain.text', 'SIFCO');
      cy.get('@input').should('have.value', '');

      cy.get('@input').type('sic{esc}');
      cy.get('[data-test-id=search-results]').should('not.contain.text', 'SIFCO');
    })
  });

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
