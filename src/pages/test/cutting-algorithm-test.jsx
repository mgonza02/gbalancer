import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Grid, Alert, Divider } from '@mui/material';
import CuttingOptimizationService from '../../utils/CuttingOptimizationService';

/**
 * Test page for verifying the cutting optimization algorithm
 * Specifically tests that the algorithm never produces more pieces than requested
 */
const CuttingAlgorithmTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({ passed: 0, failed: 0, total: 0 });

  const service = new CuttingOptimizationService();

  // Helper functions
  const countTotalPlacedPieces = layout => {
    return layout.reduce((total, sheet) => {
      return total + (sheet.placedPieces ? sheet.placedPieces.length : 0);
    }, 0);
  };

  const countTotalRequestedPieces = pieces => {
    return pieces.reduce((total, piece) => {
      return total + parseInt(piece.quantity || 0);
    }, 0);
  };

  const verifyPlacementIntegrity = (layout, originalPieces) => {
    const placedPiecesByOriginal = {};

    layout.forEach(sheet => {
      if (sheet.placedPieces) {
        sheet.placedPieces.forEach(placedPiece => {
          const key = `${placedPiece.pieceId}`;
          if (!placedPiecesByOriginal[key]) {
            placedPiecesByOriginal[key] = 0;
          }
          placedPiecesByOriginal[key]++;
        });
      }
    });

    originalPieces.forEach((piece, index) => {
      const key = `${index}`;
      const placedCount = placedPiecesByOriginal[key] || 0;
      const requestedCount = parseInt(piece.quantity || 0);

      if (placedCount > requestedCount) {
        throw new Error(`Piece ${index} has ${placedCount} placed but only ${requestedCount} requested`);
      }
    });
  };

  // Test cases
  const testCases = [
    {
      name: 'Single piece type - basic test',
      pieces: [{ width: 100, height: 50, quantity: 3 }],
      sheetWidth: 300,
      sheetHeight: 200,
      expectedPlaced: 3
    },
    {
      name: 'Multiple piece types',
      pieces: [
        { width: 50, height: 30, quantity: 2 },
        { width: 80, height: 40, quantity: 1 },
        { width: 20, height: 20, quantity: 4 }
      ],
      sheetWidth: 200,
      sheetHeight: 150,
      expectedPlaced: 7
    },
    {
      name: 'Large quantities',
      pieces: [{ width: 25, height: 25, quantity: 16 }],
      sheetWidth: 100,
      sheetHeight: 100,
      expectedPlaced: 16
    },
    {
      name: 'Pieces that dont fit',
      pieces: [
        { width: 300, height: 200, quantity: 1 }, // Too big
        { width: 50, height: 50, quantity: 2 } // These should fit
      ],
      sheetWidth: 100,
      sheetHeight: 100,
      expectedPlaced: 2
    },
    {
      name: 'Rotation scenarios',
      pieces: [{ width: 80, height: 40, quantity: 3 }],
      sheetWidth: 50,
      sheetHeight: 150,
      expectedPlaced: 3
    },
    {
      name: 'Zero quantity pieces',
      pieces: [
        { width: 50, height: 50, quantity: 0 },
        { width: 30, height: 30, quantity: 2 },
        { width: 40, height: 40, quantity: 0 }
      ],
      sheetWidth: 100,
      sheetHeight: 100,
      expectedPlaced: 2
    },
    {
      name: 'High quantity stress test',
      pieces: [{ width: 10, height: 10, quantity: 50 }],
      sheetWidth: 100,
      sheetHeight: 100,
      expectedPlaced: 50
    },
    {
      name: 'Mixed sizes requiring multiple sheets',
      pieces: [
        { width: 90, height: 90, quantity: 3 },
        { width: 20, height: 20, quantity: 10 }
      ],
      sheetWidth: 100,
      sheetHeight: 100,
      expectedPlaced: 13
    },
    {
      name: 'Tight fitting scenarios',
      pieces: [
        { width: 50, height: 100, quantity: 2 },
        { width: 100, height: 50, quantity: 2 }
      ],
      sheetWidth: 100,
      sheetHeight: 100,
      expectedPlaced: 4
    },
    {
      name: 'Recursive cutting stress test',
      pieces: [{ width: 20, height: 20, quantity: 6 }],
      sheetWidth: 60,
      sheetHeight: 40,
      expectedPlaced: 6
    }
  ];

  const runTest = async (testCase, index) => {
    const { name, pieces, sheetWidth, sheetHeight, expectedPlaced } = testCase;

    try {
      const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

      const totalPlaced = countTotalPlacedPieces(layout);
      const totalRequested = countTotalRequestedPieces(pieces);

      // Verify that we never produce more pieces than requested
      if (totalPlaced > totalRequested) {
        throw new Error(`Algorithm produced ${totalPlaced} pieces but only ${totalRequested} were requested`);
      }

      // Verify placement integrity
      verifyPlacementIntegrity(layout, pieces);

      // Check if expected placement matches (if specified)
      if (expectedPlaced !== undefined && totalPlaced !== expectedPlaced) {
        throw new Error(`Expected ${expectedPlaced} pieces but got ${totalPlaced}`);
      }

      // Verify no duplicate placements
      const allPlacedPieces = layout.flatMap(sheet => sheet.placedPieces || []);
      const placementKeys = allPlacedPieces.map(p => `${p.pieceId}-${p.instanceIndex}`);
      const uniqueKeys = [...new Set(placementKeys)];

      if (placementKeys.length !== uniqueKeys.length) {
        throw new Error('Found duplicate piece placements');
      }

      return {
        name,
        status: 'passed',
        error: null,
        details: {
          totalPlaced,
          totalRequested,
          layoutSheets: layout.length,
          allPlacedPieces: allPlacedPieces.length
        }
      };
    } catch (error) {
      return {
        name,
        status: 'failed',
        error: error.message,
        details: null
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setSummary({ passed: 0, failed: 0, total: 0 });

    const results = [];
    let passed = 0;
    let failed = 0;

    for (let i = 0; i < testCases.length; i++) {
      const result = await runTest(testCases[i], i);
      results.push(result);

      if (result.status === 'passed') {
        passed++;
      } else {
        failed++;
      }

      // Update UI progressively
      setTestResults([...results]);
      setSummary({ passed, failed, total: results.length });

      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsRunning(false);
  };

  // Test individual expansion method
  const testExpansionMethod = () => {
    const pieces = [{ width: 25, height: 25, quantity: 4 }];
    const individualPieces = service.expandPiecesToIndividualItems(pieces);

    const instanceIndices = individualPieces.map(p => p.instanceIndex);
    const uniqueIndices = [...new Set(instanceIndices)];

    return {
      total: individualPieces.length,
      unique: uniqueIndices.length,
      indices: uniqueIndices.sort(),
      isValid: individualPieces.length === 4 && uniqueIndices.length === 4
    };
  };

  const expansionTest = testExpansionMethod();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        🧪 Cutting Algorithm Tests
      </Typography>

      <Typography variant='body1' paragraph>
        This page tests the cutting optimization algorithm to ensure it never produces more pieces than requested. Each test verifies piece
        count integrity, placement uniqueness, and algorithm correctness.
      </Typography>

      {/* Expansion Method Test */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant='h6' gutterBottom>
          Piece Expansion Method Test
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant='body2'>Expansion of 4 pieces: {expansionTest.isValid ? '✅ PASS' : '❌ FAIL'}</Typography>
          <Typography variant='body2' color='text.secondary'>
            Total: {expansionTest.total}, Unique: {expansionTest.unique}, Indices: [{expansionTest.indices.join(', ')}]
          </Typography>
        </Box>
      </Paper>

      {/* Test Controls */}
      <Box sx={{ mb: 3 }}>
        <Button variant='contained' onClick={runAllTests} disabled={isRunning} size='large'>
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </Box>

      {/* Test Summary */}
      {summary.total > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            📊 Test Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography variant='body1' color='success.main'>
                Passed: {summary.passed}
              </Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant='body1' color='error.main'>
                Failed: {summary.failed}
              </Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant='body1'>Total: {summary.total}</Typography>
            </Grid>
          </Grid>
          {summary.failed > 0 ? (
            <Alert severity='error' sx={{ mt: 2 }}>
              🚨 Some tests failed! There may be bugs in the algorithm.
            </Alert>
          ) : summary.total === testCases.length ? (
            <Alert severity='success' sx={{ mt: 2 }}>
              🎉 All tests passed! The algorithm appears to be working correctly.
            </Alert>
          ) : null}
        </Paper>
      )}

      {/* Test Results */}
      <Paper sx={{ p: 2 }}>
        <Typography variant='h6' gutterBottom>
          Test Results
        </Typography>
        {testResults.length === 0 && !isRunning && (
          <Typography variant='body2' color='text.secondary'>
            Click "Run All Tests" to begin testing
          </Typography>
        )}

        {testResults.map((result, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography
                variant='body1'
                sx={{
                  color: result.status === 'passed' ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}
              >
                {result.status === 'passed' ? '✅' : '❌'} {result.name}
              </Typography>
            </Box>

            {result.status === 'failed' && (
              <Alert severity='error' sx={{ mb: 1 }}>
                {result.error}
              </Alert>
            )}

            {result.details && (
              <Typography variant='body2' color='text.secondary' sx={{ ml: 3 }}>
                Placed: {result.details.totalPlaced}/{result.details.totalRequested}, Sheets: {result.details.layoutSheets}, Total pieces:{' '}
                {result.details.allPlacedPieces}
              </Typography>
            )}

            {index < testResults.length - 1 && <Divider sx={{ mt: 1 }} />}
          </Box>
        ))}

        {isRunning && (
          <Box sx={{ mt: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              Running test {testResults.length + 1} of {testCases.length}...
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CuttingAlgorithmTest;
