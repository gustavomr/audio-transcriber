import { PrismaClient } from '@prisma/client'
import { getSubFromToken } from '@/utils/auth';


export default async function handler(req, res) {
  const prisma = new PrismaClient()


  if (req.method == 'PUT') {
    
        const body =  await req.body;
        const {creditsToSubtract} = JSON.parse(body)
        const sub = await getSubFromToken(req.headers.authorization);

        // Get current user data
        const user = await prisma.user.findFirst({
            where: {
                clerkId: sub
            }
        });
        const currentCredits = (user.amount) || 0;
        
        // Calculate new credits
        const newCredits = Math.max(currentCredits - creditsToSubtract, 0); // Prevent negative credits
        console.log(newCredits);
        // Update user metadata with new credits
        let db_response = await prisma.user.update({
          where: {
            clerkId: sub
          }, 
          data: {
            amount: newCredits,
          }
        });
    
        res.status(200).json(db_response);

    }
  }