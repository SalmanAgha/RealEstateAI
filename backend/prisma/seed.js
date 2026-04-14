const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@saas.com' },
    update: {},
    create: {
      email: 'admin@saas.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      subscription: 'enterprise',
      status: 'active'
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@saas.com' },
    update: {},
    create: {
      email: 'user@saas.com',
      name: 'Normal User',
      password: hashedPassword,
      role: 'user',
      subscription: 'pro',
      status: 'active'
    },
  });

  console.log({ admin, user });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
