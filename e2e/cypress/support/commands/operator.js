Cypress.Commands.add('docExpandCategory', (categoryName) => {
  cy.get('.c-doc-gallery .doc-by-category-desc .c-title')
    .contains(categoryName)
    .parents('.c-doc-by-category')
    .contains('button', 'Expand')
    .click();
});

Cypress.Commands.add('docCollapseCategory', (categoryName) => {
  cy.get('.c-doc-gallery .doc-by-category-desc .c-title')
    .contains(categoryName)
    .parents('.c-doc-by-category')
    .contains('button', 'Collapse')
    .click();
});

Cypress.Commands.add('docGetFMUDocCard', (fmuName, documentName) => {
  return cy.get('.doc-by-category-desc')
    .contains(fmuName)
    .parents('.fmu-item')
    .contains('.doc-card-title', documentName)
    .parents('.c-doc-card');
});

Cypress.Commands.add('docGetProducerDocCard', (documentName) => {
  return cy.get('.doc-gallery-producer-docs')
    .contains('.doc-card-title', documentName)
    .parents('.c-doc-card');
});
