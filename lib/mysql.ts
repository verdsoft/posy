// DEPRECATED: This file exists for backward compatibility only
// All new code should use Prisma from @/lib/prisma

export const getConnection = () => {
  throw new Error('MySQL connection deprecated. Use Prisma instead.')
}

export const getTransactionConnection = () => {
  throw new Error('MySQL connection deprecated. Use Prisma instead.')
}