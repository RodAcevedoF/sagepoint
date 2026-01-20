import { useState, useEffect } from 'react';
import { 
  useGetDocumentsQuery, 
  useUploadDocumentMutation, 
  useLazyGetGraphQuery 
} from '../api/roadmapApi';
import { useAppDispatch, useAppSelector } from '@/common/store/store';
import { logout } from '@/features/auth/slices/authSlice';
import { GraphVisualization } from '@/components/graph-visualization'; // Legacy component, will need move/refactor
import { 
  Container, 
  Box, 
  Paper, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Alert,
  CircularProgress,
  AppBar,
  Toolbar
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  Description as DescriptionIcon, 
  Logout as LogoutIcon, 
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export function Dashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { data: documents = [], isLoading: isLoadingDocs } = useGetDocumentsQuery();
  const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation();
  const [triggerGraph, { data: graphData, isFetching: isGraphLoading }] = useLazyGetGraphQuery();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user && !user.learningGoal) {
        router.push('/onboarding');
    }
  }, [user, router]);

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploadError(null);
    setUploadSuccess(false);

    try {
      const result = await uploadDocument(formData).unwrap();
      setUploadSuccess(true);
      // Automatically visualize the new document
      handleSelectDocument(result.id);
    } catch (err: any) {
      setUploadError('Upload failed. Please try again.');
    }
  };

  const handleSelectDocument = (docId: string) => {
    setSelectedDocId(docId);
    triggerGraph(docId);
  };

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}>
            SagePoint
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<LogoutIcon />} 
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, height: '100%' }}>
          
          {/* Left Panel: Upload & Recent Docs */}
          <Box sx={{ width: { xs: '100%', md: '33.333%', lg: '25%' }, flexShrink: 0 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Upload Document</Typography>
              <Box 
                sx={{ 
                  border: '2px dashed #e0e7ff', 
                  borderRadius: 2, 
                  p: 4, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#f5f7ff', borderColor: 'primary.main' }
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.md"
                />
                {isUploading ? (
                  <CircularProgress />
                ) : (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Click to upload PDF or TXT
                    </Typography>
                  </>
                )}
              </Box>

              {uploadSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Upload successful! Processing...
                </Alert>
              )}
              {uploadError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {uploadError}
                </Alert>
              )}
            </Paper>

            <Paper sx={{ p: 0, overflow: 'hidden' }}>
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                 <Typography variant="subtitle1" fontWeight="bold">Recent Documents</Typography>
              </Box>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {isLoadingDocs ? (
                   <Box display="flex" justifyContent="center" p={2}><CircularProgress size={20} /></Box>
                ) : documents.map((doc) => (
                  <ListItem 
                    key={doc.id} 
                    component="button" // Use standard button behavior for accessibility
                    onClick={() => handleSelectDocument(doc.id)}
                    sx={{ 
                      cursor: 'pointer', 
                      bgcolor: selectedDocId === doc.id ? '#e0e7ff' : 'transparent',
                      '&:hover': { bgcolor: '#f1f5f9' },
                      border: 'none',
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <DescriptionIcon color={doc.status === 'completed' ? 'primary' : 'disabled'} fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={doc.filename} 
                      primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                      secondary={new Date(doc.createdAt).toLocaleDateString()}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
                {documents.length === 0 && !isLoadingDocs && (
                  <Box p={2} textAlign="center">
                    <Typography variant="caption" color="textSecondary">No documents yet</Typography>
                  </Box>
                )}
              </List>
            </Paper>
          </Box>

          {/* Right Panel: Graph Visualization */}
          <Box sx={{ flexGrow: 1, width: { xs: '100%', md: '66.666%', lg: '75%' } }}>
            <Paper sx={{ p: 0, height: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
               <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                  <Typography variant="h6">Knowledge Graph</Typography>
               </Box>
               <Box sx={{ flexGrow: 1, position: 'relative' }}>
                  {selectedDocId ? (
                     <GraphVisualization data={graphData || null} loading={isGraphLoading} />
                  ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
                       <Typography>Select a document to visualize</Typography>
                    </Box>
                  )}
               </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
