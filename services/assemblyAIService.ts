"use server";

import { AssemblyAI } from 'assemblyai'; // Ensure you have the correct import for AssemblyAI

export const createAssemblyAIClient = async () => {
  return new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || '',
  });
}; 