const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const commonTags = [
  { name: "Music", description: "Music concerts and performances" },
  { name: "Sports", description: "Sports events and competitions" },
  { name: "Conference", description: "Business and professional conferences" },
  { name: "Workshop", description: "Educational and hands-on workshops" },
  { name: "Theater", description: "Theater performances and plays" },
  { name: "Comedy", description: "Comedy shows and stand-up performances" },
  { name: "Food & Drink", description: "Food festivals and culinary events" },
  { name: "Art", description: "Art exhibitions and galleries" },
  { name: "Technology", description: "Tech conferences and meetups" },
  { name: "Networking", description: "Business networking events" },
  { name: "Fitness", description: "Fitness classes and sports activities" },
  { name: "Family", description: "Family-friendly events" },
  { name: "Charity", description: "Charity and fundraising events" },
  { name: "Film", description: "Film screenings and festivals" },
  { name: "Dance", description: "Dance performances and classes" },
  { name: "Literature", description: "Book readings and literary events" },
  { name: "Fashion", description: "Fashion shows and events" },
  { name: "Gaming", description: "Gaming tournaments and events" },
  { name: "Education", description: "Educational seminars and courses" },
  { name: "Outdoor", description: "Outdoor activities and events" },
];

async function main() {
  console.log("Start seeding...");

  for (const tag of commonTags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
