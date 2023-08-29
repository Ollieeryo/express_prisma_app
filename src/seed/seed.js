const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDatabase() {
  const users = [
    { username: 'admin@example.com', password: '12345678', role: 1 },
    { username: 'user1@example.com', password: '12345678', role: 2 },
    { username: 'user2@example.com', password: '12345678', role: 2 }
  ];

  for (const user of users) {
    const hashPassword = await bcrypt.hash(user.password, 10);

    await prisma.users.create({
      data: {
        username: user.username,
        hashPassword: hashPassword,
        role: user.role,
      }
    });
  }

  console.log('Seed data inserted successfully.');
}

seedDatabase()
  .catch(error => {
    console.error('Error seeding database:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// 另一種種子資料範例
// async function seed() {
//   const users = [
//     {
//       username: 'user1',
//       password: await bcrypt.hash('password123', 10),
//       role: 1,
//     },
//     {
//       username: 'user2',
//       password: await bcrypt.hash('password456', 10),
//       role: 2,
//     },
//     // ... add more seed data
//   ];

//   for (const user of users) {
//     await prisma.user.create({
//       data: {
//         username: user.username,
//         hashPassword: user.password,
//         role: user.role,
//       },
//     });
//   }

//   console.log('Seed data inserted successfully.');
// }

// seed()
//   .catch((error) => {
//     console.error('Error seeding database:', error);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });