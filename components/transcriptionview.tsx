import React from 'react';
import { Copy, Download } from 'lucide-react';
import type { Transcription } from '@/components/transcriptionhistory';

interface TranscriptionViewProps {
  transcription: Transcription;
}

export default function TranscriptionView({ transcription }: TranscriptionViewProps) {
  const copyToClipboard = () => {
    if (transcription.transcription) {
      navigator.clipboard.writeText(transcription.transcription);
    }
  };

  const downloadTranscription = () => {
    if (transcription.transcription) {
      const blob = new Blob([transcription.transcription], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${transcription.filename}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Transcription Result</h2>
        <div className="flex space-x-2">
          <button
            onClick={copyToClipboard}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={downloadTranscription}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Download transcription"
          >
            <Download className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
        {transcription.status === 'DONE' ? (
          <p className="whitespace-pre-wrap">{transcription.transcription}</p>
        ) : transcription.status === 'INPROGRESS' ? (
          <p className="text-blue-500">Processing your audio file...</p>
        ) : (
          <p className="text-red-500">Transcription failed. Please try again.</p>
        )}
      </div>
    </div>
  );
}