describe('Operator', function () {
  beforeEach(function () {
    cy.interceptMapRequests();
  });

  after(() => {
    cy.resetDB();
  });


  context('when visiting as a guest', function () {
    it('can see operator documentation grouped by FMUs', function () {
      cy.visit('/operators/afriwood-industries/documentation');

      cy.docExpandCategory('Forest management');

      cy.docGetFMUDocCard('Cayo', `Compte-rendu du comité de suivi et d'évaluation du plan de gestion`)
        .contains('div', 'Non applicable')

      cy.docGetFMUDocCard('Nkola', `Compte-rendu du comité de suivi et d'évaluation du plan de gestion`)
        .contains('div', 'Not provided')
    })
  });

  context('when logged in as Operator', function () {
    beforeEach(function () {
      cy.login('operator@example.com', 'Supersecret1');
    });

    describe('updating operator profile', function () {
      beforeEach(function () {
        cy.get('div[role=button]').contains('My account').click();
        cy.get('a').contains('Producer profile').click();
        cy.location('pathname', {timeout: 25000}).should('include', '/operator/edit');
      })

      it('can update profile info', function () {
        cy.get('#input-name').clear().type('IFO / Interholco Test');
        cy.get('#input-details').clear().type('Details about Interholco');
        cy.get('#input-website').clear().type('https://example.com');
        cy.get('#input-address').clear().type('Some address');
        // clear old image if exists
        cy.get(".file-button").then(($button) => {
          if ($button.length) {
            cy.wrap($button).click();
          }
        });
        cy.get('.file-dropzone').attachFile('acme-logo.png', { subjectType: 'drag-n-drop' });
        cy.get('button').contains('Update producer').click();
        cy.get('.rrt-text', {timeout: 35000}).should('have.text', 'Profile saved correctly');
      });
    });

    describe('fmus', function () {
      beforeEach(function () {
        cy.visit('/operators/afriwood-industries/fmus');
      })

      it.only('displays operators fmus', function () {
        cy.get('[data-test-id="fmu-select"] option').should('have.length', 3);
        cy.get('[data-test-id="fmu-select"]').within(() => {
          cy.contains('option', 'Cayo').should('exist');
          cy.contains('option', 'Doumanga').should('exist');
          cy.contains('option', 'Nkola').should('exist');
        })
      });
    });

    describe('documentation', function () {
      beforeEach(function () {
        cy.get('div[role=button]').contains('My account').click();
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
        cy.get('input[type=file]').attachFile('test_document.docx');

        cy.intercept('http://localhost:3000/operator-document-histories?*').as('documentsReload');
        cy.get('button').contains('Submit').click();
        cy.get('.rrt-text', {timeout: 5000}).should('have.text', 'Your document was uploaded and will be reviewed by the OTP team shortly.');
        cy.wait('@documentsReload');
        cy.wait(1000);

        cy.docGetFMUDocCard('Ngombe', 'Cahier des charges particulier')
          .find('.doc-card-status')
          .should('contains.text', 'Pending approval')

        cy.get('.c-doc-gallery .doc-by-category-desc .c-title')
          .contains('Use right')
          .parents('.c-doc-by-category')
          .find('.doc-by-category-chart')
          .should('contains.text', '33% Provided (valid)')
      })

      it('can delete existing document and reupload it', function () {
        cy.docExpandCategory('Legal registration');

        cy.intercept('http://localhost:3000/operator-document-histories?*').as('documentsReload');
        cy.docGetProducerDocCard("Certificat d'agrément forestier")
          .siblings('.c-doc-card-upload')
          .contains('button', 'Delete')
          .click();

        cy.contains('Are you sure you want to delete document').should('be.visible');
        cy.get('[data-test-id=confirm-modal-confirm]').click();
        cy.get('.rrt-text', {timeout: 5000}).should('have.text', 'Your document was removed successfully.');

        cy.wait('@documentsReload');
        cy.wait(1000);

        cy.docGetProducerDocCard("Certificat d'agrément forestier")
          .find('.doc-card-status')
          .should('contains.text', 'Not provided')

        cy.get('.c-doc-gallery .doc-by-category-desc .c-title')
          .contains('Legal registration')
          .parents('.c-doc-by-category')
          .find('.doc-by-category-chart')
          .should('contains.text', '50% Provided (valid)')

        cy.docGetProducerDocCard("Certificat d'agrément forestier")
          .siblings('.c-doc-card-upload')
          .contains('button', 'Add file')
          .click();

        // testing validation
        cy.get('button').contains('Submit').click();
        cy.get('.c-file ~ .error').should('have.text', 'The field is required');
        cy.get('.rrt-text').should('have.text', 'Fill all the required fields');

        cy.get('input[type=file]').attachFile('test_document.docx');
        cy.wait(500); // not sure why but it's needed, decreases flakiness

        cy.intercept('http://localhost:3000/operator-document-histories?*').as('documentsReload');
        cy.get('button').contains('Submit').click();
        cy.get('.rrt-text', {timeout: 5000}).should('have.text', 'Your document was uploaded and will be reviewed by the OTP team shortly.');
        cy.wait('@documentsReload');
        cy.wait(1000);

        cy.docGetProducerDocCard("Certificat d'agrément forestier")
          .find('.doc-card-status')
          .should('contains.text', 'Pending approval');
      })

      it('can mark document as non applicable', function () {
        cy.docExpandCategory('Timber harvesting');

        // delete as document exist
        cy.intercept('http://localhost:3000/operator-document-histories?*').as('documentsReload');
        cy.docGetFMUDocCard('Ngombe', 'Autorisation de coupe annuelle')
          .siblings('.c-doc-card-upload')
          .contains('button', 'Delete')
          .click();
        cy.get('[data-test-id=confirm-modal-confirm]').click();
        cy.wait('@documentsReload');
        cy.wait(1000);

        cy.docGetFMUDocCard('Ngombe', 'Autorisation de coupe annuelle')
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
        cy.get('.rrt-text', {timeout: 5000}).should('have.text', 'Document was marked as non applicable and will be reviewed by the OTP team shortly.');
        cy.wait('@documentsReload');
        cy.wait(1000);

        cy.docGetFMUDocCard('Ngombe', 'Autorisation de coupe annuelle')
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
          cy.get('.rrt-text', {timeout: 5000}).should('have.text', 'Your document was uploaded and will be reviewed by the OTP team shortly.');
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

          cy.contains('Are you sure you want to delete document').should('be.visible');
          cy.get('[data-test-id=confirm-modal-confirm]').click();
          cy.get('.rrt-text', {timeout: 5000}).should('have.text', 'Your document was removed successfully.');

          cy.docGetProducerDocCard('Arrêté d’agrément du personnel du centre socio-sanitaire de l’entreprise')
            .find('.doc-card-annexes .doc-card-list-item')
            .should('have.length', 0)
        })
      });
    });
  });
});
