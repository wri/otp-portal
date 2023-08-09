describe('Pages', () => {
  describe('Login page', () => {
    it('matches visually', function () {
      cy.visit('http://localhost:4000');
      cy.get('a').contains('Sign in').click();
      cy.get('.c-login').matchImage();
    });
  })

  describe('Create account page', () => {
    it('matches visually', function () {
      cy.visit('http://localhost:4000/signup');
      cy.matchImage();
    });
  })

  describe('Create producer page', () => {
    it('matches visually', function () {
      cy.visit('http://localhost:4000/operators/new');
      cy.matchImage();
    });
  })

  describe('About page', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4000/about');
    })

    it('displays content', function () {
      cy.contains('About the portal');
      cy.contains('The Open Timber Portal is an initiative launched by the World Resources Institute');
    })

    it('matches visually', function () {
      cy.matchImage();
    })
  })

  describe('Help page', () => {
    context('when visitng overview/main', () => {
      beforeEach(() => {
        cy.visit('http://localhost:4000/help');
      })

      it('displays content', function () {
        cy.contains('How the OTP works');
      })

      it('matches visually', function () {
        cy.matchImage();
      })
    })

    context('when visiting how otp works', () => {
      it('displays content', function () {
        cy.visit('http://localhost:4000/help/how-otp-works');
        cy.contains('What are severity parameters and why are they important? ');
      })
    })

    context('when visiting legislations and regulations', () => {
      it('displays content', function () {
        cy.visit('http://localhost:4000/help/legislation-and-regulations');
        cy.contains('The Risk Tool, hosted by WRI, provides an overview of relevant legislations and regulations');
      })
    })

    context('when visiting tutorials', () => {
      it('displays content', function () {
        cy.visit('http://localhost:4000/help/tutorials');
        cy.contains('Introductory video to the OTP');
      })
    })

    context('when visiting faq', () => {
      it('displays content', function () {
        cy.visit('http://localhost:4000/help/faqs');
        cy.contains('About the OTP and the data on the site');
      })
    })
  })

  describe('Terms page', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4000/terms');
    })

    it('displays content', function () {

      cy.contains('World Resources Institute Privacy Policy');
    })

    it('matches visually', function () {
      cy.matchImage();
    })
  })

  describe('Newsletter page', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4000/newsletter');
    })

    it('displays content', function () {
      cy.contains('Newsletter');
      cy.contains('First Name');
      cy.contains('Last Name');
      cy.contains('Email');
      cy.contains('Organization');
      cy.contains('Country');
    })

    it('matches visually', function () {
      cy.matchImage();
    })
  })
});
