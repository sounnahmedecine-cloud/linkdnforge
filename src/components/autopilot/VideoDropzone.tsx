'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, Film, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface VideoDropzoneProps {
  onVideoUploaded: (videoUrl: string, fileMeta: { name: string; size: number; duration?: number }) => void;
  onVideoRemoved: () => void;
}

export default function VideoDropzone({ onVideoUploaded, onVideoRemoved }: VideoDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Mo';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} Mo`;
  };

  const handleFile = async (file: File) => {
    setErrorMessage(null);

    // Validate type
    if (!file.type.startsWith('video/')) {
      setErrorMessage('Format non supporté. Veuillez sélectionner une vidéo (MP4, MOV, WebM).');
      return;
    }

    // Validate max size (e.g. 100MB)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage('Le fichier dépasse la limite recommandée de 100 Mo pour une analyse IA optimale.');
      return;
    }

    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Upload to Firebase Storage
    try {
      setUploadProgress(0);
      const uniqueName = `autopilot-videos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, uniqueName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Erreur Firebase Storage:', error);
          setErrorMessage('Erreur lors du transfert de la vidéo vers le cloud. Vérifiez votre connexion.');
          setUploadProgress(null);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadProgress(100);
          onVideoUploaded(downloadUrl, {
            name: file.name,
            size: file.size,
          });
        }
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erreur inconnue.');
      setUploadProgress(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileName(null);
    setFileSize(null);
    setUploadProgress(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onVideoRemoved();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={handleInputChange}
      />

      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-orange-500 bg-orange-50/50 scale-[1.01]'
              : 'border-slate-200 hover:border-orange-400 hover:bg-slate-50/50 bg-white'
          }`}
        >
          <div className="w-14 h-14 mx-auto mb-4 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h4 className="font-display font-bold text-base sm:text-lg text-slate-900 mb-1">
            Glissez votre vidéo ici ou cliquez pour parcourir
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-3">
            Formats acceptés : MP4, MOV, WebM (jusqu'à 100 Mo). L'IA analysera le visuel et l'audio de la vidéo.
          </p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <Film className="w-3.5 h-3.5 text-orange-500" /> Détection & Transcription automatique
          </span>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Film className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">{fileName}</p>
                <p className="text-xs text-slate-500">{fileSize}</p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Supprimer la vidéo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video Preview */}
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-56 mx-auto flex items-center justify-center">
            <video src={previewUrl} controls className="w-full h-full object-contain" />
          </div>

          {/* Upload Progress */}
          {uploadProgress !== null && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  {uploadProgress < 100 ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                      Téléversement vers le Cloud sécurisé...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Vidéo prête pour l'analyse IA
                    </>
                  )}
                </span>
                <span className="text-slate-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-medium border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
