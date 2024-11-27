
import { AssemblyAI } from 'assemblyai'; // Ensure you have the correct import for AssemblyAI

export const createAssemblyAIClient = async () => {
  console.log("API",process.env.ASSEMBLYAI_API_KEY)
  return new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY || '',
  });
}; 