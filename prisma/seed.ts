import { PrismaClient } from "@prisma/client";
import { hashPassword, normalizeEmail } from "../lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = normalizeEmail(
    process.env.ADMIN_SEED_EMAIL ?? "77nimesh@gmail.com"
  );
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "ChangeMe123!";
  const adminName = process.env.ADMIN_SEED_NAME?.trim() || "Nimesh Gamage";
  const now = new Date();

  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        role: "ADMIN",
        emailVerified: now,
        passwordHash: await hashPassword(adminPassword),
      },
    });
  } else {
    const updateData: {
      role: string;
      emailVerified: Date;
      name?: string;
    } = {
      role: "ADMIN",
      emailVerified: admin.emailVerified ?? now,
    };

    if (!admin.name) {
      updateData.name = adminName;
    }

    admin = await prisma.user.update({
      where: { id: admin.id },
      data: updateData,
    });
  }

  const adoptedResumes = await prisma.resume.updateMany({
    where: { userId: null },
    data: { userId: admin.id },
  });

  console.log(
    [
      `Seeded admin user: ${admin.email}`,
      `Admin role: ${admin.role}`,
      `Claimed orphan resumes: ${adoptedResumes.count}`,
      "If you want a custom initial admin password, set ADMIN_SEED_PASSWORD before running the seed.",
    ].join("\n")
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seeding failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });