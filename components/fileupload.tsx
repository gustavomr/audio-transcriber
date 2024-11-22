import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio } from 'lucide-react';
import { Progress } from "@/components/ui/progress"

interface FileUploadProps {
  onFileSelect: (file: File[]) => void;
  progress: number;
  setProgressOnClick: (progress: number) => void; 
  isUploading: boolean;
}

export default function FileUpload({ onFileSelect, progress, setProgressOnClick, isUploading}: FileUploadProps ) {
  const [isOpen, setIsOpen] = useState(false);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
       setProgressOnClick(0);
       onFileSelect(acceptedFiles);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg']
    },
    maxFiles: process.env.NEXT_PUBLIC_MAX_FILES ? parseInt(process.env.NEXT_PUBLIC_MAX_FILES) : 1,
    disabled: isUploading,
    maxSize: process.env.NEXT_PUBLIC_MAX_SIZE ? parseInt(process.env.NEXT_PUBLIC_MAX_SIZE) : 5242880 //5MB
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-lg font-semibold">File Upload</h2>
        <span>{isOpen ? '−' : '+'}</span>
      </div>
      {isOpen && (
        <div
          {...getRootProps()}
          className={`p-4 border-2 border-dashed rounded-xl transition-colors
            ${isUploading
              ? 'border-gray-500 bg-gray-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-blue-50 rounded-full mb-4">
              {isDragActive ? (
                <FileAudio className="w-8 h-8 text-blue-500" />
              ) : (
                <Upload className="w-8 h-8 text-blue-500" />
              )}
            </div>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop your audio file here' : 'Drag & drop your audio file'}
            </p>
            <p className="text-sm text-gray-500">
              Supports MP3, WAV, M4A, and OGG files
             
            </p>
            <p className="text-sm text-gray-500">
              Upload {process.env.NEXT_PUBLIC_MAX_FILES} files per send
             
            </p>
            <Progress value={progress} />

            <ul>
            {fileRejections.map((r) => (
              <li key={r.file.name}>
                {r.file.name}
                <ul>
                  {r.errors.map((e) => (
                    <li key={e.message}>{e.message}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          </div>
        </div>
      )}
    </div>
  );
}