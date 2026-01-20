'use client';

import { useState, useRef, useEffect } from 'react';
import { api, logout } from '@/lib/api';
import { Upload, LogOut, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { GraphVisualization } from './graph-visualization';

export function Dashboard() {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      loadDocuments();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setStatus('idle');
    
    try {
      const res = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatus('success');
      // Assume res.data is the Document object with an id
      const docId = res.data.id;
      setMessage(`Successfully uploaded ${file.name}. ID: ${docId}`);
      
      // Auto-fill the graph input if we can
      // But for now just showing it in the message is enough trigger for the button below
      loadDocuments();
      
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  interface Document {
      id: string;
      filename: string;
      createdAt: string;
  }
  const [documents, setDocuments] = useState<Document[]>([]);

  // Fetch documents on load
  const loadDocuments = async () => {
      try {
          const res = await api.get('/documents');
          setDocuments(res.data);
      } catch (e) {
          console.error("Failed to fetch documents", e);
      }
  };

  // Add state for graph data
  interface GraphData {
    nodes: Array<{ id: string; name: string; description: string; }>;
    edges: Array<{ from: string; to: string; type: string }>;
  }
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  const fetchGraph = async (documentId: string) => {
    try {
        const res = await api.get(`/roadmaps/graph/${documentId}`);
        setGraphData(res.data);
    } catch (e) {
        console.error("Failed to fetch graph", e);
    }
  };

  // Trigger fetch when upload is successful (in a real app, we'd wait for processing)
  // For now, let's add a manual button or just auto-fetch if we had the ID.
  // Since upload is async processing, we can't fetch immediately unless we poll.
  // I will add a "Visualize" button to the placeholder for now.

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
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex flex-col gap-2">
                 <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {message}
                 </div>
                 {/* Auto-populated ID if available */}
                 <button 
                    onClick={() => {
                        const idMatch = message.match(/ID: ([a-zA-Z0-9-]+)/);
                        if (idMatch) fetchGraph(idMatch[1]);
                    }}
                    className="text-sm underline hover:text-green-800 text-left"
                 >
                    Click to visualize (wait for processing)
                 </button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {message}
              </div>
            )}
          </div>

          {/* Recent Documents List */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Documents</h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {documents.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No documents found.</p>
                ) : (
                    documents.map((doc) => (
                        <div 
                            key={doc.id}
                            onClick={() => fetchGraph(doc.id)}
                            className="p-3 border rounded-lg hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-colors flex items-center justify-between group"
                        >
                            <div className="flex items-center truncate">
                                <FileText className="h-4 w-4 text-gray-400 mr-2 group-hover:text-indigo-500" />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 truncate">{doc.filename}</span>
                            </div>
                            <span className="text-xs text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                    ))
                )}
            </div>
          </div>

        </div>
          {/* Graph Visualization */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 min-h-[400px] flex flex-col w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Graph</h2>
             
             {/* Graph Component */}
             <div className="flex-grow w-full">
                 <GraphVisualization 
                    data={graphData} 
                    loading={false} // Todo: Add loading state to dashboard
                 />
             </div>
          </div>
      </main>
    </div>
  );
}
