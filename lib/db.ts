import { PrismaClient } from '@prisma/client';

declare global {
    var prisma: PrismaClient | undefined;
}
export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = db;
}

// globalThis id not affecting by hot reload because it is not a module its a global object
