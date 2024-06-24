import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Select, MenuItem, FormControl, InputLabel, Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Container, Grid, Card, CardContent, CircularProgress, Alert, IconButton, TextField
} from '@mui/material';
import { UploadFile, Assessment, PlayArrow } from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import LoadingAnimation from './LoadingAnimation';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SERVERIP = "https://dt-model-trainer-be.onrender.com/";

const UploadAndSelect = () => {
  const [file, setFile] = useState(null);
  const [features, setFeatures] = useState([]);
  const [target, setTarget] = useState('');
  const [modelType, setModelType] = useState('Regression');
  const [columns, setColumns] = useState([]);
  const [message, setMessage] = useState('');
  const [modelResults, setModelResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputData, setInputData] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    console.log('Uploading file:', file);

    try {
      const response = await axios.post(SERVERIP + 'upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setColumns(response.data.columns);
      setSessionId(response.data.sessionId);
      setMessage('File uploaded successfully.');
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file.');
    }
  };

  const handleTrain = async () => {
    if (features.length === 0 || !target) {
      setMessage('Please select features and target variable.');
      return;
    }
    setLoading(true);
    setModelResults(null);
    setMessage('Training model...');

    try {
      const response = await axios.post(SERVERIP + 'train', {
        sessionId,
        features,
        target,
        modelType,
      });

      console.log('Model Results:', response.data);
      setModelResults(response.data);
      setMessage('Model trained successfully.');
    } catch (error) {
      console.error('Error training model:', error);
      setMessage('Error training model.');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    if (Object.keys(inputData).length === 0) {
      setMessage('Please enter data for prediction.');
      return;
    }
    setLoading(true);
    setPrediction(null);
    setMessage('Making prediction...');

    try {
      const response = await axios.post(SERVERIP + 'predict', {
        sessionId,
        features,
        data: inputData,
      });

      console.log('Prediction:', response.data);
      setPrediction(response.data);
      setMessage('Prediction made successfully.');
    } catch (error) {
      console.error('Error making prediction:', error);
      setMessage('Error making prediction.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData({
      ...inputData,
      [name]: value,
    });
  };

  useEffect(() => {
    console.log('useEffect');
    axios.get(SERVERIP)
      .then((response) => {
        console.log('Response:', response.data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, []);

  const renderModelResults = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" style={{ height: 100 }}>
          <LoadingAnimation />
        </Box>
      );
    }

    if (!modelResults) return null;

    const { mse, best_params, feature_importances } = modelResults;

    return (
      <Box mt={4}>
        {mse !== undefined && (
          <Typography variant="h6">Mean Squared Error: {mse}</Typography>
        )}
        {best_params && (
          <Paper>
            <Typography variant="h6">Best Hyperparameters:</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Parameter</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(best_params).map(([param, value]) => (
                    <TableRow key={param}>
                      <TableCell>{param}</TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
        {feature_importances && (
          <Box mt={4}>
            <Typography variant="h6">Feature Importances:</Typography>
            <Bar
              data={{
                labels: features,
                datasets: [
                  {
                    label: 'Feature Importance',
                    data: feature_importances,
                    backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: 'rgba(75,192,192,1)',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </Box>
        )}
      </Box>
    );
  };

  const renderPredictionForm = () => {
    if (!modelResults) return null;

    return (
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>4. Make Predictions</Typography>
            <Grid container spacing={2}>
              {features.map((feature) => (
                <Grid item xs={12} md={6} key={feature}>
                  <TextField
                    label={feature}
                    name={feature}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button
                  onClick={handlePredict}
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrow />}
                >
                  Predict
                </Button>
              </Grid>
              {prediction && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Prediction Results</Typography>
                  <pre>{JSON.stringify(prediction, null, 2)}</pre>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" gutterBottom>Machine Learning Model Trainer</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
              <Typography variant="h6" gutterBottom>1. Upload Dataset</Typography>
                <Box display="flex" alignItems="center">
                  <input
                    accept=".csv,.xlsx"
                    style={{ display: 'none' }}
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<UploadFile />}
                      color="primary"
                    >
                      Choose File
                    </Button>
                  </label>
                  <Typography variant="body2" color="textSecondary" style={{ marginLeft: 16 }}>
                    {file ? file.name : 'No file chosen'}
                  </Typography>
                  <Box flexGrow={1} />
                  <Button
                    onClick={handleUpload}
                    variant="contained"
                    color="secondary"
                    disabled={!file}
                    startIcon={<Assessment />}
                  >
                    Upload and Analyze
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>2. Select Features and Target</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Select Features</InputLabel>
                      <Select multiple value={features} onChange={(e) => setFeatures(e.target.value)}>
                        {columns.map((col) => (
                          <MenuItem key={col} value={col}>{col}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Select Target</InputLabel>
                      <Select value={target} onChange={(e) => setTarget(e.target.value)}>
                        {columns.map((col) => (
                          <MenuItem key={col} value={col}>{col}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>3. Choose Model Type and Train</Typography>
                <Box display="flex" alignItems="center">
                  <FormControl fullWidth style={{ marginRight: 16 }}>
                    <InputLabel>Model Type</InputLabel>
                    <Select value={modelType} onChange={(e) => setModelType(e.target.value)}>
                      <MenuItem value="Regression">Regression</MenuItem>
                      <MenuItem value="Classification">Classification</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    onClick={handleTrain}
                    variant="contained"
                    color="primary"
                    disabled={features.length === 0 || !target}
                    startIcon={<PlayArrow />}
                  >
                    Train Model
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {message && (
            <Grid item xs={12}>
              <Alert severity={message.includes('Error') ? 'error' : 'success'}>{message}</Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Model Results</Typography>
                {renderModelResults()}
              </CardContent>
            </Card>
          </Grid>

          {renderPredictionForm()}
        </Grid>
      </Box>
    </Container>
  );
};

export default UploadAndSelect;
