import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from './config/database';
import { User } from './models/User';
import { Post } from './models/Post';
import { aiService } from './services/aiService';

async function main() {
  try {
    await sequelize.authenticate();
    console.log('DB connected.');

    // Ensure schema exists (safe for demo)
    await sequelize.sync({ alter: true });

    // Create admin
    const admin = await User.create({
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin'
    });
    await admin.setPassword('admin123'); await admin.save();

    // Create moderator
    const mod = await User.create({
      email: 'moderator@example.com',
      name: 'Moderator',
      role: 'moderator'
    });
    await mod.setPassword('mod123'); await mod.save();

    // Create a couple of normal users
    const alice = await User.create({ email: 'alice@example.com', name: 'Alice', role: 'user' });
    await alice.setPassword('alice123'); await alice.save();

    const bob = await User.create({ email: 'bob@example.com', name: 'Bob', role: 'user' });
    await bob.setPassword('bob123'); await bob.save();

    // Create sample posts
    const posts = [
      { authorId: alice.id, content: 'Hello community! This is a friendly post.' },
      { authorId: bob.id, content: 'Limited time offer, buy now! Free money!' }, // spam-like for AI
      { authorId: alice.id, content: 'I hate this product, it is the worst!' } // toxic-ish
    ];

    for (const p of posts) {
      const post = await Post.create({
        author_id: p.authorId,
        content: p.content,
        status: 'active' // or 'pending'
      });

      // Run AI analysis (will use mock if OPENAI_API_KEY not set)
      try {
        const analysis = await aiService.analyzeText(post.content, post.id);
        console.log(`AI analysis for post ${post.id}:`, analysis.labels, analysis.overall_risk);
      } catch (e) {
        console.warn('AI analysis failed for post', post.id, e);
      }
    }

    console.log('Seeding complete. Created admin/moderator/users/posts.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error', err);
    process.exit(1);
  }
}

main();
