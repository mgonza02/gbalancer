import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as d3 from 'd3';
import { Box, Typography, Paper, Button, ButtonGroup, Card, CardContent, Grid, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { PictureAsPdf as PdfIcon, Download as DownloadIcon } from '@mui/icons-material';
import PDFExportService from 'utils/PDFExportService';

/**
 * CuttingPlanVisualization Component
 *
 * Terminology:
 * - Piece: Each object with width and height that needs to be cut from the sheet (user input)
 * - Guillotine Cut: Each straight cut operation that divides a sheet area into two parts (algorithm operation)
 *
 * This component visualizes the optimal placement of pieces on sheets and highlights waste areas.
 * The visualization shows both the final piece placement and provides information about
 * the guillotine cuts required to extract the pieces.
 */

function CuttingPlanVisualization({
  sheetWidth,
  sheetHeight,
  cuts, // Legacy prop name for compatibility, contains piece definitions
  layout,
  title,
  showTitle = true,
  projectData = null,
  enablePDFExport = true
}) {
  const { t } = useTranslation();

  // Use translated title if none provided
  const displayTitle = title || t('visualization.title');
  const svgRef = useRef();
  const visualizationRef = useRef();
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // For clarity: cuts prop actually contains piece definitions
  const pieces = cuts;

  // Helper function to find unused rectangular regions
  const findUnusedRegions = (usedRegions, sheetW, sheetH) => {
    const unusedRegions = [];

    // Create a grid to track used areas
    const gridSize = 10; // 10mm grid resolution
    const gridWidth = Math.ceil(sheetW / gridSize);
    const gridHeight = Math.ceil(sheetH / gridSize);
    const grid = Array(gridHeight)
      .fill(null)
      .map(() => Array(gridWidth).fill(false));

    // Mark used areas in grid
    usedRegions.forEach(region => {
      const startX = Math.floor(region.x / gridSize);
      const endX = Math.ceil((region.x + region.width) / gridSize);
      const startY = Math.floor(region.y / gridSize);
      const endY = Math.ceil((region.y + region.height) / gridSize);

      for (let y = startY; y < endY && y < gridHeight; y++) {
        for (let x = startX; x < endX && x < gridWidth; x++) {
          grid[y][x] = true;
        }
      }
    });

    // Find rectangular unused regions
    const visited = Array(gridHeight)
      .fill(null)
      .map(() => Array(gridWidth).fill(false));

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (!grid[y][x] && !visited[y][x]) {
          // Found start of unused region, expand to find rectangle
          let width = 0;
          let height = 0;

          // Find width
          while (x + width < gridWidth && !grid[y][x + width] && !visited[y][x + width]) {
            width++;
          }

          // Find height
          let validHeight = true;
          while (y + height < gridHeight && validHeight) {
            for (let w = 0; w < width; w++) {
              if (grid[y + height][x + w] || visited[y + height][x + w]) {
                validHeight = false;
                break;
              }
            }
            if (validHeight) height++;
          }

          // Mark region as visited
          for (let h = 0; h < height; h++) {
            for (let w = 0; w < width; w++) {
              visited[y + h][x + w] = true;
            }
          }

          // Add region if significant size
          const regionWidth = width * gridSize;
          const regionHeight = height * gridSize;
          if (regionWidth > 20 && regionHeight > 20) {
            unusedRegions.push({
              x: x * gridSize,
              y: y * gridSize,
              width: Math.min(regionWidth, sheetW - x * gridSize),
              height: Math.min(regionHeight, sheetH - y * gridSize)
            });
          }
        }
      }
    }

    return unusedRegions;
  };

  const handlePDFExport = async () => {
    if (!enablePDFExport || !projectData || !visualizationRef.current) return;

    setIsExporting(true);
    try {
      const pdfService = new PDFExportService();

      // Prepare project data with current visualization info
      const exportData = {
        ...projectData,
        layout,
        pieces: pieces.map((piece, index) => ({
          ...piece,
          id: index
        })),
        sheetWidth,
        sheetHeight
      };

      const result = await pdfService.exportVisualizationToPDF(exportData, visualizationRef.current, {
        fileName: `cutting-plan-${projectData.name || 'project'}-${new Date().toISOString().split('T')[0]}.pdf`,
        includeStats: true,
        includeDetails: true,
        orientation: 'portrait'
      });

      if (result.success) {
        console.log('PDF exported successfully:', result.fileName);
      } else {
        console.error('PDF export failed:', result.error);
      }
    } catch (error) {
      console.error('Error during PDF export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (!sheetWidth || !sheetHeight || !pieces || !layout || layout.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Get current sheet data
    const currentSheet = layout[currentSheetIndex] || layout[0];
    if (!currentSheet || !currentSheet.placedPieces || currentSheet.placedPieces.length === 0) return;

    // Set up dimensions and margins
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const containerWidth = 600;
    const containerHeight = 400;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Calculate scale to fit the sheet in the container
    const scaleX = width / sheetWidth;
    const scaleY = height / sheetHeight;
    const scale = Math.min(scaleX, scaleY) * 0.9; // Leave some padding

    // Center the visualization
    const scaledSheetWidth = sheetWidth * scale;
    const scaledSheetHeight = sheetHeight * scale;
    const offsetX = (width - scaledSheetWidth) / 2;
    const offsetY = (height - scaledSheetHeight) / 2;

    // Create SVG
    const svg = d3.select(svgRef.current).attr('width', containerWidth).attr('height', containerHeight);

    const g = svg.append('g').attr('transform', `translate(${margin.left + offsetX}, ${margin.top + offsetY})`);

    // Draw sheet background
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', scaledSheetWidth)
      .attr('height', scaledSheetHeight)
      .attr('fill', '#f5f5f5')
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('rx', 4);

    // Calculate and draw unused areas
    const usedRegions = currentSheet.placedPieces.map(piece => ({
      x: piece.x,
      y: piece.y,
      width: piece.width,
      height: piece.height
    }));

    // Simple algorithm to identify major unused rectangles
    const unusedRegions = findUnusedRegions(usedRegions, sheetWidth, sheetHeight);

    // Draw unused area highlights
    unusedRegions.forEach((region, regionIndex) => {
      if (region.width > 50 && region.height > 50) {
        // Only show significant unused areas
        const wasteRect = g
          .append('rect')
          .attr('x', region.x * scale)
          .attr('y', region.y * scale)
          .attr('width', region.width * scale)
          .attr('height', region.height * scale)
          .attr('fill', '#ffebee')
          .attr('fill-opacity', 0.5)
          .attr('stroke', '#f44336')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3')
          .attr('rx', 2)
          .style('cursor', 'pointer');

        // Add hover effects for waste areas
        wasteRect
          .on('mouseover', function (event) {
            d3.select(this).attr('fill-opacity', 0.7).attr('stroke-width', 2);

            // Create tooltip for waste area
            const wasteArea = region.width * region.height;
            const tooltip = d3
              .select('body')
              .append('div')
              .attr('class', 'waste-tooltip')
              .style('position', 'absolute')
              .style('background', 'rgba(244, 67, 54, 0.9)')
              .style('color', 'white')
              .style('padding', '8px')
              .style('border-radius', '4px')
              .style('font-size', '12px')
              .style('pointer-events', 'none')
              .style('z-index', 1000).html(`
                <div><strong>${t('visualization.wasteAreas')} ${regionIndex + 1}</strong></div>
                <div>${t('visualization.dimensions')}: ${region.width} × ${region.height} mm</div>
                <div>${t('pdf.area')}: ${wasteArea.toLocaleString()} mm²</div>
                <div>Could fit: ${Math.floor(region.width / 100)}×${Math.floor(region.height / 100)} pieces of 100×100mm</div>
              `);

            tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY - 10}px`);
          })
          .on('mousemove', event => {
            d3.select('.waste-tooltip')
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY - 10}px`);
          })
          .on('mouseout', function () {
            d3.select(this).attr('fill-opacity', 0.5).attr('stroke-width', 1);

            d3.select('.waste-tooltip').remove();
          });

        // Add waste area label for larger regions
        if (region.width * scale > 60 && region.height * scale > 30) {
          const wasteArea = region.width * region.height;
          g.append('text')
            .attr('x', (region.x + region.width / 2) * scale)
            .attr('y', (region.y + region.height / 2) * scale)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#d32f2f')
            .attr('font-size', '8px')
            .attr('font-weight', 'bold')
            .text(`${t('visualization.waste')}: ${wasteArea.toLocaleString()}mm²`);
        }
      }
    });

    // Color palette for different piece types
    const colorScale = d3
      .scaleOrdinal()
      .domain(pieces.map((_, i) => i))
      .range(['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#795548', '#607D8B']);

    // Draw placed pieces
    currentSheet.placedPieces.forEach((placedPiece, pieceIndex) => {
      const originalPiece = pieces.find(p => p.id === placedPiece.pieceId);
      if (!originalPiece) return;

      // Calculate position and size
      const x = placedPiece.x * scale;
      const y = placedPiece.y * scale;
      const pieceWidth = placedPiece.width * scale;
      const pieceHeight = placedPiece.height * scale;

      // Create a group for this piece
      const pieceGroup = g.append('g').attr('class', 'piece-group').style('cursor', 'pointer');

      // Draw piece rectangle
      pieceGroup
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', pieceWidth)
        .attr('height', pieceHeight)
        .attr('fill', colorScale(placedPiece.pieceId))
        .attr('fill-opacity', 0.7)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('rx', 2);

      // Add piece dimensions text if the piece is large enough
      if (pieceWidth > 40 && pieceHeight > 20) {
        pieceGroup
          .append('text')
          .attr('x', x + pieceWidth / 2)
          .attr('y', y + pieceHeight / 2 - 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text(`${placedPiece.width}×${placedPiece.height}${placedPiece.isRotated ? ' ↻' : ''}`);

        if (pieceHeight > 35) {
          pieceGroup
            .append('text')
            .attr('x', x + pieceWidth / 2)
            .attr('y', y + pieceHeight / 2 + 10)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#fff')
            .attr('font-size', '8px')
            .text(`Instance: ${placedPiece.instanceIndex + 1}`);
        }
      }

      // Add hover effects
      pieceGroup
        .on('mouseover', function (event) {
          d3.select(this).select('rect').attr('fill-opacity', 1).attr('stroke-width', 2);

          // Create tooltip
          const tooltip = d3
            .select('body')
            .append('div')
            .attr('class', 'piece-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('z-index', 1000).html(`
              <div><strong>${t('visualization.pieces')} ${placedPiece.pieceId + 1}</strong></div>
              <div>${t('visualization.dimensions')}: ${placedPiece.width} × ${placedPiece.height} mm</div>
              <div>${t('pdf.instance')}: ${placedPiece.instanceIndex + 1}</div>
              <div>${t('pdf.position')}: (${placedPiece.x}, ${placedPiece.y})</div>
              ${placedPiece.isRotated ? `<div><em>${t('common.rotated') || 'Rotated'} 90°</em></div>` : ''}
            `);

          tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY - 10}px`);
        })
        .on('mousemove', event => {
          d3.select('.piece-tooltip')
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`);
        })
        .on('mouseout', function () {
          d3.select(this).select('rect').attr('fill-opacity', 0.7).attr('stroke-width', 1);

          d3.select('.piece-tooltip').remove();
        });
    });

    // Calculate used and unused area for current sheet
    const totalSheetArea = sheetWidth * sheetHeight;
    const usedArea = currentSheet.placedPieces.reduce((sum, piece) => sum + piece.width * piece.height, 0);
    const unusedArea = totalSheetArea - usedArea;
    const wastePercentage = ((unusedArea / totalSheetArea) * 100).toFixed(1);

    // Add sheet dimensions and waste info
    g.append('text')
      .attr('x', scaledSheetWidth / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#666')
      .text(`${sheetWidth} × ${sheetHeight} mm`);

    g.append('text')
      .attr('x', scaledSheetWidth / 2)
      .attr('y', -3)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', wastePercentage > 20 ? '#f44336' : wastePercentage > 10 ? '#ff9800' : '#4caf50')
      .text(`${t('visualization.waste')}: ${unusedArea.toLocaleString()} mm² (${wastePercentage}%)`);

    // Add legend for piece types
    const legend = g
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${scaledSheetWidth + 20}, 20)`);

    // Legend title
    legend
      .append('text')
      .attr('x', 0)
      .attr('y', -5)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text(t('visualization.placedPieces'));

    pieces.forEach((piece, index) => {
      const legendItem = legend.append('g').attr('transform', `translate(0, ${index * 20})`);

      legendItem
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', colorScale(index))
        .attr('rx', 2);

      legendItem
        .append('text')
        .attr('x', 18)
        .attr('y', 9)
        .attr('font-size', '10px')
        .attr('fill', '#666')
        .text(`${piece.width}×${piece.height} (${piece.quantity})`);
    });

    // Add waste area legend
    const wasteItem = legend.append('g').attr('transform', `translate(0, ${pieces.length * 20 + 10})`);

    wasteItem
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', '#ffebee')
      .attr('fill-opacity', 0.5)
      .attr('stroke', '#f44336')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2')
      .attr('rx', 2);

    wasteItem.append('text').attr('x', 18).attr('y', 9).attr('font-size', '10px').attr('fill', '#666').text(t('visualization.wasteAreas'));
  }, [sheetWidth, sheetHeight, pieces, layout, currentSheetIndex, t]);

  if (!sheetWidth || !sheetHeight || !pieces || !layout || layout.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color='text.secondary'>{t('visualization.noResults') || 'No layout data available for visualization'}</Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          {t('visualization.noResultsDesc') || 'This project may have been created before the visualization feature was added.'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box ref={visualizationRef}>
      {showTitle && (
        <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
          <Typography variant='h6' gutterBottom>
            {displayTitle}
          </Typography>
          {enablePDFExport && projectData && (
            <Tooltip title={t('visualization.exportPDF')}>
              <IconButton onClick={handlePDFExport} disabled={isExporting} color='primary' size='small'>
                {isExporting ? <CircularProgress size={20} /> : <PdfIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {/* Sheet Selection */}
      {layout && layout.length > 1 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <ButtonGroup variant='outlined' size='small'>
            {layout.map((sheet, index) => (
              <Button
                key={index}
                variant={currentSheetIndex === index ? 'contained' : 'outlined'}
                onClick={() => setCurrentSheetIndex(index)}
              >
                {t('visualization.sheetNumber', { number: index + 1 })}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      )}

      {/* Waste Information Panel */}
      {layout && layout.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant='outlined'>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  {t('visualization.sheetNumber', { number: currentSheetIndex + 1 })}{' '}
                  {t('visualization.ofSheets', { total: layout.length })}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      {t('visualization.pieces')}
                    </Typography>
                    <Typography variant='h6' color='primary.main'>
                      {layout[currentSheetIndex] ? layout[currentSheetIndex].placedPieces.length : 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      {t('visualization.guillotineCuts')}
                    </Typography>
                    <Typography variant='h6' color='info.main'>
                      {layout[currentSheetIndex] ? layout[currentSheetIndex].totalGuillotineCuts || 0 : 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      {t('visualization.efficiency')}
                    </Typography>
                    <Typography
                      variant='h6'
                      color={
                        layout[currentSheetIndex]
                          ? (layout[currentSheetIndex].placedPieces.reduce((sum, piece) => sum + piece.width * piece.height, 0) /
                              (sheetWidth * sheetHeight)) *
                              100 >
                            80
                            ? 'success.main'
                            : 'warning.main'
                          : 'text.primary'
                      }
                    >
                      {layout[currentSheetIndex]
                        ? (
                            (layout[currentSheetIndex].placedPieces.reduce((sum, piece) => sum + piece.width * piece.height, 0) /
                              (sheetWidth * sheetHeight)) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {layout.length > 1 && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant='outlined'>
                {' '}
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    {t('pdf.projectOverview')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Box>
                      <Typography variant='body2' color='text.secondary'>
                        {t('visualization.pieces')}
                      </Typography>
                      <Typography variant='h6' color='primary.main'>
                        {layout.reduce((sum, sheet) => sum + sheet.placedPieces.length, 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='body2' color='text.secondary'>
                        {t('visualization.cuts')}
                      </Typography>
                      <Typography variant='h6' color='info.main'>
                        {layout.reduce((sum, sheet) => sum + (sheet.totalGuillotineCuts || 0), 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='body2' color='text.secondary'>
                        {t('dashboard.avgEfficiency')}
                      </Typography>
                      <Typography variant='h6' color='primary.main'>
                        {(
                          (layout.reduce(
                            (sum, sheet) => sum + sheet.placedPieces.reduce((sheetSum, piece) => sheetSum + piece.width * piece.height, 0),
                            0
                          ) /
                            (layout.length * sheetWidth * sheetHeight)) *
                          100
                        ).toFixed(1)}
                        %
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <svg ref={svgRef} />
      </Paper>
    </Box>
  );
}

export default CuttingPlanVisualization;
