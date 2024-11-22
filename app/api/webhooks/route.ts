import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

export async function POST(req: Request) {

  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  const { id } = evt.data
  const eventType = evt.type
  const prisma = new PrismaClient();
  if (eventType === 'user.created') {
      console.log('user.created')

      const existingUser = await prisma.user.findFirst({
        where: {
          email: evt.data.email_addresses[0]?.email_address
        }
      })

      if (existingUser) {

        const user = await prisma.user.update({
          where: {
            id: existingUser.id
          },
          data: {
            name: `${evt.data.first_name} ${evt.data.last_name}`,
            imageUrl: evt.data.image_url,
            clerkId: evt.data.id,
            plan: "FREE",
          }
        })

      } else {
   
        const user = await prisma.user.create({
          data: {
          // id: evt.data.id,
            email: evt.data.email_addresses[0]?.email_address,
            name: `${evt.data.first_name} ${evt.data.last_name}`,
            imageUrl: evt.data.image_url,
            clerkId: evt.data.id,
            plan: "FREE",
            amount: parseInt(process.env.FREE_CREDITS_IN_SECONDS || '0', 10) //in seconds
            // Add any other fields you need
          }
       
      })
    }
   }
  
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
  console.log('Webhook payload:', body)

  return new Response('Webhook received', { status: 200 })
}