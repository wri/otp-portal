describe('Pages', () => {
  describe('Login page', () => {
    it('matches visually', function () {
      cy.visit('/');
      cy.get('div[role=button]').contains('Sign in').click();
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

    context('when moving through the tab links', () => {
      it('shows each tab', function () {
        cy.visit('/help/overview');
        cy.get('[data-test-id=tab-how-otp-works]').click();
        cy.contains('What are severity parameters and why are they important? ');
        cy.get('[data-test-id=tab-legislation-and-regulations]').click();
        cy.contains('The Risk Tool, hosted by WRI, provides an overview of relevant legislations and regulations');
        cy.get('[data-test-id=tab-faqs]').click();
        cy.contains('About the OTP and the data on the site');
        cy.get('[data-test-id=tab-tutorials]').click();
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

  describe('Mobile menu', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
      cy.visit('/');
    })

    it('opens from the hamburger and links to the main pages', function () {
      cy.get('.c-mobile-menu').should('not.exist');

      cy.get('.c-hamburger').click();
      cy.get('.c-mobile-menu').within(() => {
        cy.contains('a', 'Transparency Ranking');
        cy.contains('a', 'Observations');
        cy.contains('a', 'About').click();
      });

      cy.location('pathname').should('eq', '/about');
    })

    it('closes again', function () {
      cy.get('.c-hamburger').click();
      cy.get('.c-hamburger').click();

      cy.get('.c-mobile-menu').should('not.exist');
    })
  })

  describe('French version', () => {
    it('shows the observations page in French', function () {
      cy.interceptMapRequests();
      cy.visit('/fr/observations');
      cy.get('html').should('have.attr', 'lang', 'fr');
      cy.contains("Liste d'observations");
      cy.get('.rt-tbody').find('.rt-tr-group', {timeout: 10000}).should('have.length.greaterThan', 1);
    })

    it('opens the date picker on the operator documentation in French', function () {
      cy.visit('/fr/operators/afriwood-industries/documentation');
      cy.get('[data-test-id=documents-filter-date] button').click();
      cy.get('.react-datepicker').should('be.visible');
    })
  })

  describe('Navigating with the menu and the browser history', () => {
    it('moves between pages and back and forward', function () {
      cy.interceptMapRequests();
      cy.visit('/');
      cy.get('[data-test-id=nav-observations]').click();
      cy.location('pathname').should('eq', '/observations');
      cy.get('.rt-tbody').find('.rt-tr-group', {timeout: 10000}).should('have.length.greaterThan', 1);

      cy.get('[data-test-id=nav-producers]').click();
      cy.get('[data-test-id=nav-database]').click();
      cy.location('pathname').should('eq', '/database');
      cy.get('.rt-tbody').find('.rt-tr-group', {timeout: 10000}).should('have.length.greaterThan', 1);

      cy.go('back');
      cy.location('pathname').should('eq', '/observations');
      cy.get('.rt-tbody').find('.rt-tr-group', {timeout: 10000}).should('have.length.greaterThan', 1);

      cy.go('forward');
      cy.location('pathname').should('eq', '/database');
    })
  })

  describe('Not found page', () => {
    it('displays content', function () {
      cy.visit('/this-page-does-not-exist', { failOnStatusCode: false });
      cy.contains('h1', 'Page Not Found');
      cy.contains('/this-page-does-not-exist');
    })
  })

  describe('Sitemap', () => {
    it('lists static and operator pages', function () {
      cy.request('/sitemap.xml').then((response) => {
        expect(response.headers['content-type']).to.include('text/xml');
        expect(response.body).to.include('/observations</loc>');
        expect(response.body).to.include('/operators/afriwood-industries/documentation</loc>');
      });
    })
  })
});
