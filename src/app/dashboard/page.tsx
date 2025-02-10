// file-management-poc/src/app/dashboard/page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import { UploadFile, Description, Category, Label } from '@mui/icons-material';

// Define a custom theme with a blue and silver gradient background
const theme = createTheme({
  palette: {
    primary: {
      main: '#0d47a1', // A deep blue for primary actions
    },
    secondary: {
      main: '#ffab00', // A vibrant yellow for secondary actions
    },
    background: {
      default: 'linear-gradient(135deg, #0d47a1 0%, #b0c4de 50%, #c0c0c0 100%)', // Blue to silver gradient
      paper: '#ffffff', // White for paper elements
    },
    text: {
      primary: '#212121', // Dark grey for primary text
      secondary: '#757575', // Medium grey for secondary text
    },
    action: {
      hover: '#e0e0e0', // Light grey for hover effects
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif', // A clean, modern font
  },
});

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { register, handleSubmit, reset } = useForm();
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [filesList, setFilesList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setFilesList(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append("file", data.file[0]);
    formData.append("documentType", data.documentType || "");
    formData.append("category", data.category || "");
    formData.append("tags", data.tags || "");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const result = await res.json();
      setUploadResult(result);
      reset();
      fetchFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      const res = await fetch(`/api/files/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      alert(data.message);
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const filteredFiles = filesList.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading")
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );

  if (!session)
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="warning">Please sign in to access the dashboard.</Alert>
      </Container>
    );

  return (
    <ThemeProvider theme={theme}>
      <Container sx={{ py: 4, backgroundColor: theme.palette.background.default, minHeight: '100vh', display: 'flex' }}>
        <Box sx={{ width: '25%', pr: 2 }}>
          <Card sx={{ mb: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Processed Files
              </Typography>
              <TextField
                select
                fullWidth
                SelectProps={{
                  native: true,
                }}
                variant="outlined"
                helperText="Select a file to view metadata"
              >
                <option value="">Select a file</option>
                {processedFiles.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.filename}
                  </option>
                ))}
              </TextField>
              <Box sx={{ mt: 2 }}>
                {processedFiles.map((file) => (
                  <Box key={file.id} sx={{ mb: 2 }}>
                    <Typography variant="body1"><strong>Filename:</strong> {file.filename}</Typography>
                    <Typography variant="body2"><strong>Document Type:</strong> {file.documentType || "-"}</Typography>
                    <Typography variant="body2"><strong>Category:</strong> {file.category || "-"}</Typography>
                    <Typography variant="body2"><strong>Tags:</strong> {file.tags || "-"}</Typography>
                    <Typography variant="body2"><strong>Processed At:</strong> {new Date(file.processedAt).toLocaleString()}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: '75%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Dashboard
            </Typography>
            <Button variant="contained" color="error" onClick={() => signOut({ callbackUrl: '/' })}>
              Sign Out
            </Button>
          </Box>

          <Card sx={{ mb: 4, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Upload a File
              </Typography>
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2 }}>
                <Stack spacing={2}>
                  <TextField
                    type="file"
                    inputProps={{ accept: '*' }}
                    {...register("file")}
                    required
                    helperText="Select a file to upload"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <UploadFile />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Document Type"
                    {...register("documentType")}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Description />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Category"
                    {...register("category")}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Category />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Tags (comma-separated)"
                    {...register("tags")}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Label />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button type="submit" variant="contained" color="primary">
                    Upload File
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {uploadResult && (
            <Card sx={{ mb: 4, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Upload Result
                </Typography>
                <Box component="pre" sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, overflow: 'auto' }}>
                  {JSON.stringify(uploadResult, null, 2)}
                </Box>
              </CardContent>
            </Card>
          )}

          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Uploaded Files
              </Typography>
              <TextField
                label="Search Files"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Filename</TableCell>
                      <TableCell>Original Name</TableCell>
                      <TableCell>Document Type</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Uploaded At</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFiles.map((file) => (
                      <TableRow key={file.id} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover } }}>
                        <TableCell>{file.filename}</TableCell>
                        <TableCell>{file.originalName}</TableCell>
                        <TableCell>{file.documentType || "-"}</TableCell>
                        <TableCell>{file.category || "-"}</TableCell>
                        <TableCell>{new Date(file.createdAt).toLocaleString()}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => alert(JSON.stringify(file, null, 2))}>
                            <Visibility />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(file.id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredFiles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No files found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
