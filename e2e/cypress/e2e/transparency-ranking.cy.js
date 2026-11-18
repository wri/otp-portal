describe('Transparency ranking page', function () {
  beforeEach(function () {
    cy.interceptMapRequests({ loadMap: true });
    // with the metadata mocked the alerts layer joins the legend, timestep and all
    cy.intercept('GET', '**/gfw-data-api/dataset/gfw_integrated_alerts/latest', {
      body: {
        data: {
          version: 'v20260910',
          metadata: { content_date_range: { start_date: '2014-12-31', end_date: '2026-09-10' } }
        }
      }
    }).as('alertsMetadata');
  })

  it('displays the ranking, filters it and collapses the sidebar', function () {
    cy.visit('/operators');
    cy.contains('Transparency Ranking');
    cy.location('search').should('include', 'latitude=').and('include', 'longitude=').and('include', 'zoom=4.00');
    cy.get('.c-ranking table tbody').find('tr').should('have.length.at.least', 1);

    cy.get('[data-test-id=search-input-operator]').clear().type('lorem');
    cy.get('.c-ranking table tbody').find('tr').should('have.length', 1);

    // the fmu filter matches producers of its own, so the producer one is dropped first
    cy.get('[data-test-id=search-input-operator]').clear();
    cy.get('[data-test-id=search-input-fmu]').clear().type('ngombe');
    cy.get('.c-table-expanded-row table tbody').find('tr').should('have.length', 1);

    cy.get('[data-test-id=sidebar-toggle]').should('have.attr', 'aria-expanded', 'true');
    cy.get('[data-test-id=sidebar-toggle]').click();
    cy.get('[data-test-id=sidebar-toggle]').should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-test-id=sidebar-toggle]').click();
    cy.get('[data-test-id=sidebar-toggle]').should('have.attr', 'aria-expanded', 'true');
    cy.get('[data-test-id=ranking-table] tbody tr').should('have.length.at.least', 1);
  })

  it('syncs the map with the url and opens the popup of a clicked fmu', function () {
    cy.visit('/operators?latitude=-4.34&longitude=11.68&zoom=8');
    cy.getMap().should((map) => {
      expect(map.getZoom()).to.equal(8);
      expect(map.getCenter().lng).to.be.closeTo(11.68, 0.01);
    });

    cy.clickMapFeature({ source: 'fmus', filter: (f) => f.properties.fmu_name === 'Nkola' });
    cy.get('.c-map-popup').within(() => {
      cy.contains('.layer-popup--title', 'Nkola');
      cy.contains('a', 'AFRIWOOD INDUSTRIES').should('have.attr', 'href', '/operators/afriwood-industries/overview');
      cy.get('.map-popup--close').click();
    });
    cy.get('.c-map-popup').should('not.exist');

    cy.get('[aria-label="Zoom in"]').click();
    cy.location('search').should('include', 'zoom=9.00');

    // dragging west moves the map east
    cy.location('search').then((search) => {
      const longitude = +new URLSearchParams(search).get('longitude');
      cy.getMap();
      cy.get('.mapboxgl-canvas')
        .trigger('mousedown', 300, 300, { button: 0, buttons: 1 })
        .trigger('mousemove', 250, 300, { button: 0, buttons: 1 })
        .trigger('mousemove', 200, 300, { button: 0, buttons: 1 })
        .trigger('mouseup', 200, 300, { button: 0 });
      cy.location('search').should((s) => {
        expect(+new URLSearchParams(s).get('longitude')).to.be.greaterThan(longitude);
      });
    });
  })

  it('lists the legend layers and changes their visibility, opacity and timeline', function () {
    cy.visit('/operators');
    cy.wait('@alertsMetadata');
    cy.get('.c-legend .close-legend').click();

    cy.get('.c-legend-list .c-legend-item').should('have.length.at.least', 3);
    cy.get('.c-legend-list').contains('Integrated deforestation alerts');
    cy.get('.c-legend-list').contains('Forest management units');

    cy.get('.c-legend-item').first().find('[aria-label="More information"]').click();
    cy.get('.c-modal').should('be.visible');
    cy.get('.c-modal .modal-close').click();
    cy.get('.c-modal').should('have.class', '-hidden');

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
