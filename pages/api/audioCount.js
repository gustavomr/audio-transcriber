import { PrismaClient } from '@prisma/client'
import { getSubFromToken } from '@/utils/auth';


export default async function handler(req, res) {
  const prisma = new PrismaClient()
  const sub = await getSubFromToken(req.headers.authorization);

  if (req.method == 'GET') {
   
    let db_response = await prisma.audio.aggregate({
      where: {
        userId: sub
      },
      _count: {
        id: true
      }
    })
   // console.log(db_response)
    res.status(200).json(db_response);
  }

   
  }