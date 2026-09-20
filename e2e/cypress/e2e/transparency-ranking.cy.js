describe('Transparency ranking page', function () {
  beforeEach(function () {
    cy.interceptMapRequests(); // keep if we won't test the map
    // with the metadata mocked the alerts layer joins the legend, timestep and all
    cy.intercept('GET', '**/gfw-data-api/dataset/gfw_integrated_alerts/latest', {
      body: {
        data: {
          version: 'v20260910',
          metadata: { content_date_range: { start_date: '2014-12-31', end_date: '2026-09-10' } }
        }
      }
    }).as('alertsMetadata');
    cy.visit('/operators');
  })

  it('displays the ranking and filters it by producer and by fmu', function () {
    cy.contains('Transparency Ranking');
    cy.get('.c-ranking table tbody').find('tr').should('have.length.at.least', 1);

    cy.get('[data-test-id=search-input-operator]').clear().type('lorem');
    cy.get('.c-ranking table tbody').find('tr').should('have.length', 1);

    // the fmu filter matches producers of its own, so the producer one is dropped first
    cy.get('[data-test-id=search-input-operator]').clear();
    cy.get('[data-test-id=search-input-fmu]').clear().type('ngombe');
    cy.get('.c-table-expanded-row table tbody').find('tr').should('have.length', 1);
  })

  describe('map legend', function () {
    beforeEach(function () {
      cy.wait('@alertsMetadata');
      cy.get('.c-legend .close-legend').click();
    })

    it('lists the layers and opens the layer info modal', function () {
      cy.get('.c-legend-list .c-legend-item').should('have.length.at.least', 3);
      cy.get('.c-legend-list').contains('Integrated deforestation alerts');
      cy.get('.c-legend-list').contains('Forest management units');

      cy.get('.c-legend-item').first().find('[aria-label="More information"]').click();
      cy.get('.c-modal').should('be.visible');
    })

    it('toggles a layer off and on, changes its opacity and plays the alerts timeline', function () {
      cy.get('.c-legend-item').first().within(() => {
        cy.get('.c-legend-button.toggle').click();
        cy.get('.c-legend-button.opacity').should('have.class', '-disabled');

        cy.get('.c-legend-button.toggle').click();
        cy.get('.c-legend-button.opacity').should('not.have.class', '-disabled');

        cy.get('.c-legend-button.opacity').click();
      });

      cy.get('.c-legend-item-button-opacity-tooltip').should('be.visible')
        .find('.rc-slider-handle').as('handle');
      cy.get('@handle').should('have.attr', 'aria-valuenow', '1');

      cy.get('@handle').focus().type('{leftarrow}{leftarrow}');
      cy.get('@handle').should('have.attr', 'aria-valuenow', '0.98');

      // the tooltip is closed again so it cannot cover the timeline below it
      cy.get('.c-legend-item').first().find('.c-legend-button.opacity').click();
      cy.get('.c-legend-item-button-opacity-tooltip').should('not.exist');

      cy.contains('.c-legend-item', 'Integrated deforestation alerts').within(() => {
        cy.get('.c-timestep').should('exist');
        cy.get('.player-btn').click();
        cy.get('.player-btn').should('have.class', '-playing');

        cy.get('.player-btn').click();
        cy.get('.player-btn').should('not.have.class', '-playing');
      });
    })
  });
});
