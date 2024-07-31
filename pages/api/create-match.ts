import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

interface CreateMatchRequestBody {
  player1Id: number;
  player2Id: number;
  location: string;
  score: string[];  // Array of scores
}

const createMatch = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { player1Id, player2Id, location, score }: CreateMatchRequestBody = req.body;

    if (!player1Id || !player2Id || !location || !score) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      const newMatch = await prisma.match.create({
        data: {
          player1: {
            connect: { id: player1Id },
          },
          player2: {
            connect: { id: player2Id },
          },
          location,
          score,
        },
      });

      res.status(200).json(newMatch);
    } catch (error) {
      res.status(500).json({ error: 'Error creating match' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default createMatch;