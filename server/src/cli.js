'use strict';
// User management without a UI:
//   node src/cli.js list-users
//   node src/cli.js add-user <email> <password> [name]
//   node src/cli.js set-password <email> <password>
//   node src/cli.js remove-user <email>
// Stop the service first or run it while running — SQLite handles the short write.
const db = require('./db');

async function main() {
  const [cmd, email, password, name] = process.argv.slice(2);
  await db.open();
  switch (cmd) {
    case 'list-users': {
      const emails = [...new Set((await db.users.list()).map((u) => u.email))];
      console.log(emails.join('\n') || '(no users)');
      break;
    }
    case 'add-user':
      if (!email || !password) throw new Error('usage: add-user <email> <password> [name]');
      await db.users.add({ email, password, name: name || 'HeatingPI User' });
      console.log(`Added ${email}.`);
      break;
    case 'set-password':
      if (!email || !password) throw new Error('usage: set-password <email> <password>');
      console.log(`Updated ${await db.users.setPassword(email, password)} row(s).`);
      break;
    case 'remove-user':
      if (!email) throw new Error('usage: remove-user <email>');
      console.log(`Removed ${await db.users.remove(email)} row(s).`);
      break;
    default:
      console.log('Commands: list-users | add-user <email> <password> [name] | set-password <email> <password> | remove-user <email>');
  }
  await db.close();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
