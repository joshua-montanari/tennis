import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch all matches from the database
    const matches = await prisma.match.findMany({
      include: {
        player1: {
          select: { username: true },
        },
        player2: {
          select: { username: true },
        },
      },
    });

    // Respond with the match data
    res.status(200).json(matches);
  } catch (error) {
    // Handle any errors that occurred during the fetch
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  } finally {
    // Disconnect Prisma Client
    await prisma.$disconnect();
  }
}
