import { AssemblyAI } from 'assemblyai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {

  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    return Response.error();
  }

  const  body  = await req.json();

  const client = new AssemblyAI({ apiKey: apiKey });

  const transcription = await client.transcripts.transcribe(body)
  
  return NextResponse.json(transcription);
}