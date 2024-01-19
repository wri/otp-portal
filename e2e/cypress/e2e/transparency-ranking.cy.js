describe('Transparency ranking page', function () {
  beforeEach(function () {
    cy.interceptMapRequests(); // keep if we won't test the map
    cy.visit('/operators');
  })

  it('displays the page', function () {
    cy.contains('Transparency Ranking');

    // loads ranking
    cy.get('.c-ranking table tbody').find('tr').should('have.length.at.least', 1);
  })

  describe('filters', function () {
    it('can filter by producer name', function () {
      cy.get('[data-test-id=search-input-operator]').clear().type('lorem')
      cy.get('.c-ranking table tbody').find('tr').should('have.length', 1);
    });

    it('can filter by fmu name', function () {
      cy.get('[data-test-id=search-input-fmu]').clear().type('ngombe')
      cy.get('.c-table-expanded-row table tbody').find('tr').should('have.length', 1);
    });
  })
});
