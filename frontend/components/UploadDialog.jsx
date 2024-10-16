import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Upload, X } from 'lucide-react';
import Image from 'next/image';

const API_ROUTE_LOCAL = "http://localhost:5000/api"; // Local API URL
const API_ROUTE_GLOBAL = "https://fried-fish.vercel.app/api"; // Global API URL

export default function UploadDialog({ open, onOpenChange, fetchVideos }) {
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const thumbnailInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Thumbnail size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoThumbnail(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError('Video size should be less than 100MB');
        return;
      }
      setVideoFile(file);
      setError('');
    }
  };

  const handleUploadVideo = async (event) => {
    event.preventDefault();
    setError('');
    setIsUploading(true);

    if (!videoTitle.trim() || !videoDescription.trim() || !videoThumbnail || !videoFile) {
      setError('Please fill in all fields and select both a thumbnail and a video file.');
      setIsUploading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      const formData = new FormData();
      formData.append('title', videoTitle);
      formData.append('description', videoDescription);
      formData.append('thumbnail', thumbnailInputRef.current.files[0]);
      formData.append('video', videoInputRef.current.files[0]);

      // First try the local API
      const response = await fetch(`${API_ROUTE_LOCAL}/videos/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      // If local API fails, try the global API
      if (!response.ok) {
        const errorResult = await response.json();
        // Attempt the global API
        const globalResponse = await fetch(`${API_ROUTE_GLOBAL}/videos/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        
        if (!globalResponse.ok) {
          const globalErrorResult = await globalResponse.json();
          throw new Error(globalErrorResult.message || 'Failed to upload video');
        }
      }

      const result = await response.json();
      console.log('Video successfully uploaded:', result);

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setTimeout(() => {
        onOpenChange(false);
        resetForm();
        fetchVideos();
      }, 1000);
    } catch (error) {
      console.error('Error uploading video:', error);
      setError(error.message || 'An error occurred while uploading the video');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setVideoTitle('');
    setVideoDescription('');
    setVideoThumbnail(null);
    setVideoFile(null);
    setUploadProgress(0);
    setError('');
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[425px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-gray-900 dark:text-white neon-border">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white neon-text">
            Upload Video
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Fill in the details and upload your video.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUploadVideo}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="videoTitle" className="text-right text-gray-900 dark:text-white">
                Title
              </Label>
              <Input
                id="videoTitle"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="col-span-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white neon-border neon-focus"
                placeholder="Enter video title"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="videoDescription" className="text-right text-gray-900 dark:text-white">
                Description
              </Label>
              <Textarea
                id="videoDescription"
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                className="col-span-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white neon-border neon-focus"
                placeholder="Enter video description"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="videoThumbnail" className="text-right text-gray-900 dark:text-white">
                Thumbnail
              </Label>
              <div className="col-span-3">
                <input
                  type="file"
                  id="videoThumbnail"
                  ref={thumbnailInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleThumbnailChange}
                  required
                />
                <Button
                  type="button"
                  onClick={() => thumbnailInputRef.current.click()}
                  className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white neon-border hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  {videoThumbnail ? 'Change Thumbnail' : 'Choose Thumbnail'}
                </Button>
                {videoThumbnail && (
                  <div className="mt-2 relative">
                    <Image
                      src={videoThumbnail}
                      alt="Video Thumbnail"
                      className="w-full h-32 object-cover rounded-md"
                      height={500}
                      width={500}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1"
                      onClick={() => {
                        setVideoThumbnail(null);
                        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="videoFile" className="text-right text-gray-900 dark:text-white">
                Video File
              </Label>
              <div className="col-span-3">
                <input
                  type="file"
                  id="videoFile"
                  ref={videoInputRef}
                  className="hidden"
                  accept="video/*"
                  onChange={handleVideoChange}
                  required
                />
                <Button
                  type="button"
                  onClick={() => videoInputRef.current.click()}
                  className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white neon-border hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  {videoFile ? 'Change Video File' : 'Choose Video File'}
                </Button>
                {videoFile && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {videoFile.name}
                  </p>
                )}
              </div>
            </div>
            {uploadProgress > 0 && (
              <div className="col-span-4">
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="bg-neon-primary text-white hover:bg-neon-secondary"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Video'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
