const { nanoid } = require('nanoid')

describe('Operator', function () {
  beforeEach(function () {
    cy.interceptMapRequests();
  });

  after(() => {
    cy.resetDB();
  });

  context('when logged in as Operator', function () {
    beforeEach(function () {
      cy.login('operator@example.com', 'password');
    });

    describe('updating operator profile', function () {
      beforeEach(function () {
        cy.get('a').contains('My account').click();
        cy.get('a').contains('Producer profile').click();
        cy.location('pathname', {timeout: 25000}).should('include', '/operators/edit');
      })

      it('can update profile info', function () {
        cy.get('#input-name').clear().type('IFO / Interholco Test');
        cy.get('#input-details').clear().type('Details about Interholco');
        cy.get('#input-website').clear().type('https://example.com');
        cy.get('#input-address').clear().type('Some address');
        cy.get('.file-dropzone').attachFile('acme-logo.png', { subjectType: 'drag-n-drop' });
        cy.get('button').contains('Update producer').click();
        cy.get('.rrt-text', {timeout: 35000}).should('have.text', 'Profile saved correctly');
      });

      it('can add new sawmill', function () {
        // cy.get('.c-options-table').should('contains.text', 'No sawmills');
        cy.get('button').contains('Add sawmill').click();

        cy.get('[data-test-id=sawmill-name]').type('Sawmill Example');
        cy.get('[data-test-id=sawmill-isactive]').click({force: true});
        cy.get('[data-test-id=sawmill-latitude]').type('78.4')
        cy.get('[data-test-id=sawmill-longitude]').type('23.4')
        cy.get('button').contains('Submit').click();
        cy.get('td').should('contains.text', 'Sawmill Example');
      });
    });

    describe('documentation', function () {
      beforeEach(function () {
        cy.get('a').contains('My account').click();
        cy.contains('a', 'IFO / Interholco').click();
        cy.location('pathname', {timeout: 25000}).should('include', '/documentation');
      })

      it('can upload a new document', function () {
        cy.docExpandCategory('Use right');

        cy.docGetFMUDocCard('Ngombe', 'Cahier des charges particulier')
          .siblings('.c-doc-card-upload')
          .contains('button', 'Edit')
          .click();

        cy.get('#input-startDate').type('2022-03-30');
        cy.get('#input-expireDate').type('2030-03-30');
        cy.selectOption('[name=source]', null, 'Other');
        cy.get('#input-sourceInfo').clear().type('Here is example source info');
        cy.get('input[type=file]').attachFile('test_document.docx');

        cy.intercept('http://localhost:3000/operator-document-histories?*').as('documentsReload');
        cy.get('button').contains('Submit').click();
        cy.wait('@documentsReload');
        cy.wait(1000);

        cy.docGetFMUDocCard('Ngombe', 'Cahier des charges particulier')
          .find('.doc-card-status')
          .should('contains.text', 'Pending approval')

        cy.get('.c-doc-gallery .doc-by-category-desc .c-title')
          .contains('Use right')
          .parents('.c-doc-by-category')
          .find('.doc-by-category-chart')
          .should('contains.text', '50% Provided (valid)')
      })

      it('can delete existing document and reupload it', function () {
        cy.docExpandCategory('Legal registration');

        cy.intercept('http://localhost:3000/operator-document-histories?*').as('documentsReload');
        cy.docGetProducerDocCard("Certificat d'agrément forestier")
          .siblings('.c-doc-card-upload')
          .contains('button', 'Delete')
          .click();
        cy.wait('@documentsReload');
        cy.wait(1000);

        cy.docGetProducerDocCard("Certificat d'agrément forestier")
          .find('.doc-card-status')
          .should('contains.text', 'Not provided')

        cy.get('.c-doc-gallery .doc-by-category-desc .c-title')
          .contains('Legal registration')
          .parents('.c-doc-by-category')
          .find('.doc-by-category-chart')
          .should('contains.text', '75% Provided (valid)')

        cy.docGetProducerDocCard("Certificat d'agrément forestier")
          .siblings('.c-doc-card-upload')
          .contains('button', 'Add file')
          .click();

        // testing validation
        cy.get('button').contains('Submit').click();
        cy.get('.c-file ~ .error').should('have.text', 'The field is required');
        cy.get('.rrt-text').should('have.text', 'Fill all the required fields');

        cy.get('input[type=file]').attachFile('test_document.docx');

        cy.intercept('http://localhost:3000/operator-document-histories?*').as('documentsReload');
        cy.get('button').contains('Submit').click();
        cy.wait('@documentsReload');
        cy.wait(1000);

        cy.docGetProducerDocCard("Certificat d'agrément forestier")
          .find('.doc-card-status')
          .should('contains.text', 'Pending approval');
      })

      it('can mark document as non applicable', function () {
        cy.docExpandCategory('Timber harvesting');

        cy.docGetFMUDocCard('Ngombe', 'Autorisation de coupe provisoire')
          .siblings('.c-doc-card-upload')
          .contains('button', 'Non applicable')
          .click();

        // testing validation
        cy.get('button').contains('Submit').click();
        cy.get('textarea[name=reason] ~ .error').should('have.text', 'The field is required');
        cy.get('.rrt-text').should('have.text', 'Fill all the required fields');

        cy.get('#input-startDate').type('2022-03-30');
        cy.get('#input-expireDate').type('2030-03-30');
        cy.get('#input-reason').clear().type('Reason why this document is non applicable');

        cy.intercept('http://localhost:3000/operator-document-histories?*').as('documentsReload');
        cy.get('button').contains('Submit').click();
        cy.wait('@documentsReload');
        cy.wait(1000);

        cy.docGetFMUDocCard('Ngombe', 'Autorisation de coupe provisoire')
          .find('.doc-card-status')
          .should('contains.text', 'Pending approval')
      })

      describe('annexes', function () {
        it('can add new annex', function () {
          cy.docExpandCategory('Population rights');
          cy.docGetFMUDocCard('Ngombe', 'Compte-rendu du conseil de concertation')
            .find('.doc-card-annexes .doc-card-list-item')
            .should('have.length', 0)

          cy.docGetFMUDocCard('Ngombe', 'Compte-rendu du conseil de concertation')
            .find('[data-test-id=add-annex-button]')
            .click();

          cy.contains('Add a document for the annex of Compte-rendu du conseil de concertation');

          // testing validation
          cy.get('button').contains('Submit').click();
          cy.get('input[name=name] ~ .error').should('have.text', 'The field is required');
          cy.get('input[name=startDate] ~ .error').should('have.text', 'The field is required');
          cy.get('.c-file ~ .error').should('have.text', 'The field is required');
          cy.get('.rrt-text').should('have.text', 'Fill all the required fields');

          cy.get('#input-name').type('Here is the name of annex');
          cy.get('#input-startDate').type('2022-03-30');
          cy.get('#input-expireDate').type('2030-03-30');
          cy.get('input[type=file]').attachFile('test_document.docx');

          cy.intercept('http://localhost:3000/operator-document-histories?*').as('documentsReload');
          cy.get('button').contains('Submit').click();
          cy.wait('@documentsReload');
          cy.wait(1000);

          cy.docGetFMUDocCard('Ngombe', 'Compte-rendu du conseil de concertation')
            .find('.doc-card-annexes .doc-card-list-item')
            .should('have.length', 1)
        })

        it('can delete annex', function () {
          cy.docExpandCategory('Labor regulations');
          cy.docGetProducerDocCard('Arrêté d’agrément du personnel du centre socio-sanitaire de l’entreprise')
            .find('.doc-card-annexes .doc-card-list-item')
            .should('have.length', 1)
            .trigger('mouseover');

          cy.get('[data-test-id=remove-annex-button]')
            .click();

          cy.docGetProducerDocCard('Arrêté d’agrément du personnel du centre socio-sanitaire de l’entreprise')
            .find('.doc-card-annexes .doc-card-list-item')
            .should('have.length', 0)
        })
      });
    });
  });
});
