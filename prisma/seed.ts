import { PrismaClient } from "@prisma/client";
import { APP_ROLES, LEGACY_ADMIN_ROLE } from "@/lib/auth/roles";
import { hashPassword, normalizeEmail } from "@/lib/auth/password";
import { BILLING_PLAN_CATALOG } from "@/lib/billing/plans";

const prisma = new PrismaClient();

function cloneJson(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(value));
}

async function seedSystemAdmin() {
  const adminEmail = normalizeEmail(
    process.env.ADMIN_SEED_EMAIL ?? "77nimesh@gmail.com"
  );
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "Password123!";
  const adminName = process.env.ADMIN_SEED_NAME?.trim() || "Nimesh Gamage";
  const now = new Date();

  await prisma.user.updateMany({
    where: {
      role: LEGACY_ADMIN_ROLE,
    },
    data: {
      role: APP_ROLES.ADMIN_SYSTEM,
    },
  });

  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        role: APP_ROLES.ADMIN_SYSTEM,
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
      role: APP_ROLES.ADMIN_SYSTEM,
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

  return {
    admin,
    adoptedResumeCount: adoptedResumes.count,
  };
}

async function seedBillingPlans() {
  const seededPlanSummaries: string[] = [];

  for (const plan of BILLING_PLAN_CATALOG) {
    const metadata = cloneJson(plan.metadata);

    const seededPlan = await prisma.plan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        description: plan.description,
        status: plan.status,
        billingMode: plan.billingMode,
        currency: plan.currency,
        amountCents: plan.amountCents,
        templateLimit: plan.templateLimit,
        exportEnabled: plan.exportEnabled,
        exportResumeScoped: plan.exportResumeScoped,
        downloadLimit: plan.downloadLimit,
        entitlementDurationDays: plan.entitlementDurationDays,
        isPublic: plan.isPublic,
        sortOrder: plan.sortOrder,
        metadata,
      },
      create: {
        code: plan.code,
        name: plan.name,
        description: plan.description,
        status: plan.status,
        billingMode: plan.billingMode,
        currency: plan.currency,
        amountCents: plan.amountCents,
        templateLimit: plan.templateLimit,
        exportEnabled: plan.exportEnabled,
        exportResumeScoped: plan.exportResumeScoped,
        downloadLimit: plan.downloadLimit,
        entitlementDurationDays: plan.entitlementDurationDays,
        isPublic: plan.isPublic,
        sortOrder: plan.sortOrder,
        metadata,
      },
    });

    seededPlanSummaries.push(`${seededPlan.code} (${seededPlan.status})`);
  }

  return seededPlanSummaries;
}

async function main() {
  const { admin, adoptedResumeCount } = await seedSystemAdmin();
  const seededPlanSummaries = await seedBillingPlans();

  console.log(
    [
      `Seeded system admin user: ${admin.email}`,
      `Admin role: ${admin.role}`,
      `Claimed orphan resumes: ${adoptedResumeCount}`,
      `Seeded billing plans: ${seededPlanSummaries.join(", ")}`,
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