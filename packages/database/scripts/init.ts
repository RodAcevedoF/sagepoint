import { PrismaClient, UserRole, OnboardingStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// ============================================================================
// Default Categories
// ============================================================================

const DEFAULT_CATEGORIES = [
  { name: 'Web Development', slug: 'web-development', description: 'Frontend, backend, and full-stack web development' },
  { name: 'Mobile Development', slug: 'mobile-development', description: 'iOS, Android, and cross-platform mobile apps' },
  { name: 'Machine Learning', slug: 'machine-learning', description: 'AI, deep learning, and neural networks' },
  { name: 'Data Science', slug: 'data-science', description: 'Data analysis, visualization, and statistics' },
  { name: 'DevOps', slug: 'devops', description: 'CI/CD, cloud infrastructure, and deployment' },
  { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Security, penetration testing, and cryptography' },
  { name: 'Cloud Computing', slug: 'cloud-computing', description: 'AWS, Azure, GCP, and cloud architecture' },
  { name: 'Databases', slug: 'databases', description: 'SQL, NoSQL, and database design' },
  { name: 'Programming Languages', slug: 'programming-languages', description: 'Python, JavaScript, Rust, Go, and more' },
  { name: 'System Design', slug: 'system-design', description: 'Architecture, scalability, and distributed systems' },
];

// ============================================================================
// Admin User Config
// ============================================================================

const ADMIN_USER = {
  email: process.env.ADMIN_EMAIL || 'admin@sagepoint.dev',
  password: process.env.ADMIN_PASSWORD || 'Admin123!',
  name: process.env.ADMIN_NAME || 'Admin',
};

// ============================================================================
// Main Script
// ============================================================================

async function main() {
  console.log('🚀 Initializing Sagepoint...\n');

  // 1. Create Categories
  console.log('📚 Creating categories...');
  let categoriesCreated = 0;
  let categoriesSkipped = 0;

  for (const category of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    if (existing) {
      categoriesSkipped++;
      continue;
    }

    await prisma.category.create({
      data: {
        id: randomUUID(),
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
    });
    categoriesCreated++;
  }

  console.log(`   ✅ Created: ${categoriesCreated}, Skipped: ${categoriesSkipped}\n`);

  // 2. Create Admin User
  console.log('👤 Creating admin user...');
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_USER.email },
  });

  if (existingAdmin) {
    console.log(`   ⏭️  Admin user already exists: ${ADMIN_USER.email}\n`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_USER.password, 10);

    await prisma.user.create({
      data: {
        id: randomUUID(),
        email: ADMIN_USER.email,
        name: ADMIN_USER.name,
        password: passwordHash,
        role: UserRole.ADMIN,
        isActive: true,
        isVerified: true,
        onboardingStatus: OnboardingStatus.COMPLETED,
      },
    });

    console.log(`   ✅ Created admin user: ${ADMIN_USER.email}`);
    console.log(`   📧 Email: ${ADMIN_USER.email}`);
    console.log(`   🔑 Password: ${ADMIN_USER.password}\n`);
  }

  console.log('✨ Sagepoint initialization complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Initialization failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
