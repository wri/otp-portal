const MAIL_ORIGIN = 'http://localhost:3000';

describe('Password Reset', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  describe('Forgot password form', () => {
    it('allows user to request password reset', function () {
      // letter_opener is served by the API on :3000 while the portal runs on
      // :4000. Since Cypress 14 the port is part of the origin and document.domain
      // is no longer injected, so the mailbox has to be driven inside cy.origin().
      cy.origin(MAIL_ORIGIN, () => {
        cy.visit('/admin/letter_opener');
        cy.get('a').contains('Clear').click();
      });

      cy.visit('/');
      cy.get('div[role=button]').contains('Sign in').click();
      cy.get('button').contains('Reset your password').click();
      cy.get('#input-email').type('operator@example.com');
      cy.get('button').contains('Reset Password').click();
      cy.contains('If account exists for operator@example.com, you will get an email with instructions on how to reset your password');

      // cy.origin() yields the value of the last command in the callback, which is
      // how the token gets back out - the callback is not a closure, so it cannot
      // assign to a variable declared in the test.
      cy.origin(MAIL_ORIGIN, () => {
        cy.visit('/admin/letter_opener');
        cy.get('a[target="mail"]').contains('operator@example.com').click();
        cy.wait(1000); // wait to load frames
        cy.get('iframe#mail')
          .then($mailIframe => cy.wrap($mailIframe.contents()).find('iframe'))
          .then($messageIframe => cy.wrap($messageIframe.contents()).find('a').contains('reset_password_token='))
          .then(tokenElement => {
            const textWithToken = tokenElement.text();
            const tokenRegex = /reset_password_token=(.*)/;
            const tokenMatch = textWithToken.match(tokenRegex);
            const token = tokenMatch && tokenMatch[1];
            // Assert that the token is extracted successfully
            expect(token).to.exist;
            return token;
          });
      }).then((token) => {
        cy.visit(`/reset-password?reset_password_token=${token}`);
      });

      // user is not logged in yet, so we need to fill in the password reset form
      cy.contains('div[role=button]', 'Sign in');
      cy.get('#input-password').type('NewPassword1');
      cy.get('#input-passwordConfirmation').type('NewPassword1');
      cy.get('button').contains('Change Password').click();
      cy.get('.rrt-text').should('have.text', 'Password changed successfully');
      // user should automatically log in
      cy.contains('div[role=button]', 'My account');

      cy.resetDB();
    });
  })

  describe('Reset password form', () => {
    describe('errors', () => {
      it('shows error with invalid token', function () {
        cy.visit('/reset-password?reset_password_token=invalid');

        // validation errors
        cy.get('button').contains('Change Password').click();
        cy.contains('The field is required')
        cy.contains('The field should have at least one lowercase letter');
        cy.contains('The field should have at least one capital (uppercase) letter');
        cy.contains('The field should have at least one digit')
        cy.contains('The field should have at least 10 characters');

        cy.get('#input-password').type('NewPassword1');
        cy.get('#input-passwordConfirmation').type('NewPassword1');
        cy.get('button').contains('Change Password').click();
        cy.get('.rrt-text').should('have.text', 'reset_password_token is invalid');
      });
    })
  })
});
