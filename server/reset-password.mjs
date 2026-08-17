import { createUser } from './auth.js';
import { exec } from './db.js';

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('usage: node server/reset-password.mjs <email> <new-password>');
  process.exit(1);
}

const user = await createUser(email, password);
const { affectedRows } = await exec('delete from sessions where user_id = $1', [user.id]);
console.log(`password reset for ${user.email} (id ${user.id}); ${affectedRows} old session(s) cleared`);
process.exit(0);
