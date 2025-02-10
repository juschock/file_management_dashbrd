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
  Grid,
} from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';
import {
  UploadFile, Description, Category, Label
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm();

  const [uploadResult, setUploadResult] = useState<any>(null);
  const [filesList, setFilesList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      alert(data.message);
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const filteredFiles = filesList.filter((file) =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#1E3A8A',
      },
      background: {
        default: '#6CA6CD',
        paper: '#000000',
      },
      text: {
        primary: '#ffffff',
        secondary: '#ffffff',
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: 18,
      h5: {
        fontSize: '2rem',
      },
      h6: {
        fontSize: '1.75rem',
      },
      body1: {
        fontSize: '1.25rem',
      },
      body2: {
        fontSize: '1.125rem',
      },
    },
    components: {
      MuiTypography: {
        styleOverrides: {
          root: {
            color: '#ffffff',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '16px',
          },
        },
      },
    },
  });

  if (status === "loading") {
    return (
      <ThemeProvider theme={darkTheme}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (!session) {
    return (
      <ThemeProvider theme={darkTheme}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <Alert severity="warning">Please sign in to access the dashboard.</Alert>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        minHeight="100vh"
        bgcolor="background.default"
      >
        <Box
          width={{ xs: '100%', md: '240px' }}
          bgcolor="background.paper"
          p={2}
          sx={{ boxShadow: 4 }}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Box>
            <Button
              variant="contained"
              onClick={() => signOut({ callbackUrl: '/' })}
              sx={{ 
                mb: 2,
                backgroundColor: '#FF6347',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#FF4500',
                },
              }}
            >
              Sign Out
            </Button>
            <Typography variant="h6" gutterBottom>
              Dashboard
            </Typography>
          </Box>
        </Box>

        <Box flexGrow={1} p={{ xs: 2, md: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Daily Request Health %</Typography>
                  <Typography variant="body2">0</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Daily Requests</Typography>
                  <Typography variant="body2">0</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Daily Credit Usage</Typography>
                  <Typography variant="body2">0</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Upload a File
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                sx={{ mt: 2 }}
              >
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
                  <Button type="submit" variant="contained" color="success">
                    Upload File
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {uploadResult && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Upload Result
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: '#333',
                    color: '#ccc',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                  }}
                >
                  {JSON.stringify(uploadResult, null, 2)}
                </Box>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
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
                      <TableRow key={file.id} hover>
                        <TableCell>{file.filename}</TableCell>
                        <TableCell>{file.originalName}</TableCell>
                        <TableCell>{file.documentType || "-"}</TableCell>
                        <TableCell>{file.category || "-"}</TableCell>
                        <TableCell>
                          {new Date(file.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => alert(JSON.stringify(file, null, 2))}
                          >
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
      </Box>
    </ThemeProvider>
  );
}
