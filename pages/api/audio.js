import { PrismaClient } from '@prisma/client'
import { getSubFromToken } from '@/utils/auth';


export default async function handler(req, res) {
  const prisma = new PrismaClient()

  if (req.method == 'POST') {
    const body = await req.body;
    const { filename, length, audioPublicId, url, status  } = JSON.parse(body);
    const sub = await getSubFromToken(req.headers.authorization);

    let db_response = await prisma.audio.create({
      data: {
        filename,
        length,
        audioPublicId,
        url,
        userId: sub,
        status

      },
    })
    res.status(200).json(db_response);
  }

  if (req.method == 'PUT') {
    const body = await req.body;
    const { id, transcription, status  } = JSON.parse(body);

    let db_response = await prisma.audio.update({
      where: {
        id,
      },
      data: {
        transcription,
        status,
        updatedAt: new Date()
      },
    })
    console.log(db_response)
    res.status(200).json(db_response);
  }

  if (req.method == 'GET') {
    console.log(req.query)
    const sub = await getSubFromToken(req.headers.authorization);

    const skip = req.query.skip;
    const take = req.query.take;

    let db_response = await prisma.audio.findMany({
      orderBy: [
        {
          createdAt: 'desc',
        }
      ],
      where: {
        userId: sub
      },
      skip: parseInt(skip) || 0,
      take: parseInt(take) || 4,
    })
   // console.log(db_response)
    res.status(200).json(db_response);
  }

   
  }