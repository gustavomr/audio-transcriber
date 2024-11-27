"use client"
import React, { useState } from 'react';
import FileUpload from '@/components/fileupload';
import TranscriptionHistory, { Transcription } from '@/components/transcriptionhistory';
import TranscriptionView from '@/components/transcriptionview';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from '@clerk/nextjs';
import { Status } from '@/components/transcriptionhistory';
import { userContext } from '@/context/UserContext';
import { User } from '@prisma/client';
import { uploadToCloudinary } from '@/services/cloudinaryService';
import { createAssemblyAIClient } from '@/services/assemblyAIService'; // Import the AssemblyAI service

interface CloudinaryResponse {
  duration: number;
  public_id: string;
  url: string;
}

interface AudioDBResponse {
  id: number;
  filename: string;
  status: string;
  createdAt: string;
  url: string;
  transcription: string;
}

export default function Dashboard() {
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { setAmount } = userContext();



  const updateUserCredits = async (creditsToSubtract: number) => {
    try {

      const body = JSON.stringify({
        creditsToSubtract
      });

      const response = await fetch('/api/credits', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + await getToken(),
        },
        body
      });

      const credits = await response.json();
      console.log('Credits', credits);
      setAmount(credits.amount)
  
      if (!response.ok) {
        throw new Error('Failed to update credits');
      }
  
      return "";
    } catch (error) {
      console.error('Error updating credits:', error);
      throw error;
    }
  };

 

  const getAllAudiosByUser = async (skip: number, take: number) => {

    const response = await fetch('/api/audio?skip='+skip+"&take="+take, {
      method: "GET",
      headers: {
        'Authorization': 'Bearer ' + await getToken()
      }
    });

    const audios = await response.json();
    setTranscriptions(audios);
     if (!response.ok) {
      throw new Error('Database get failed');
    }
  };

  const saveToDatabase = async (
    filename: string,
    cloudinaryData: CloudinaryResponse,
  ): Promise<AudioDBResponse> => {
    const body = JSON.stringify({
      filename,
      length: cloudinaryData.duration,
      audioPublicId: cloudinaryData.public_id,
      url: cloudinaryData.url,
      status: "CREATED"
    });

    const response = await fetch('/api/audio', {
      headers: {
        'Authorization': `Bearer ` + await getToken()
      },
      method: "POST",
      body
    });

    if (!response.ok) {
      throw new Error('Database save failed');
    }

    return response.json();
  };


  const updateDatabase = async (
    id: number,
    transcription: string,
    status: string
  ): Promise<AudioDBResponse> => {
    const body = JSON.stringify({
      id,
      transcription,
      status
    });


    const response = await fetch('/api/audio', {
      method: "PUT",
      body
    });


    

    if (!response.ok) {
      throw new Error('Database save failed');
    }

    return response.json();
  };

  
  

  const updateTranscriptionsList = (dbResponse: AudioDBResponse) => {
    setTranscriptions(prevTranscriptions => {
      // Find if transcription with this ID already exists
      const existingIndex = prevTranscriptions.findIndex(
        t => t.id === dbResponse.id
      );
  
      // If found, replace it; if not, add new
      if (existingIndex !== -1) {
        const updatedTranscriptions = [...prevTranscriptions];
        updatedTranscriptions[existingIndex] = {
          id: dbResponse.id,
          filename: dbResponse.filename,
          status: dbResponse.status as Status,
          createdAt: new Date(dbResponse.createdAt),
          url: dbResponse.url,
          transcription: dbResponse.transcription
        };
        return updatedTranscriptions;
      } else {
        // Add new transcription if not found
        return [{
          id: dbResponse.id,
          filename: dbResponse.filename,
          status: dbResponse.status as Status,
          createdAt: new Date(dbResponse.createdAt),
          url: dbResponse.url,
          transcription: dbResponse.transcription
        }, ...prevTranscriptions];
      }
    });
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const reader = new FileReader();
  
      reader.onload = (e) => {
        if (e.target?.result) {
          audio.src = e.target.result as string;
          
          // This event fires when the audio duration is available
          audio.ondurationchange = () => {
            const duration = Math.round(audio.duration); // Round to nearest second
            resolve(duration);
          };
  
          // Handle errors
          audio.onerror = () => {
            reject(new Error('Error getting audio duration'));
          };
        }
      };
  
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
  
      // Read the file as a data URL
      reader.readAsDataURL(file);
    });
  };

  const { getToken} = useAuth();

  const checkUserCredits = async (file: File, token: string | null): Promise<{ hasSufficientCredits: boolean; requiredCredits: number, user: User }> => {
    try {
      // Get the required credits based on audio length
      const requiredCredits = await getAudioDuration(file);
  
      // Fetch user credits
      const response = await fetch("/api/user", {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch user credits');
      }
  
      const user = await response.json();
  
      // Check if user has sufficient credits
      const hasSufficientCredits = user.amount >= requiredCredits;
  
      return { hasSufficientCredits, requiredCredits, user };
    } catch (error) {
      console.error('Error checking user credits:', error);
      throw new Error('Could not check user credits');
    }
  };

  const handleFileSelect = async (files: File[]) => {
    const client = await createAssemblyAIClient();


    let processedFiles = 0;
    const dbResponses: AudioDBResponse[] = []; // Array to store database responses
    const cloudinaryResponses: CloudinaryResponse[] = []; // Array to store Cloudinary responses
    setIsUploading(true);
    setProgress(10);

    // First, get the user token
    const token = await getToken(); // Get the user token

    // Process files that have sufficient credits
    for (const file of files) {
      try {
        const { hasSufficientCredits, requiredCredits, user } = await checkUserCredits(file, token);

        if (!hasSufficientCredits) {
          toast.error(`Insufficient credits for "${file.name}". You need ${requiredCredits} seconds but have ${user.amount} seconds`);
          continue; // Skip to the next file
        }

        // Deduct credits before uploading
        await updateUserCredits(requiredCredits);

        // Upload to Cloudinary
        const cloudinaryResponse = await uploadToCloudinary(file);
        cloudinaryResponses.push(cloudinaryResponse); // Store the Cloudinary response

        // Save to database
        const dbResponse = await saveToDatabase(file.name, cloudinaryResponse);
        dbResponses.push(dbResponse); // Store the database response
        updateTranscriptionsList(dbResponse); // Update UI with the new transcription

        // Update progress
        processedFiles++;
        setProgress((processedFiles / files.length) * 100);
        toast.success(`File "${file.name}" uploaded successfully!`);

      } catch (error) {
        console.error('Upload error:', error);
        if (error instanceof Error) {
          toast.error(`Error uploading "${file.name}": ${error.message}`);
        } else {
          toast.error(`Error uploading "${file.name}"`);
        }
      }
    }

    // After all files are uploaded, start transcribing
    for (let i = 0; i < dbResponses.length; i++) {
      const dbResponse = dbResponses[i];
      const cloudinaryResponse = cloudinaryResponses[i];

      const data = {
        audio: cloudinaryResponse.url,
        //language_code: 'pt',
        language_detection: true
      };

      try {
        const updatedDbResponse1 = await updateDatabase(dbResponse.id, "", "INPROGRESS");
        updateTranscriptionsList(updatedDbResponse1);

        const transcript = await client.transcripts.transcribe(data);

        const updatedDbResponse2 = await updateDatabase(dbResponse.id, transcript?.text ? transcript?.text : "", "DONE");
        updateTranscriptionsList(updatedDbResponse2);

      } catch (error : unknown) {
        console.error('Transcription error:', error);
        toast.error(`Error transcribing audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    setIsUploading(false);
    setProgress(0); // Set uploading state to false after all processes are complete
  };

  // ... rest of the return statement remains the same ...

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <FileUpload onFileSelect={handleFileSelect} progress={progress} setProgressOnClick={setProgress} isUploading={isUploading} />
          </div>
       
          <TranscriptionHistory
            transcriptions={transcriptions}
            onSelect={setSelectedTranscription}
            getAllAudiosByUser={getAllAudiosByUser}
          />
        </div>

        {/* Right Column */}
        <div>
          {selectedTranscription ? (
            <TranscriptionView transcription={selectedTranscription} />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-gray-500">
                Select a transcription from the history or upload a new file to get started
              </p>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  )};