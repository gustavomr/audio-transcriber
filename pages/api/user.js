import { PrismaClient } from '@prisma/client'
import { getSubFromToken } from '@/utils/auth';



export default async function handler(req, res) {
  const prisma = new PrismaClient()

  if (req.method == 'POST') {
    const body = await req.body;
    const { filename, length, audioPublicId, url, user, status  } = JSON.parse(body);
    let db_response = await prisma.audio.create({
      data: {
        filename,
        length,
        audioPublicId,
        url,
        user,
        status

      },
    })
    res.status(200).json(db_response);
  }

  if (req.method == 'GET') {
    //const userId = req.query.userId;
    const sub = await getSubFromToken(req.headers.authorization);
    console.log("SUBBBB",sub)
    let db_response = await prisma.user.findFirst({
      where: {
        clerkId: sub
      }
    })
   // console.log(db_response)
    res.status(200).json(db_response);
  }

   
  }