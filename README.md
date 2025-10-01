# Community Moderator & Content Curator

An AI-powered content moderation and curation platform for online communities.  
Built with **React, Node.js, PostgreSQL**, and integrated AI services.

---

## 🚀 Features
- AI-powered text & image moderation (OpenAI GPT-4/GPT-4V)
- Role-based access (User, Moderator, Admin)
- Real-time notifications (Socket.io)
- Post CRUD with media uploads
- Flagging & moderation queues
- Analytics dashboard with charts
- Secure: JWT auth, rate limiting, input validation
- Full-stack TypeScript

---

## 🛠 Tech Stack
- **Frontend:** React 18, Vite, Tailwind, React Router, Socket.io Client
- **Backend:** Node.js, Express, Sequelize (Postgres), Socket.io, JWT
- **Database:** PostgreSQL 15
- **Infra:** Docker, Docker Compose
- **AI:** OpenAI GPT-4 / GPT-4V (optional)

---

## 📋 Prerequisites
- Node.js 18+
- Docker (or local PostgreSQL 15)
- OpenAI API key (optional)

---

## ⚡ Quick Start

### 1. Clone Repo
```bash
git clone <repo-url>
cd community-moderator-curator

# Login Accounts

After running `npm run seed:dev`, you can log in with the following accounts:

* * - **Admin**
    *   - Email: admin@example.com
    *   - Password: password123
    * 
* - **Moderator**
    *   - Email: moderator@example.com
    *   - Password: password123
    * 
* * - **Test User**
    *   - Email: user@example.com
    *   - Password: password123
    * 
(You can also register your own accounts via **Sign Up**.)