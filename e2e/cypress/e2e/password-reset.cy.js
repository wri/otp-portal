describe('Password Reset', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  describe('Forgot password form', () => {
    it('user can ask for password reset', function () {
      cy.get('div[role=button]').contains('Sign in').click();
      cy.get('button').contains('Reset your password').click();
      cy.get('#input-email').type('operator@example.com');
      cy.get('button').contains('Reset Password').click();
      cy.contains('If account exists for operator@example.com, you will get an email with instructions on how to reset your password');
    });
  })

  describe('Reset password form', () => {
    describe('errors', () => {
      it('shows error with invalid token', function () {
        cy.visit('/reset-password?reset_password_token=invalid');
        cy.get('#input-password').type('NewPassword1');
        cy.get('#input-passwordConfirmation').type('NewPassword1');
        cy.get('button').contains('Change Password').click();
        cy.get('.rrt-text').should('have.text', 'reset_password_token is invalid');
      });
    })

    // TODO: test success case with valid token
  })
});
