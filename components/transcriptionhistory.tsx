import React, { useState, useEffect } from 'react';
import { Clock, Check, AlertCircle, Loader2 } from 'lucide-react';
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { useAuth } from '@clerk/nextjs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export interface Transcription {
  id: number;
  filename: string;
  status: Status;
  url: string;
  createdAt: Date;
  transcription: string;
}

export enum Status {
  CREATED = 'CREATED',
  QUEUED = 'QUEUED',
  INPROGRESS = 'INPROGRESS',
  DONE = 'DONE'
}

interface TranscriptionHistoryProps {
  transcriptions: Transcription[];
  onSelect: (transcription: Transcription) => void;
  getAllAudiosByUser: (skip: number, take: number) => void;
}

export default function TranscriptionHistory({ transcriptions, onSelect, getAllAudiosByUser }: TranscriptionHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE || '4'); // Default to 10 if undefined
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const { getToken } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const getStatusIcon = (status: Transcription['status']) => {
    switch (status) {
      case 'DONE':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'INPROGRESS':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'QUEUED':
      case 'CREATED':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const handleCountPages = async () => {
    const response = await fetch('/api/audioCount', {
      method: "GET",
      headers: {
        'Authorization': 'Bearer ' + await getToken()
      }
    });
    const audio = await response.json();
    return audio._count.id;
  };

  useEffect(() => {
    const fetchCount = async () => {
      setLoading(true);
      const count = await handleCountPages();
      setTotalCount(count);
      await getAllAudiosByUser(0, itemsPerPage);
      setLoading(false);
    };
    fetchCount();
  }, []);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePreviousPage = async () => {
    setLoading(true);
    const newPage = Math.max(currentPage - 1, 1);
    setCurrentPage(newPage);
    const skipAmount = (newPage - 1) * itemsPerPage;
    await getAllAudiosByUser(skipAmount, itemsPerPage);
    setLoading(false);
  };

  const handleNextPage = async () => {
    setLoading(true);
    const newPage = Math.min(currentPage + 1, totalPages);
    setCurrentPage(newPage);
    const skipAmount = (newPage - 1) * itemsPerPage;
    await getAllAudiosByUser(skipAmount, itemsPerPage);
    setLoading(false);
  };

  const handlePageSelect = async (page: number) => {
    setLoading(true);
    setCurrentPage(page);
    const skipAmount = (page - 1) * itemsPerPage;
    await getAllAudiosByUser(skipAmount, itemsPerPage);
    setLoading(false);
  };

  const handleSelect = (id: number) => {
    setSelectedId(id);
    const selectedTranscription = transcriptions.find(item => item.id === id);
    if (selectedTranscription) {
      onSelect(selectedTranscription);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <h2 className="text-m font-semibold">Transcriptions History</h2>
        {loading && (
          <div className="ml-2 flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        {transcriptions?.map((item) => (
          <div
            key={String(item.id)}
            onClick={() => handleSelect(item.id)}
            className={`flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 cursor-pointer transition-all ${selectedId === item.id ? 'border-blue-400' : 'hover:border-blue-200'}`}
          >
            <div className='p-1'>
              <AudioPlayer
                showJumpControls={false}
                showDownloadProgress={false}
                layout='horizontal-reverse'
                src={item.url}
                customControlsSection={[RHAP_UI.MAIN_CONTROLS]}
                customProgressBarSection={[]}
                customVolumeControls={[]}
                className="audio-player-minimal"
              />
            </div>
            <div className="flex-1 ml-1">
              <h3 className="font-medium">{item.filename}</h3>
              <p className="text-sm text-gray-500">
                {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="p-1 bg-gray-50 rounded-full">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>{getStatusIcon(item.status)}</TooltipTrigger>
                  <TooltipContent>
                    <p>{item.status}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePreviousPage();
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index + 1}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageSelect(index + 1);
                    }}
                    className={currentPage === index + 1 ? 'bg-blue-50' : ''}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNextPage();
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}