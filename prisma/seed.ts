import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "caleb@example.com";
  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });

  console.log(`✓ User: ${user.email}`);

  // Clear existing entries for this user before re-seeding
  await prisma.quietTime.deleteMany({ where: { userId: user.id } });

  const entries = await prisma.quietTime.createMany({
    data: [
      {
        userId: user.id,
        date: new Date("2026-06-19T07:30:00"),
        reference: "Psalm 23",
        verse: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters.",
        details: "The image of a shepherd who provides rest and calm is striking. David wasn't writing theory — he knew what it was to lead sheep. He's saying God leads with the same intimacy.",
        reflection: "I've been anxious about the future but this psalm is a reminder that want isn't the default state when God is the shepherd. I want to trust that more.",
        tag: "trust",
        positionX: 12,
        positionY: 15,
        rotation: -3.2,
      },
      {
        userId: user.id,
        date: new Date("2026-06-20T06:45:00"),
        reference: "John 15 : 4–5",
        verse: "Abide in me, and I in you. As the branch cannot bear fruit by itself, unless it abides in the vine, neither can you, unless you abide in me. I am the vine; you are the branches.",
        details: "The word 'abide' appears over and over. It's not a one-time act — it's a continuous staying. A branch doesn't strain to produce fruit. It just stays connected.",
        reflection: "I keep trying to produce fruit through effort. But Jesus is saying the effort is in staying, not in doing. What does staying look like for me today?",
        tag: "abiding",
        positionX: 38,
        positionY: 22,
        rotation: 2.8,
      },
      {
        userId: user.id,
        date: new Date("2026-06-21T07:10:00"),
        reference: "Isaiah 40 : 31",
        verse: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.",
        details: "Three tiers of movement — soaring, running, walking. Interestingly the most ordinary (walking) is listed last, not first. Maybe enduring the ordinary is the deeper miracle.",
        reflection: "I find waiting hard. But the promise here isn't just for dramatic moments — it's for the long, slow days too. Lord, renew my strength in the waiting.",
        tag: "waiting",
        positionX: 62,
        positionY: 35,
        rotation: -1.5,
      },
    ],
  });

  console.log(`✓ Created ${entries.count} QuietTime entries`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
