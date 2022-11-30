const { nanoid } = require('nanoid')

describe('Pages', () => {
  describe('About page', () => {
    it('displays content', function () {
      cy.visit('http://localhost:4000/about');
      cy.contains('About the portal');
      cy.contains('The Open Timber Portal is an initiative launched by the World Resources Institute');
    })
  })

  describe('Help page', () => {
    context('when visitng overview/main', () => {
      it('displays content', function () {
        cy.visit('http://localhost:4000/help');
        cy.contains('How the OTP works');
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
    it('displays content', function () {
      cy.visit('http://localhost:4000/terms');
      cy.contains('World Resources Institute Privacy Policy');
    })
  })

  describe('Newsletter page', () => {
    it('displays content', function () {
      cy.visit('http://localhost:4000/newsletter');
      cy.contains('Newsletter');
      cy.contains('First Name');
      cy.contains('Last Name');
      cy.contains('Email');
      cy.contains('Organization');
      cy.contains('Country');
    })
  })
});
