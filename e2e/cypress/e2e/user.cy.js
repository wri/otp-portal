describe('User', () => {
  beforeEach(() => {
    cy.interceptMapRequests();
  })

  after(() => {
    cy.resetDB();
  })

  context('Login form', () => {
    it('can log in', function () {
      cy.visit('/');
      cy.get('div[role=button]').contains('Sign in').click();
      cy.get('#input-email').type('operator@example.com');
      cy.get('#input-password').type('wrongpassword');
      cy.get('button').contains('Log in').click();
      cy.get('.rrt-text').should('have.text', 'Wrong email or password');
      cy.get('#input-password').clear().type('Supersecret1');
      cy.get('button').contains('Log in').click();
      cy.contains('div[role=button]', 'My account');
    });
  })

  context('Public user', () => {
    it('can log in and out', function () {
      cy.login('operator@example.com', 'Supersecret1');
      cy.get('div[role=button]').contains('My account').click();
      cy.get('a').contains('My profile').click();
      cy.get('#input-firstName').should('have.value', 'Operator');
      cy.get('#input-lastName').should('have.value', 'User');
      cy.get('div[role=button]').contains('My account').click();
      cy.get('a').contains('Sign out').click();
      cy.get('div[role=button]').contains('Sign in').should('exist')
      cy.get('div[role=button]').contains('My account').should('not.exist')
    });

    it('can create account', function () {
      cy.visit('/');
      cy.get('div[role=button]').contains('Sign in').click();
      cy.get('a').contains('Register now').click();
      cy.selectOption('[name=country_id]', 'Co', 'Congo');
      cy.selectOption('[name=operator_id]', 'Si', 'SIFCO');
      cy.get('#select-locale .react-select__single-value').contains('English');
      cy.get('#input-first_name').type('Test');
      cy.get('#input-last_name').type('Operator');
      cy.get('#input-email').type('testoperator@example.com');
      cy.get('#input-password').clear().type('password');
      cy.get('#input-password_confirmation').type('password2');
      cy.get('button').contains('Sign up').click();
      cy.contains('.error', 'The field is required');
      cy.contains('.error', 'The field should have at least one capital (uppercase) letter');
      cy.contains('.error', 'The field should have at least one digit');
      cy.contains('.error', 'The field should have at least 10 characters');
      cy.contains('.error', 'The field should be equal to password');
      cy.get('.rrt-text').should('have.text', 'Fill all the required fields');
      cy.get('#input-password').clear().type('Superpassword1');
      cy.get('#input-password_confirmation').clear().type('Superpassword1');
      cy.get('label[for=checkbox-agree-undefined]').click();
      cy.get('button').contains('Sign up').click();
      cy.get('.c-info-box').contains('you will receive an email to testoperator@example.com once your account is approved');
    });

    it('can create producer', function () {
      cy.visit('/');
      cy.get('div[role=button]').contains('Sign in').click();
      cy.get('a').contains('Register new producer').click();

      cy.get('#input-name').type('Super New Producer');
      cy.get('#input-details').type('Producer description');
      cy.selectOption('[name=operator_type]', 'E', 'Estate');
      cy.get('#input-website').type('wrong website');
      cy.get('#input-website').clear();
      cy.get('#input-website').type('https://example.com');
      cy.get('#input-address').type('Some address');
      cy.get('.file-dropzone').attachFile('acme-logo.png', { subjectType: 'drag-n-drop' });

      cy.selectOption('[name=country]', 'Ca', 'Cameroon');
      cy.selectOption('[name=fmus]', '100', '1001309');
      cy.selectOption('[name=fmus]', '07', '0702111');
      cy.get('button').contains('Create producer').click();
      cy.get('.c-form > p', {timeout: 35000}).should('have.text', 'Wait for approval.');
    });
  });

  context('Logged in User', () => {
    beforeEach(() => {
      cy.login('operator@example.com', 'Supersecret1');
    });

    it('can update user profile', function () {
      cy.get('div[role=button]').contains('My account').click();
      cy.get('a').contains('My profile').click();

      cy.get('#input-firstName').clear();
      cy.get('#input-firstName').type('New Test');
      cy.get('#input-lastName').clear();
      cy.get('#input-lastName').type('Operator 2');
      cy.selectOption('[name=locale]', 'Po', 'Português');
      cy.get('#input-password').type('GreatPassword1');
      cy.get('#input-passwordConfirmation').type('GreatPassword1');
      cy.get('#input-currentPassword').type('Supersecret1');

      cy.get('button').contains('Update').click();
      cy.get('.rrt-text').should('have.text', 'Profile saved correctly');
      cy.get('#input-password').should('have.value', '');
      cy.get('#input-passwordConfirmation').should('have.value', '');

      cy.reload();

      cy.get('#input-firstName').should('have.value', 'New Test');
      cy.get('#input-lastName').should('have.value', 'Operator 2');
      cy.get('#select-locale .react-select__single-value').contains('Português');

      cy.resetDB();
    });
  });
});
