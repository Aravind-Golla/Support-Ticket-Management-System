const bcrypt = require('bcrypt');

async function main() {
  const password = process.argv[2] || 'Password123';
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
