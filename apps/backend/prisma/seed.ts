import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as bcrypt from 'bcrypt'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10)

    const user = await prisma.user.upsert({
        where: { email: 'test@devflow.com' },
        update: {},
        create: {
            email: 'test@devflow.com',
            password: hashedPassword,
            name: 'Test User',
        },
    })

    // Create workspace
    const workspace = await prisma.workspace.create({
        data: {
            name: 'My First Workspace',
            description: 'Default workspace',
            userId: user.id,
        },
    })

    // Create project
    const project = await prisma.project.create({
        data: {
            name: 'DevFlow AI',
            description: 'Building DevFlow AI',
            status: 'active',
            workspaceId: workspace.id,
        },
    })

    // Create note
    await prisma.note.create({
        data: {
            title: 'Getting Started',
            content: '# Welcome to DevFlow AI\nStart building!',
            tags: ['welcome', 'getting-started'],
            userId: user.id,
            projectId: project.id,
        },
    })

    console.log('✅ Database seeded successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })