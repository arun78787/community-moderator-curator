// Custom Cypress commands

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      createPost(content: string): Chainable<void>;
      flagPost(postId: string, reason: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:4000/api/auth/login',
    body: {
      email,
      password,
    },
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
  });
});

Cypress.Commands.add('createPost', (content: string) => {
  const token = window.localStorage.getItem('token');
  cy.request({
    method: 'POST',
    url: 'http://localhost:4000/api/posts',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      content,
    },
  });
});

Cypress.Commands.add('flagPost', (postId: string, reason: string) => {
  const token = window.localStorage.getItem('token');
  cy.request({
    method: 'POST',
    url: 'http://localhost:4000/api/flags',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      post_id: postId,
      reason_category: 'spam',
      reason_text: reason,
    },
  });
});