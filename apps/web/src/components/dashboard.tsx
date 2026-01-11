'use client';

import { useState, useRef } from 'react';
import { api, logout } from '@/lib/api';
import { Upload, LogOut, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function Dashboard() {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setStatus('idle');
    
    try {
      await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatus('success');
      setMessage(`Successfully uploaded ${file.name}. AI is processing it...`);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600">SagePoint</h1>
          <button
            onClick={logout}
            className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-indigo-500" />
              Upload Document
            </h2>
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 hover:bg-gray-50 transition-all cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleUpload}
                accept=".pdf,.txt,.md"
                disabled={uploading}
              />
              
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-3" />
                  <p className="text-sm text-gray-500">Uploading & Analyzing...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-indigo-50 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-indigo-600" />
                  </div>
                  <p className="text-gray-900 font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">PDF, TXT, or Markdown</p>
                </div>
              )}
            </div>

            {status === 'success' && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {message}
              </div>
            )}

            {status === 'error' && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {message}
              </div>
            )}
          </div>

          {/* Concepts Preview (Placeholder for now) */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Concepts</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
              <p className="text-sm text-gray-500 text-center mt-8">
                Upload a document to generate your knowledge graph.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
