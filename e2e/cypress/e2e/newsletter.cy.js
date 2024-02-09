describe('Newsletter', () => {
  describe('Newsletter form', () => {
    beforeEach(() => {
      cy.intercept('https://api.db-ip.com/v2/free/self', {
        body: {
          ipAddress: '85.34.21.23'
        }
      });
      cy.visit('/newsletter');
    });

    it('displays content', function () {
      cy.contains('Newsletter');
      cy.contains('First Name');
      cy.contains('Last Name');
      cy.contains('Email');
      cy.contains('Organization');
      cy.contains('Country');
    });

    it('matches visually', function () {
      cy.matchImage();
    });

    it('can submit form', function () {
      cy.contains('Sign up').click();
      cy.get('.rrt-text').should('have.text', 'Fill all the required fields');
      cy.get('input[name=first_name] ~ .error').should('have.text', 'The field is required');
      cy.get('input[name=last_name] ~ .error').should('have.text', 'The field is required');
      cy.get('input[name=email] ~ .error').should('have.text', 'The field is requiredThe field should be a valid email address');
      cy.get('input[name=organization] ~ .error').should('have.text', 'The field is required');
      cy.get('#select-country ~ .error').should('have.text', 'The field is required');

      cy.get('input[name=first_name]').type('John');
      cy.get('input[name=last_name]').type('Example');
      cy.get('input[name=email]').type('john@example.com');
      cy.get('input[name=organization]').type('Example Inc');
      cy.selectOption('[name=country]', 'Po', 'Poland');

      cy.intercept('POST', 'https://ortto.wri.org/custom-forms', (req) => {
        const formData = new URLSearchParams(req.body);

        expect(formData.get('website')).to.equal('opentimberportal.org');
        expect(formData.get('form-name')).to.equal('Open Timber Portal Newsletter Signup');
        expect(formData.get('list')).to.equal('FOR - FGP - NEWSL – Open Timber Portal - LIST');
        expect(formData.get('interests')).to.equal('Forests');
        expect(formData.get('preferred_language')).to.equal('en');
        expect(formData.get('ip_addr')).to.equal('85.34.21.23');
        expect(formData.get('first_name')).to.equal('John');
        expect(formData.get('last_name')).to.equal('Example');
        expect(formData.get('email')).to.equal('john@example.com');
        expect(formData.get('organization')).to.equal('Example Inc');
        expect(formData.get('country')).to.equal('Poland');

        req.reply({ statusCode: 302, headers: { location: 'http://localhost:4000/newsletter/thank-you' } });
      }).as('submitForm');

      cy.get('button').contains('Sign up').click();
      cy.wait('@submitForm');
      cy.contains("Thanks for your information - there's just one more step to finalize your request!");
    });
  });

  describe('Confirmation page', () => {
    beforeEach(() => {
      cy.visit('/newsletter/subscription-confirmed');
    });

    it('displays content', function () {
      cy.contains('Your subscription is confirmed.');
    });
  });
})
