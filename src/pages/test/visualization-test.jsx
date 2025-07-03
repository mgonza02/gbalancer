// material-ui
import { Grid, Typography, Box } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import CuttingPlanVisualization from 'components/CuttingPlanVisualization';
import { testCuttingData } from 'utils/testData';

// ==============================|| VISUALIZATION TEST PAGE ||==============================

export default function VisualizationTest() {
  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant='h4' gutterBottom>
          Cutting Plan Visualization Test
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          Testing the D3.js-based cutting plan visualization component
        </Typography>
      </Grid>

      <Grid size={12}>
        <MainCard title='Sample Cutting Plan'>
          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom>
              Project Details:
            </Typography>
            <Typography variant='body2'>
              • Sheet Size: {testCuttingData.sheetWidth} × {testCuttingData.sheetHeight} mm
            </Typography>
            <Typography variant='body2'>• Number of Cuts: {testCuttingData.cuts.length} different sizes</Typography>
            <Typography variant='body2'>• Total Pieces: {testCuttingData.cuts.reduce((sum, cut) => sum + cut.quantity, 0)}</Typography>
            <Typography variant='body2'>• Sheets Required: {testCuttingData.layout.length}</Typography>
            <Typography variant='body2' color='warning.main'>
              • This example shows waste areas highlighted in red to demonstrate the feature
            </Typography>
          </Box>

          <CuttingPlanVisualization
            sheetWidth={testCuttingData.sheetWidth}
            sheetHeight={testCuttingData.sheetHeight}
            cuts={testCuttingData.cuts}
            layout={testCuttingData.layout}
            title='Test Cutting Layout'
            projectData={{
              name: 'Test Project',
              materialType: 'glass',
              sheetWidth: testCuttingData.sheetWidth,
              sheetHeight: testCuttingData.sheetHeight,
              sheetsNeeded: testCuttingData.layout.length,
              totalPieces: testCuttingData.cuts.reduce((sum, cut) => sum + cut.quantity, 0),
              efficiency: 75.5,
              totalCutArea: testCuttingData.cuts.reduce((sum, cut) => sum + cut.width * cut.height * cut.quantity, 0),
              sheetArea: testCuttingData.sheetWidth * testCuttingData.sheetHeight,
              cuts: testCuttingData.cuts,
              createdAt: new Date().toISOString()
            }}
            enablePDFExport={true}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}
