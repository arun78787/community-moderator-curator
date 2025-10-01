describe('Moderation Workflow', () => {
  beforeEach(() => {
    // Reset database state
    cy.task('db:seed');
  });

  it('should complete full moderation workflow', () => {
    // Step 1: User creates a post
    cy.visit('/login');
    cy.get('[data-cy=email-input]').type('user1@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();

    // Navigate to home and create post
    cy.visit('/');
    cy.get('[data-cy=create-post-button]').click();
    cy.get('[data-cy=post-content-input]').type('This is a test post that might be flagged');
    cy.get('[data-cy=submit-post-button]').click();

    // Verify post was created
    cy.contains('This is a test post that might be flagged').should('be.visible');

    // Step 2: Another user flags the post
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });

    cy.visit('/login');
    cy.get('[data-cy=email-input]').type('user2@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();

    // Find and flag the post
    cy.visit('/');
    cy.contains('This is a test post that might be flagged')
      .parent()
      .find('[data-cy=flag-button]')
      .click();

    // Fill out flag form
    cy.get('[data-cy=flag-reason-spam]').click();
    cy.get('[data-cy=flag-reason-text]').type('This looks like spam content');
    cy.get('[data-cy=submit-flag-button]').click();

    // Verify flag was submitted
    cy.contains('Post flagged successfully').should('be.visible');

    // Step 3: Moderator logs in and reviews flag
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });

    cy.visit('/login');
    cy.get('[data-cy=email-input]').type('moderator1@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();

    // Navigate to moderation queue
    cy.visit('/moderation');
    cy.contains('Moderation Queue').should('be.visible');

    // Find the flagged post
    cy.contains('This is a test post that might be flagged')
      .parent()
      .find('[data-cy=review-flag-button]')
      .click();

    // Review and approve the post
    cy.get('[data-cy=approve-button]').click();
    cy.get('[data-cy=action-reason]').type('Content is appropriate after review');
    cy.get('[data-cy=confirm-action-button]').click();

    // Verify action was taken
    cy.contains('Flag approved successfully').should('be.visible');

    // Step 4: Check analytics reflect the action
    cy.visit('/analytics');
    cy.contains('Moderation Analytics').should('be.visible');

    // Verify metrics updated
    cy.get('[data-cy=total-flags-metric]').should('contain', '1');
    cy.get('[data-cy=approved-flags-metric]').should('contain', '1');

    // Check moderation logs
    cy.visit('/moderation');
    cy.get('[data-cy=logs-tab]').click();
    cy.contains('Content is appropriate after review').should('be.visible');
  });

  it('should handle post removal workflow', () => {
    // Login as user and create potentially problematic post
    cy.login('user1@example.com', 'password123');
    cy.visit('/');
    
    cy.get('[data-cy=create-post-button]').click();
    cy.get('[data-cy=post-content-input]').type('Buy now! Limited time offer! Click here!');
    cy.get('[data-cy=submit-post-button]').click();

    // Flag the post
    cy.login('user2@example.com', 'password123');
    cy.visit('/');
    
    cy.contains('Buy now! Limited time offer!')
      .parent()
      .find('[data-cy=flag-button]')
      .click();
    
    cy.get('[data-cy=flag-reason-spam]').click();
    cy.get('[data-cy=flag-reason-text]').type('Clear spam content');
    cy.get('[data-cy=submit-flag-button]').click();

    // Moderator removes the post
    cy.login('moderator1@example.com', 'password123');
    cy.visit('/moderation');
    
    cy.contains('Buy now! Limited time offer!')
      .parent()
      .find('[data-cy=review-flag-button]')
      .click();
    
    cy.get('[data-cy=remove-button]').click();
    cy.get('[data-cy=action-reason]').type('Spam content removed');
    cy.get('[data-cy=confirm-action-button]').click();

    // Verify post is no longer visible on home page
    cy.visit('/');
    cy.contains('Buy now! Limited time offer!').should('not.exist');

    // Check analytics
    cy.visit('/analytics');
    cy.get('[data-cy=removed-flags-metric]').should('contain', '1');
  });

  it('should show real-time notifications', () => {
    // Login as moderator
    cy.login('moderator1@example.com', 'password123');
    cy.visit('/moderation');

    // In another session, create and flag a post
    cy.window().then((win) => {
      // Simulate real-time notification
      const socket = win.io('http://localhost:4000');
      socket.emit('moderation:new-flag', {
        flagId: 'test-flag-id',
        reason: 'spam',
        postContent: 'Test notification post',
      });
    });

    // Verify notification appears
    cy.get('[data-cy=notification-bell]').should('have.class', 'has-notifications');
    cy.get('[data-cy=notification-bell]').click();
    cy.contains('New content flagged').should('be.visible');
  });
});