Cypress.on('uncaught:exception', err => !err.message.includes('ResizeObserver loop limit exceeded') &&
  !err.message.includes('ResizeObserver loop completed with undelivered notifications'));
