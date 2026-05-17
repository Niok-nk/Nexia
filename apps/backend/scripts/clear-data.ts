import prisma from '../src/db/index.js';

async function clearData() {
  console.log('Borrando todos los datos...');
  
  await prisma.note.deleteMany();
  await prisma.message.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.contact.deleteMany();
  
  console.log('Datos borrados correctamente');
  await prisma.$disconnect();
}

clearData().catch(console.error);