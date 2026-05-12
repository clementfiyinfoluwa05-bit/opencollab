const pool = require('./src/config/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

const seed = async () => {
  console.log('🌱 Seeding database...');

  // Clear existing data (order matters due to foreign keys)
  await pool.query('DELETE FROM applications');
  await pool.query('DELETE FROM projects');
  await pool.query('DELETE FROM users WHERE email != $1', ['test@example.com']);

  // Create 3 fictional users
  const hash = await bcrypt.hash('password123', 10);

  const u1 = await pool.query(
    `INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id`,
    ['Alex Morgan', 'alex@dev.com', hash]
  );
  const u2 = await pool.query(
    `INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id`,
    ['Priya Sharma', 'priya@dev.com', hash]
  );
  const u3 = await pool.query(
    `INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id`,
    ['Marcus Johnson', 'marcus@dev.com', hash]
  );

  const alexId   = u1.rows[0].id;
  const priyaId  = u2.rows[0].id;
  const marcusId = u3.rows[0].id;

  console.log('✅ Users created');

  // Create 10 projects across 3 users
  const projects = [
    {
      user_id: alexId,
      name: 'DevHire — Job Board for Developers',
      description: 'A niche job board specifically for software developers. Features include skill-based filtering, salary transparency, and company culture ratings. We want to make job hunting less painful for devs.',
      stack_tags: ['React', 'Node.js', 'PostgreSQL', 'Tailwind'],
      roles_needed: ['Backend Developer', 'UI Designer'],
      commitment: 'Serious'
    },
    {
      user_id: alexId,
      name: 'CodeReview.ai — AI Powered Code Reviews',
      description: 'A tool that uses AI to review your pull requests and suggest improvements based on best practices. Integrates with GitHub. Currently in early prototype stage and looking for collaborators.',
      stack_tags: ['Python', 'FastAPI', 'React', 'OpenAI API'],
      roles_needed: ['ML Engineer', 'Frontend Developer'],
      commitment: 'Part-time'
    },
    {
      user_id: alexId,
      name: 'Budgetr — Personal Finance Tracker',
      description: 'A simple but powerful personal finance app that connects to your bank via Plaid API, categorizes your spending automatically, and gives you weekly insights. Mobile-first design.',
      stack_tags: ['React Native', 'Node.js', 'MongoDB', 'Plaid API'],
      roles_needed: ['React Native Developer', 'UI/UX Designer'],
      commitment: 'Part-time'
    },
    {
      user_id: alexId,
      name: 'StudyCircle — Virtual Study Rooms',
      description: 'A Pomodoro-based virtual study room app where students can study together online. Includes ambient sounds, progress tracking, and accountability features.',
      stack_tags: ['Next.js', 'Socket.io', 'PostgreSQL'],
      roles_needed: ['Full Stack Developer', 'Sound Designer'],
      commitment: 'Casual'
    },
    {
      user_id: priyaId,
      name: 'RecipeVault — Smart Recipe Manager',
      description: 'An app that lets you save recipes from any website, scale ingredients automatically, and generate a shopping list. Also suggests recipes based on what you already have in your fridge.',
      stack_tags: ['Vue.js', 'Django', 'PostgreSQL', 'Redis'],
      roles_needed: ['Frontend Developer', 'Mobile Developer'],
      commitment: 'Casual'
    },
    {
      user_id: priyaId,
      name: 'DevBlog — Blogging Platform for Developers',
      description: 'A Medium-alternative built specifically for developers. Supports code syntax highlighting, embedded sandboxes, and GitHub Gist integration. Markdown-first editor.',
      stack_tags: ['Next.js', 'GraphQL', 'PostgreSQL', 'AWS S3'],
      roles_needed: ['Backend Developer', 'DevOps Engineer'],
      commitment: 'Serious'
    },
    {
      user_id: priyaId,
      name: 'OpenMentor — Peer Mentorship Platform',
      description: 'Connect junior developers with senior mentors for free 1-on-1 sessions. Schedule management, session notes, and progress tracking built in. Fighting the gatekeeping in tech.',
      stack_tags: ['React', 'Express', 'PostgreSQL', 'Calendly API'],
      roles_needed: ['Frontend Developer', 'Backend Developer', 'UI Designer'],
      commitment: 'Part-time'
    },
    {
      user_id: marcusId,
      name: 'GameNight — Board Game Night Organizer',
      description: 'App to organize board game nights with friends. Track your game library, suggest games based on player count and mood, handle RSVPs and score tracking.',
      stack_tags: ['React', 'Firebase', 'Node.js'],
      roles_needed: ['Frontend Developer', 'Mobile Developer'],
      commitment: 'Casual'
    },
    {
      user_id: marcusId,
      name: 'FreelanceFlow — CRM for Freelancers',
      description: 'A lightweight CRM tool built for freelancers to track clients, projects, invoices, and deadlines in one place. Includes time tracking and automated invoice generation.',
      stack_tags: ['React', 'Node.js', 'PostgreSQL', 'Stripe API'],
      roles_needed: ['Full Stack Developer', 'UI/UX Designer'],
      commitment: 'Serious'
    },
    {
      user_id: marcusId,
      name: 'MapMyRun — Community Running Tracker',
      description: 'A social running app where you log runs on a map, join local running clubs, and compete in monthly challenges. Think Strava but community-first and open source.',
      stack_tags: ['React Native', 'Node.js', 'PostgreSQL', 'Google Maps API'],
      roles_needed: ['Mobile Developer', 'Backend Developer'],
      commitment: 'Part-time'
    }
  ];

  const projectIds = [];
  for (const p of projects) {
    const res = await pool.query(
      `INSERT INTO projects (user_id, name, description, stack_tags, roles_needed, commitment)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [p.user_id, p.name, p.description,
       JSON.stringify(p.stack_tags), JSON.stringify(p.roles_needed), p.commitment]
    );
    projectIds.push(res.rows[0].id);
  }

  console.log('✅ Projects created');

  // Get test user id
  const testUser = await pool.query('SELECT id FROM users WHERE email = $1', ['test@example.com']);
  const testId = testUser.rows[0]?.id;

  // Add applications — each project gets 1-2 applications
  const applications = [
    { project_id: projectIds[0], user_id: priyaId,  message: 'I have 3 years of Node.js experience and would love to help build the backend API.', github_url: 'https://github.com/priyasharma' },
    { project_id: projectIds[0], user_id: marcusId, message: 'I am a UI designer with experience in design systems. Tailwind is my favourite tool.', github_url: 'https://github.com/marcusjohnson' },
    { project_id: projectIds[1], user_id: marcusId, message: 'I work with ML models daily and have experience with the OpenAI API. Very interested!', github_url: 'https://github.com/marcusjohnson' },
    { project_id: projectIds[2], user_id: priyaId,  message: 'React Native is my main stack. I have shipped 3 apps to the App Store.', github_url: 'https://github.com/priyasharma' },
    { project_id: projectIds[3], user_id: marcusId, message: 'Love this idea! I can help with the Socket.io real-time features.', github_url: 'https://github.com/marcusjohnson' },
    { project_id: projectIds[4], user_id: alexId,   message: 'Vue.js is my primary framework. Would love to build the recipe scaling feature.', github_url: 'https://github.com/alexmorgan' },
    { project_id: projectIds[5], user_id: marcusId, message: 'I have set up GraphQL APIs before and know AWS S3 well. Let us build this!', github_url: 'https://github.com/marcusjohnson' },
    { project_id: projectIds[6], user_id: alexId,   message: 'This project is close to my heart. I was a bootcamp grad and had no mentor. Happy to help.', github_url: 'https://github.com/alexmorgan' },
    { project_id: projectIds[7], user_id: priyaId,  message: 'Firebase and React are my comfort zone. Board games are my hobby too!', github_url: 'https://github.com/priyasharma' },
    { project_id: projectIds[8], user_id: alexId,   message: 'I built a similar invoicing tool before. Happy to contribute the Stripe integration.', github_url: 'https://github.com/alexmorgan' },
    { project_id: projectIds[9], user_id: priyaId,  message: 'React Native developer here. I run 5k every morning so this project is perfect for me!', github_url: 'https://github.com/priyasharma' },
  ];

  // Add test user applications if they exist
  if (testId) {
    applications.push(
      { project_id: projectIds[5], user_id: testId, message: 'I would love to contribute to DevBlog as a backend developer!', github_url: 'https://github.com/testuser' },
      { project_id: projectIds[9], user_id: testId, message: 'MapMyRun sounds amazing. I can help with the Google Maps integration.', github_url: 'https://github.com/testuser' }
    );
  }

  for (const app of applications) {
    await pool.query(
      `INSERT INTO applications (project_id, user_id, message, github_url)
       VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
      [app.project_id, app.user_id, app.message, app.github_url]
    );
  }

  console.log('✅ Applications created');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('Test accounts (all use password: password123):');
  console.log('  alex@dev.com');
  console.log('  priya@dev.com');
  console.log('  marcus@dev.com');

  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
