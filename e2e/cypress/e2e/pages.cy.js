describe('Pages', () => {
  describe('Login page', () => {
    it('matches visually', function () {
      cy.visit('/');
      cy.get('a').contains('Sign in').click();
      cy.get('.c-login').matchImage();
    });
  })

  describe('Create account page', () => {
    it('matches visually', function () {
      cy.visit('/signup');
      cy.matchImage();
    });
  })

  describe('Create producer page', () => {
    it('matches visually', function () {
      cy.visit('/operator/new');
      cy.matchImage();
    });
  })

  describe('About page', () => {
    beforeEach(() => {
      cy.visit('/about');
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
        cy.visit('/help');
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
        cy.visit('/help/how-otp-works');
        cy.contains('What are severity parameters and why are they important? ');
      })
    })

    context('when visiting legislations and regulations', () => {
      it('displays content', function () {
        cy.visit('/help/legislation-and-regulations');
        cy.contains('The Risk Tool, hosted by WRI, provides an overview of relevant legislations and regulations');
      })
    })

    context('when visiting tutorials', () => {
      it('displays content', function () {
        cy.visit('/help/tutorials');
        cy.contains('Introductory video to the OTP');
      })
    })

    context('when visiting faq', () => {
      it('displays content', function () {
        cy.visit('/help/faqs');
        cy.contains('About the OTP and the data on the site');
      })
    })
  })

  describe('Terms page', () => {
    beforeEach(() => {
      cy.visit('/terms');
    })

    it('displays content', function () {
      cy.contains('Welcome to the Open Timber Portal. This document lets the user of these Services');
    })
  })

  describe('Privacy policy page', () => {
    beforeEach(() => {
      cy.visit('/privacy-policy');
    })

    it('displays content', function () {
      cy.contains('List of Cookies that May Be Set');
    })
  })
});
