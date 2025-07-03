import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * PDFExportService Class
 *
 * TERMINOLOGY:
 * - PIECE: Each object with width and height that needs to be cut from the sheet (user input)
 * - GUILLOTINE CUT: Each straight cut operation that divides a sheet area into two parts (algorithm operation)
 *
 * This service generates comprehensive PDF reports showing:
 * 1. The pieces that need to be cut (user requirements)
 * 2. The guillotine cuts required to extract them from the sheets
 * 3. Optimized sheet layouts and cutting efficiency statistics
 *
 * The PDF includes multiple sections:
 * - Project summary with piece and cutting statistics
 * - Individual sheet layouts with piece placement and cut visualization
 * - Detailed piece requirements table
 * - Guillotine cut sequences and efficiency metrics
 */
class PDFExportService {
  constructor() {
    this.companyName = 'GCut';
    this.companySubtitle = 'Advanced Cutting Optimization Solutions';
    this.website = 'gfel.in/gcut';
    this.version = '1.0.0.1';
    this.developer = 'Gonzalo Melgarejo - GMDev SAC';
  }

  async exportVisualizationToPDF(projectData, visualizationElement, options = {}) {
    const {
      fileName = `cutting-plan-${projectData.name || 'project'}-${new Date().toISOString().split('T')[0]}.pdf`,
      includeStats = true,
      includeDetails = true,
      paperSize = 'a4',
      orientation = 'portrait'
    } = options;

    try {
      // Create PDF document
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: paperSize
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const totalPages = 1 + (projectData.layout?.length || 0) + (includeDetails ? 1 : 0);

      // Add project summary page
      this.addHeader(pdf, pageWidth, projectData);
      let currentY = this.addProjectInfo(pdf, projectData, pageWidth, 35);

      if (includeStats) {
        currentY = this.addProjectStatistics(pdf, projectData, pageWidth, currentY + 10);
      }

      // Add footer to summary page
      this.addFooter(pdf, pageWidth, pageHeight, 1, totalPages);

      // Add one complete page per sheet with individual visualizations
      if (projectData.layout && projectData.layout.length > 0) {
        for (let sheetIndex = 0; sheetIndex < projectData.layout.length; sheetIndex++) {
          pdf.addPage();
          await this.addCompleteSheetPage(pdf, projectData, sheetIndex, pageWidth, pageHeight, sheetIndex + 2, totalPages);
        }
      }

      // Add piece details table if requested
      if (includeDetails && projectData.pieces) {
        pdf.addPage();
        this.addHeader(pdf, pageWidth, { ...projectData, name: `${projectData.name} - Piece Requirements` });
        this.addPieceDetailsTable(pdf, projectData.pieces, pageWidth, 35);
        this.addFooter(pdf, pageWidth, pageHeight, totalPages, totalPages);
      }

      // Save the PDF
      pdf.save(fileName);

      return {
        success: true,
        fileName,
        message: 'PDF exported successfully'
      };
    } catch (error) {
      console.error('Error exporting PDF:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to export PDF'
      };
    }
  }

  addHeader(pdf, pageWidth, projectData) {
    // Background header strip
    pdf.setFillColor(25, 118, 210); // Material UI primary blue
    pdf.rect(0, 0, pageWidth, 25, 'F');

    // Company logo area (placeholder for now)
    pdf.setFillColor(255, 255, 255);
    pdf.rect(10, 5, 15, 15, 'F');
    pdf.setTextColor(25, 118, 210);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('GC', 17.5, 14, { align: 'center' });

    // Company name and subtitle
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(this.companyName, 30, 12);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(this.companySubtitle, 30, 18);

    // Project title on the right
    if (projectData.name) {
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Project: ${projectData.name}`, pageWidth - 10, 12, { align: 'right' });

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 10, 18, { align: 'right' });
    }

    // Reset text color
    pdf.setTextColor(0, 0, 0);
  }

  addProjectInfo(pdf, projectData, pageWidth, startY) {
    let currentY = startY;

    // Project Information section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Project Information', 10, currentY);
    currentY += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const info = [
      ['Material Type:', projectData.materialType || 'Not specified'],
      ['Sheet Dimensions:', `${projectData.sheetWidth || 0} × ${projectData.sheetHeight || 0} mm`],
      ['Sheets Required:', projectData.sheetsNeeded || 0],
      ['Total Pieces:', projectData.totalPieces || 0],
      ['Material Efficiency:', `${projectData.efficiency || 0}%`],
      ['Total Piece Area:', `${projectData.totalPieceArea || 0} mm²`],
      ['Sheet Area:', `${projectData.sheetArea || 0} mm²`],
      ['Created:', new Date(projectData.createdAt || new Date()).toLocaleDateString()]
    ];

    const colWidth = (pageWidth - 20) / 2;

    info.forEach((item, index) => {
      const x = 10 + (index % 2) * colWidth;
      const y = currentY + Math.floor(index / 2) * 6;

      pdf.setFont('helvetica', 'bold');
      pdf.text(item[0], x, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(String(item[1]), x + 40, y);
    });

    return currentY + Math.ceil(info.length / 2) * 6;
  }

  addProjectStatistics(pdf, projectData, pageWidth, startY) {
    let currentY = startY;

    // Statistics section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Project Overview', 10, currentY);
    currentY += 8;

    if (projectData.layout) {
      const totalSheets = projectData.layout.length;
      const totalUsedArea = projectData.layout.reduce(
        (sum, sheet) => sum + sheet.placedPieces.reduce((sheetSum, piece) => sheetSum + piece.width * piece.height, 0),
        0
      );
      const totalSheetArea = totalSheets * projectData.sheetWidth * projectData.sheetHeight;
      const overallEfficiency = ((totalUsedArea / totalSheetArea) * 100).toFixed(1);
      const totalWaste = totalSheetArea - totalUsedArea;
      const totalGuillotineCuts = projectData.layout.reduce((sum, sheet) => sum + (sheet.totalGuillotineCuts || 0), 0);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const summaryInfo = [
        ['Total Sheets:', `${totalSheets}`],
        ['Total Pieces:', `${projectData.layout.reduce((sum, sheet) => sum + sheet.placedPieces.length, 0)}`],
        ['Total Guillotine Cuts:', `${totalGuillotineCuts}`],
        ['Overall Efficiency:', `${overallEfficiency}%`],
        ['Total Material Used:', `${totalUsedArea.toLocaleString()} mm²`],
        ['Total Material Waste:', `${totalWaste.toLocaleString()} mm²`],
        [
          'Cutting Complexity:',
          `${(totalGuillotineCuts / projectData.layout.reduce((sum, sheet) => sum + sheet.placedPieces.length, 0)).toFixed(1)} cuts per piece`
        ]
      ];

      summaryInfo.forEach((item, index) => {
        const y = currentY + index * 5;
        pdf.setFont('helvetica', 'bold');
        pdf.text(item[0], 15, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(String(item[1]), 70, y);
      });

      currentY += summaryInfo.length * 5 + 10;

      // Individual sheet preview
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Sheet Summary:', 15, currentY);
      currentY += 6;

      projectData.layout.forEach((sheet, index) => {
        const sheetUsedArea = sheet.placedPieces.reduce((sum, piece) => sum + piece.width * piece.height, 0);
        const sheetTotalArea = projectData.sheetWidth * projectData.sheetHeight;
        const sheetEfficiency = ((sheetUsedArea / sheetTotalArea) * 100).toFixed(1);
        const sheetWaste = sheetTotalArea - sheetUsedArea;
        const sheetGuillotineCuts = sheet.totalGuillotineCuts || 0;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');

        const efficiencyColor = sheetEfficiency >= 80 ? [76, 175, 80] : sheetEfficiency >= 60 ? [255, 152, 0] : [244, 67, 54];

        pdf.text(`Sheet ${index + 1}:`, 20, currentY);
        pdf.text(`${sheetEfficiency}% efficient`, 45, currentY);
        pdf.text(`${sheet.placedPieces.length} pieces`, 80, currentY);
        pdf.text(`${sheetGuillotineCuts} cuts`, 115, currentY);
        pdf.text(`${sheetWaste.toLocaleString()}mm² waste`, 145, currentY);

        currentY += 4;
      });
    }

    return currentY;
  }

  async addCompleteSheetPage(pdf, projectData, sheetIndex, pageWidth, pageHeight, currentPageNum, totalPages) {
    const sheet = projectData.layout[sheetIndex];
    const sheetUsedArea = sheet.placedPieces.reduce((sum, piece) => sum + piece.width * piece.height, 0);
    const sheetTotalArea = projectData.sheetWidth * projectData.sheetHeight;
    const sheetEfficiency = ((sheetUsedArea / sheetTotalArea) * 100).toFixed(1);
    const sheetWaste = sheetTotalArea - sheetUsedArea;
    const sheetGuillotineCuts = sheet.totalGuillotineCuts || 0;

    // Add header with sheet-specific information
    this.addHeader(pdf, pageWidth, {
      ...projectData,
      name: `${projectData.name} - Sheet ${sheetIndex + 1} of ${projectData.layout.length}`
    });

    let currentY = 35;

    // Sheet information panel - make it more prominent
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Sheet ${sheetIndex + 1} Layout`, 10, currentY);
    currentY += 12;

    // Sheet statistics in a styled box
    const statsBoxHeight = 35;
    pdf.setFillColor(248, 249, 250);
    pdf.rect(10, currentY - 8, pageWidth - 20, statsBoxHeight, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(10, currentY - 8, pageWidth - 20, statsBoxHeight, 'S');

    // Statistics in two rows for better layout
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    const col1Width = (pageWidth - 30) / 3;
    const col2Width = (pageWidth - 30) / 3;
    const col3Width = (pageWidth - 30) / 3;

    // First row
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sheet Dimensions:', 15, currentY);
    pdf.text('Total Pieces:', 15 + col1Width, currentY);
    pdf.text('Guillotine Cuts:', 15 + col1Width + col2Width, currentY);

    pdf.setFont('helvetica', 'normal');
    pdf.text(`${projectData.sheetWidth} × ${projectData.sheetHeight} mm`, 15, currentY + 7);
    pdf.text(`${sheet.placedPieces.length} pieces`, 15 + col1Width, currentY + 7);
    pdf.text(`${sheetGuillotineCuts} cuts`, 15 + col1Width + col2Width, currentY + 7);

    // Second row
    currentY += 15;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Used Area:', 15, currentY);
    pdf.text('Waste Area:', 15 + col1Width, currentY);
    pdf.text('Efficiency:', 15 + col1Width + col2Width, currentY);

    pdf.setFont('helvetica', 'normal');
    pdf.text(`${sheetUsedArea.toLocaleString()} mm²`, 15, currentY + 7);
    pdf.text(`${sheetWaste.toLocaleString()} mm²`, 15 + col1Width, currentY + 7);

    // Color-code efficiency
    const efficiencyColor = sheetEfficiency >= 80 ? [76, 175, 80] : sheetEfficiency >= 60 ? [255, 152, 0] : [244, 67, 54];
    pdf.setTextColor(efficiencyColor[0], efficiencyColor[1], efficiencyColor[2]);
    pdf.text(`${sheetEfficiency}%`, 15 + col1Width + col2Width, currentY + 7);
    pdf.setTextColor(0, 0, 0);

    currentY += 15;

    // Calculate available space for visualization in portrait mode
    const availableHeight = pageHeight - currentY - 120; // More space reserved for cut list in portrait
    const availableWidth = pageWidth - 20;

    // Generate high-quality sheet visualization
    await this.generateHighQualitySheetVisualization(
      pdf,
      projectData,
      sheetIndex,
      pageWidth,
      pageHeight,
      currentY,
      availableWidth,
      availableHeight
    );

    // Add piece list at the bottom of the page with more space in portrait
    const pieceListY = pageHeight - 100;
    this.addCompactSheetPieceList(pdf, projectData, sheet, pageWidth, pieceListY);

    // Add footer
    this.addFooter(pdf, pageWidth, pageHeight, currentPageNum, totalPages);
  }

  async generateHighQualitySheetVisualization(
    pdf,
    projectData,
    sheetIndex,
    pageWidth,
    pageHeight,
    startY,
    availableWidth,
    availableHeight
  ) {
    try {
      // Create a temporary container for the sheet visualization with dimensions optimized for portrait
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px'; // Adjusted for portrait layout
      container.style.height = '1000px'; // Taller for portrait
      container.style.backgroundColor = 'white';
      container.style.padding = '30px';
      container.style.boxSizing = 'border-box';
      document.body.appendChild(container);

      // Create title
      const title = document.createElement('h2');
      title.textContent = `Sheet ${sheetIndex + 1} - Cutting Layout`;
      title.style.margin = '0 0 20px 0';
      title.style.fontSize = '22px';
      title.style.fontWeight = 'bold';
      title.style.color = '#333';
      title.style.textAlign = 'center';
      container.appendChild(title);

      // Create SVG for this specific sheet with portrait dimensions
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '740'); // Narrower for portrait
      svg.setAttribute('height', '920'); // Taller for portrait
      svg.style.backgroundColor = 'white';
      svg.style.border = '1px solid #ddd';
      svg.style.borderRadius = '8px';
      container.appendChild(svg);

      // Draw the sheet layout with improved styling
      this.drawHighQualitySheetSVG(svg, projectData, sheetIndex);

      // Capture the visualization with higher quality settings
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 3, // Higher scale for better quality
        useCORS: true,
        logging: false,
        width: 800,
        height: 1000,
        allowTaint: false,
        foreignObjectRendering: false
      });

      // Clean up
      document.body.removeChild(container);

      // Calculate dimensions to fit optimally on portrait page
      const canvasRatio = canvas.height / canvas.width;
      let imgWidth = Math.min(availableWidth, availableWidth * 0.95);
      let imgHeight = imgWidth * canvasRatio;

      // If height is too large, scale down
      if (imgHeight > availableHeight) {
        imgHeight = availableHeight * 0.95;
        imgWidth = imgHeight / canvasRatio;
      }

      // Center the image horizontally
      const x = (pageWidth - imgWidth) / 2;
      const y = startY + 5;

      // Add border around the visualization
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.rect(x - 2, y - 2, imgWidth + 4, imgHeight + 4, 'S');

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
    } catch (error) {
      console.error('Error generating high-quality sheet visualization:', error);

      // Fallback: Add a styled placeholder
      this.addVisualizationFallback(pdf, projectData, sheetIndex, pageWidth, startY, availableWidth, availableHeight);
    }
  }

  addVisualizationFallback(pdf, projectData, sheetIndex, pageWidth, startY, availableWidth, availableHeight) {
    const sheet = projectData.layout[sheetIndex];

    // Create a styled fallback visualization
    const boxWidth = Math.min(availableWidth * 0.8, 200);
    const boxHeight = Math.min(availableHeight * 0.6, 150);
    const x = (pageWidth - boxWidth) / 2;
    const y = startY + 20;

    // Draw sheet outline
    pdf.setFillColor(245, 245, 245);
    pdf.rect(x, y, boxWidth, boxHeight, 'F');
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(1);
    pdf.rect(x, y, boxWidth, boxHeight, 'S');

    // Add sheet info
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Sheet ${sheetIndex + 1}`, pageWidth / 2, y + 25, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${projectData.sheetWidth} × ${projectData.sheetHeight} mm`, pageWidth / 2, y + 40, { align: 'center' });
    pdf.text(`${sheet.placedPieces.length} pieces to be cut`, pageWidth / 2, y + 55, { align: 'center' });

    pdf.setFontSize(10);
    pdf.text('(High-quality visualization not available)', pageWidth / 2, y + 75, { align: 'center' });

    // Draw simplified piece rectangles
    const colors = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'];
    const pieceBoxSize = Math.min(boxWidth / 6, boxHeight / 4);
    const startPieceX = x + 20;
    const startPieceY = y + 90;

    sheet.placedPieces.slice(0, 8).forEach((piece, index) => {
      const pieceX = startPieceX + (index % 4) * (pieceBoxSize + 5);
      const pieceY = startPieceY + Math.floor(index / 4) * (pieceBoxSize + 5);

      pdf.setFillColor(...this.hexToRgb(colors[index % colors.length]));
      pdf.rect(pieceX, pieceY, pieceBoxSize, pieceBoxSize * 0.6, 'F');
      pdf.setDrawColor(255, 255, 255);
      pdf.rect(pieceX, pieceY, pieceBoxSize, pieceBoxSize * 0.6, 'S');
    });

    if (sheet.placedPieces.length > 8) {
      pdf.setFontSize(8);
      pdf.text(`+${sheet.placedPieces.length - 8} more...`, startPieceX, startPieceY + pieceBoxSize + 15);
    }
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [128, 128, 128];
  }

  drawHighQualitySheetSVG(svg, projectData, sheetIndex) {
    const sheet = projectData.layout[sheetIndex];
    const { sheetWidth } = projectData;
    const { sheetHeight } = projectData;

    // Calculate scale to fit in SVG with portrait orientation
    const svgWidth = 740; // Narrower for portrait
    const svgHeight = 920; // Taller for portrait
    const margin = 50;

    const availableWidth = svgWidth - 2 * margin;
    const availableHeight = svgHeight - 2 * margin - 60; // Extra margin for dimensions text

    const scaleX = availableWidth / sheetWidth;
    const scaleY = availableHeight / sheetHeight;
    const scale = Math.min(scaleX, scaleY) * 0.85; // Slightly smaller scale for better fit

    const scaledSheetWidth = sheetWidth * scale;
    const scaledSheetHeight = sheetHeight * scale;
    const offsetX = (svgWidth - scaledSheetWidth) / 2;
    const offsetY = 70; // Start lower to accommodate title and dimensions

    // Add definitions for gradients and patterns
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Sheet gradient
    const sheetGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    sheetGradient.setAttribute('id', 'sheetGradient');
    sheetGradient.setAttribute('x1', '0%');
    sheetGradient.setAttribute('y1', '0%');
    sheetGradient.setAttribute('x2', '100%');
    sheetGradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#f8f9fa');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#e9ecef');

    sheetGradient.appendChild(stop1);
    sheetGradient.appendChild(stop2);
    defs.appendChild(sheetGradient);
    svg.appendChild(defs);

    // Draw sheet background with gradient and shadow effect
    const shadowRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    shadowRect.setAttribute('x', offsetX + 3);
    shadowRect.setAttribute('y', offsetY + 3);
    shadowRect.setAttribute('width', scaledSheetWidth);
    shadowRect.setAttribute('height', scaledSheetHeight);
    shadowRect.setAttribute('fill', 'rgba(0,0,0,0.1)');
    shadowRect.setAttribute('rx', '8');
    svg.appendChild(shadowRect);

    const sheetRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    sheetRect.setAttribute('x', offsetX);
    sheetRect.setAttribute('y', offsetY);
    sheetRect.setAttribute('width', scaledSheetWidth);
    sheetRect.setAttribute('height', scaledSheetHeight);
    sheetRect.setAttribute('fill', 'url(#sheetGradient)');
    sheetRect.setAttribute('stroke', '#495057');
    sheetRect.setAttribute('stroke-width', '2');
    sheetRect.setAttribute('rx', '8');
    svg.appendChild(sheetRect);

    // Enhanced color palette with better contrast
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0097a7', '#5d4037', '#455a64', '#c62828', '#2e7d32'];

    // Find waste areas for highlighting
    const wasteAreas = this.findWasteAreas(sheet.placedPieces, sheetWidth, sheetHeight);

    // Draw waste areas first (so pieces appear on top)
    wasteAreas.forEach((waste, index) => {
      if (waste.width > 20 && waste.height > 20) {
        // Only significant waste
        const wasteRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        wasteRect.setAttribute('x', offsetX + waste.x * scale);
        wasteRect.setAttribute('y', offsetY + waste.y * scale);
        wasteRect.setAttribute('width', waste.width * scale);
        wasteRect.setAttribute('height', waste.height * scale);
        wasteRect.setAttribute('fill', '#ffebee');
        wasteRect.setAttribute('fill-opacity', '0.7');
        wasteRect.setAttribute('stroke', '#ef5350');
        wasteRect.setAttribute('stroke-width', '1');
        wasteRect.setAttribute('stroke-dasharray', '5,5');
        wasteRect.setAttribute('rx', '3');
        svg.appendChild(wasteRect);

        // Add waste label if space allows
        if (waste.width * scale > 50 && waste.height * scale > 30) {
          const wasteText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          wasteText.setAttribute('x', offsetX + waste.x * scale + (waste.width * scale) / 2);
          wasteText.setAttribute('y', offsetY + waste.y * scale + (waste.height * scale) / 2);
          wasteText.setAttribute('text-anchor', 'middle');
          wasteText.setAttribute('dominant-baseline', 'middle');
          wasteText.setAttribute('fill', '#d32f2f');
          wasteText.setAttribute('font-size', '10px');
          wasteText.setAttribute('font-weight', 'bold');
          wasteText.textContent = 'WASTE';
          svg.appendChild(wasteText);
        }
      }
    });

    // Draw pieces with improved styling
    sheet.placedPieces.forEach((piece, index) => {
      const color = colors[piece.pieceId % colors.length];

      // Piece rectangle with gradient
      const pieceRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      pieceRect.setAttribute('x', offsetX + piece.x * scale);
      pieceRect.setAttribute('y', offsetY + piece.y * scale);
      pieceRect.setAttribute('width', piece.width * scale);
      pieceRect.setAttribute('height', piece.height * scale);
      pieceRect.setAttribute('fill', color);
      pieceRect.setAttribute('fill-opacity', '0.85');
      pieceRect.setAttribute('stroke', '#ffffff');
      pieceRect.setAttribute('stroke-width', '2');
      pieceRect.setAttribute('rx', '4');
      svg.appendChild(pieceRect);

      // Add piece border for better definition
      const pieceBorder = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      pieceBorder.setAttribute('x', offsetX + piece.x * scale);
      pieceBorder.setAttribute('y', offsetY + piece.y * scale);
      pieceBorder.setAttribute('width', piece.width * scale);
      pieceBorder.setAttribute('height', piece.height * scale);
      pieceBorder.setAttribute('fill', 'none');
      pieceBorder.setAttribute('stroke', color);
      pieceBorder.setAttribute('stroke-width', '1');
      pieceBorder.setAttribute('rx', '4');
      svg.appendChild(pieceBorder);

      // Add text label with better visibility
      if (piece.width * scale > 40 && piece.height * scale > 25) {
        // Add white background for text
        const textBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const textWidth = Math.min(piece.width * scale - 8, 80);
        const textHeight = 16;
        textBg.setAttribute('x', offsetX + piece.x * scale + (piece.width * scale - textWidth) / 2);
        textBg.setAttribute('y', offsetY + piece.y * scale + (piece.height * scale - textHeight) / 2);
        textBg.setAttribute('width', textWidth);
        textBg.setAttribute('height', textHeight);
        textBg.setAttribute('fill', 'rgba(255,255,255,0.9)');
        textBg.setAttribute('rx', '2');
        svg.appendChild(textBg);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', offsetX + piece.x * scale + (piece.width * scale) / 2);
        text.setAttribute('y', offsetY + piece.y * scale + (piece.height * scale) / 2);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', '#333');
        text.setAttribute('font-size', '12px');
        text.setAttribute('font-weight', 'bold');
        text.textContent = `${piece.width}×${piece.height}`;
        svg.appendChild(text);
      }

      // Add piece number in corner
      if (piece.width * scale > 30 && piece.height * scale > 20) {
        const numberCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        numberCircle.setAttribute('cx', offsetX + piece.x * scale + 12);
        numberCircle.setAttribute('cy', offsetY + piece.y * scale + 12);
        numberCircle.setAttribute('r', '8');
        numberCircle.setAttribute('fill', '#ffffff');
        numberCircle.setAttribute('stroke', color);
        numberCircle.setAttribute('stroke-width', '2');
        svg.appendChild(numberCircle);

        const numberText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        numberText.setAttribute('x', offsetX + piece.x * scale + 12);
        numberText.setAttribute('y', offsetY + piece.y * scale + 12);
        numberText.setAttribute('text-anchor', 'middle');
        numberText.setAttribute('dominant-baseline', 'middle');
        numberText.setAttribute('fill', color);
        numberText.setAttribute('font-size', '10px');
        numberText.setAttribute('font-weight', 'bold');
        numberText.textContent = String(index + 1);
        svg.appendChild(numberText);
      }
    });

    // Add sheet dimensions and scale
    const dimGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Top dimension line
    const topLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    topLine.setAttribute('x1', offsetX);
    topLine.setAttribute('y1', offsetY - 20);
    topLine.setAttribute('x2', offsetX + scaledSheetWidth);
    topLine.setAttribute('y2', offsetY - 20);
    topLine.setAttribute('stroke', '#666');
    topLine.setAttribute('stroke-width', '1');
    dimGroup.appendChild(topLine);

    const dimText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    dimText.setAttribute('x', offsetX + scaledSheetWidth / 2);
    dimText.setAttribute('y', offsetY - 25);
    dimText.setAttribute('text-anchor', 'middle');
    dimText.setAttribute('font-size', '14px');
    dimText.setAttribute('font-weight', 'bold');
    dimText.setAttribute('fill', '#495057');
    dimText.textContent = `${sheetWidth} × ${sheetHeight} mm`;
    dimGroup.appendChild(dimText);

    // Side dimension line
    const sideLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    sideLine.setAttribute('x1', offsetX - 20);
    sideLine.setAttribute('y1', offsetY);
    sideLine.setAttribute('x2', offsetX - 20);
    sideLine.setAttribute('y2', offsetY + scaledSheetHeight);
    sideLine.setAttribute('stroke', '#666');
    sideLine.setAttribute('stroke-width', '1');
    dimGroup.appendChild(sideLine);

    svg.appendChild(dimGroup);

    // Add legend at bottom - positioned for portrait layout
    this.addPieceLegend(svg, sheet.placedPieces, colors, svgWidth, svgHeight - 30);
  }

  findWasteAreas(pieces, sheetWidth, sheetHeight) {
    // Simple waste detection - find rectangular areas not covered by pieces
    const wasteAreas = [];
    const gridSize = 20; // Larger grid for waste detection
    const gridWidth = Math.ceil(sheetWidth / gridSize);
    const gridHeight = Math.ceil(sheetHeight / gridSize);
    const grid = Array(gridHeight)
      .fill(null)
      .map(() => Array(gridWidth).fill(false));

    // Mark used areas
    pieces.forEach(piece => {
      const startX = Math.floor(piece.x / gridSize);
      const endX = Math.min(Math.ceil((piece.x + piece.width) / gridSize), gridWidth);
      const startY = Math.floor(piece.y / gridSize);
      const endY = Math.min(Math.ceil((piece.y + piece.height) / gridSize), gridHeight);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          grid[y][x] = true;
        }
      }
    });

    // Find waste rectangles
    const visited = Array(gridHeight)
      .fill(null)
      .map(() => Array(gridWidth).fill(false));

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (!grid[y][x] && !visited[y][x]) {
          let width = 0;
          let height = 0;

          // Find max width
          while (x + width < gridWidth && !grid[y][x + width] && !visited[y][x + width]) {
            width++;
          }

          // Find max height
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

          // Mark as visited
          for (let h = 0; h < height; h++) {
            for (let w = 0; w < width; w++) {
              visited[y + h][x + w] = true;
            }
          }

          const wasteWidth = width * gridSize;
          const wasteHeight = height * gridSize;

          if (wasteWidth > 40 && wasteHeight > 40) {
            wasteAreas.push({
              x: x * gridSize,
              y: y * gridSize,
              width: Math.min(wasteWidth, sheetWidth - x * gridSize),
              height: Math.min(wasteHeight, sheetHeight - y * gridSize)
            });
          }
        }
      }
    }

    return wasteAreas;
  }

  addPieceLegend(svg, pieces, colors, svgWidth, legendY) {
    if (pieces.length <= 5) return; // Only add legend for complex layouts

    const legendWidth = Math.min(svgWidth - 40, 600);
    const legendX = (svgWidth - legendWidth) / 2;

    // Legend background
    const legendBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    legendBg.setAttribute('x', legendX);
    legendBg.setAttribute('y', legendY - 5);
    legendBg.setAttribute('width', legendWidth);
    legendBg.setAttribute('height', 25);
    legendBg.setAttribute('fill', 'rgba(255,255,255,0.9)');
    legendBg.setAttribute('stroke', '#ddd');
    legendBg.setAttribute('rx', '4');
    svg.appendChild(legendBg);

    // Show first 8 pieces in legend
    const legendPieces = pieces.slice(0, 8);
    const itemWidth = legendWidth / legendPieces.length;

    legendPieces.forEach((piece, index) => {
      const x = legendX + index * itemWidth + 10;

      // Color box
      const colorBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      colorBox.setAttribute('x', x);
      colorBox.setAttribute('y', legendY);
      colorBox.setAttribute('width', '12');
      colorBox.setAttribute('height', '12');
      colorBox.setAttribute('fill', colors[piece.pieceId % colors.length]);
      colorBox.setAttribute('rx', '2');
      svg.appendChild(colorBox);

      // Label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x + 16);
      label.setAttribute('y', legendY + 8);
      label.setAttribute('font-size', '8px');
      label.setAttribute('fill', '#666');
      label.textContent = `${piece.width}×${piece.height}`;
      svg.appendChild(label);
    });

    if (pieces.length > 8) {
      const moreText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      moreText.setAttribute('x', legendX + legendWidth - 40);
      moreText.setAttribute('y', legendY + 8);
      moreText.setAttribute('font-size', '8px');
      moreText.setAttribute('fill', '#666');
      moreText.textContent = `+${pieces.length - 8} more`;
      svg.appendChild(moreText);
    }
  }

  addCompactSheetPieceList(pdf, projectData, sheet, pageWidth, startY) {
    let currentY = startY;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Piece List for This Sheet:', 10, currentY);
    currentY += 8;

    // Create a more compact table
    const cols = 6;
    const colWidth = (pageWidth - 20) / cols;
    const rowHeight = 12;

    // Header row with better styling
    pdf.setFillColor(230, 240, 250);
    pdf.rect(10, currentY - 3, pageWidth - 20, rowHeight - 2, 'F');
    pdf.setDrawColor(180, 180, 180);
    pdf.rect(10, currentY - 3, pageWidth - 20, rowHeight - 2, 'S');

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    const headers = ['#', 'Width (mm)', 'Height (mm)', 'Position (x,y)', 'Area (mm²)', 'Instance'];
    headers.forEach((header, i) => {
      const x = 10 + i * colWidth + 3;
      pdf.text(header, x, currentY + 3);
    });
    currentY += rowHeight;

    // Data rows with alternating colors
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);

    // Sort pieces by position for logical reference
    const sortedPieces = [...sheet.placedPieces].sort((a, b) => {
      return a.y * 1000 + a.x - (b.y * 1000 + b.x); // Sort by position
    });

    sortedPieces.forEach((piece, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(10, currentY - 2, pageWidth - 20, rowHeight - 2, 'F');
      }

      const pieceData = [
        String(index + 1),
        String(piece.width),
        String(piece.height),
        `(${piece.x}, ${piece.y})`,
        (piece.width * piece.height).toLocaleString(),
        `${piece.pieceId + 1}.${piece.instanceIndex + 1}${piece.isRotated ? ' ↻' : ''}`
      ];

      pieceData.forEach((data, i) => {
        const x = 10 + i * colWidth + 3;
        // Color-code important information
        if (i === 4) {
          // Area column
          const area = piece.width * piece.height;
          if (area > 50000) {
            pdf.setTextColor(76, 175, 80); // Green for large pieces
          } else if (area < 10000) {
            pdf.setTextColor(244, 67, 54); // Red for small pieces
          } else {
            pdf.setTextColor(0, 0, 0);
          }
        } else if (i === 5 && piece.isRotated) {
          // Instance column with rotation
          pdf.setTextColor(255, 152, 0); // Orange for rotated pieces
        } else {
          pdf.setTextColor(0, 0, 0);
        }

        pdf.text(data, x, currentY + 3);
      });
      currentY += rowHeight - 2;
    });

    // Reset color
    pdf.setTextColor(0, 0, 0);

    // Add summary info with guillotine cut details
    currentY += 5;
    const totalPieces = sheet.placedPieces.length;
    const totalArea = sheet.placedPieces.reduce((sum, piece) => sum + piece.width * piece.height, 0);
    const avgPieceSize = Math.round(totalArea / totalPieces);
    const totalGuillotineCuts = sheet.totalGuillotineCuts || 0;
    const cutsPerPiece = totalPieces > 0 ? (totalGuillotineCuts / totalPieces).toFixed(1) : 0;

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text(
      `Summary: ${totalPieces} pieces total, ${totalArea.toLocaleString()} mm² used, avg ${avgPieceSize.toLocaleString()} mm² per piece`,
      10,
      currentY
    );
    currentY += 4;
    pdf.text(`Cutting: ${totalGuillotineCuts} guillotine cuts required, ${cutsPerPiece} cuts per piece average`, 10, currentY);

    return currentY;
  }

  addLegacyCutDetailsTable(pdf, cuts, pageWidth, startY) {
    // DEPRECATED: This method was misnamed. Use addPieceDetailsTable instead.
    // This method actually processes piece data (width, height, quantity), not guillotine cuts.
    // Kept for backwards compatibility if needed.
    let currentY = startY;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const usableHeight = pageHeight - 40; // Leave space for footer
    const rowHeight = 10;

    // Add project summary at the top
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Complete Cut Details & Material Requirements', 10, currentY);
    currentY += 15;

    // Add summary statistics box
    const totalPieces = cuts.reduce((sum, cut) => sum + cut.quantity, 0);
    const totalMaterial = cuts.reduce((sum, cut) => sum + cut.width * cut.height * cut.quantity, 0);
    const uniqueSizes = cuts.length;

    pdf.setFillColor(248, 249, 250);
    pdf.rect(10, currentY - 5, pageWidth - 20, 35, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(10, currentY - 5, pageWidth - 20, 35, 'S');

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    const col1Width = (pageWidth - 30) / 3;

    // First row of summary
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total Unique Sizes:', 15, currentY + 5);
    pdf.text('Total Pieces Required:', 15 + col1Width, currentY + 5);
    pdf.text('Total Material Area:', 15 + col1Width * 2, currentY + 5);

    pdf.setFont('helvetica', 'normal');
    pdf.text(String(uniqueSizes), 15, currentY + 12);
    pdf.text(totalPieces.toLocaleString(), 15 + col1Width, currentY + 12);
    pdf.text(`${totalMaterial.toLocaleString()} mm²`, 15 + col1Width * 2, currentY + 12);

    // Second row of summary
    pdf.setFont('helvetica', 'bold');
    pdf.text('Average Piece Size:', 15, currentY + 20);
    pdf.text('Material Efficiency:', 15 + col1Width, currentY + 20);
    pdf.text('Estimated Sheets:', 15 + col1Width * 2, currentY + 20);

    pdf.setFont('helvetica', 'normal');
    const avgSize = Math.round(totalMaterial / totalPieces);
    pdf.text(`${avgSize.toLocaleString()} mm²`, 15, currentY + 27);
    pdf.text('See individual sheets', 15 + col1Width, currentY + 27);
    pdf.text('See sheet layouts', 15 + col1Width * 2, currentY + 27);

    currentY += 40;

    // Optimized table structure for portrait layout
    const tableWidth = pageWidth - 20;
    const colWidths = [25, 35, 35, 25, 40, 45];
    const colPositions = [10];
    for (let i = 1; i < colWidths.length; i++) {
      colPositions[i] = colPositions[i - 1] + colWidths[i - 1];
    }

    // Table title and description
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed Cut List', 10, currentY);
    currentY += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.text('All dimensions in millimeters. Verify measurements before cutting.', 10, currentY);
    currentY += 12;

    // Enhanced header row
    pdf.setFillColor(230, 240, 250);
    pdf.rect(10, currentY - 6, tableWidth, rowHeight + 2, 'F');
    pdf.setDrawColor(150, 150, 150);
    pdf.rect(10, currentY - 6, tableWidth, rowHeight + 2, 'S');

    // Add column separators
    for (let i = 1; i < colPositions.length; i++) {
      pdf.line(colPositions[i], currentY - 6, colPositions[i], currentY + rowHeight - 4);
    }

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    const headers = ['Item #', 'Width', 'Height', 'Qty', 'Unit Area', 'Total Area'];
    headers.forEach((header, i) => {
      const textWidth = pdf.getTextWidth(header);
      const centerX = colPositions[i] + (colWidths[i] - textWidth) / 2;
      pdf.text(header, centerX, currentY);
    });
    currentY += rowHeight + 4;

    // Data rows with better formatting
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);

    let pageNumber = 1;

    cuts.forEach((cut, index) => {
      // Check if we need a new page
      if (currentY > usableHeight - 30) {
        // Add page totals before new page
        this.addPageSubtotal(pdf, cuts.slice(0, index), pageWidth, currentY + 5);

        pdf.addPage();
        this.addHeader(pdf, pageWidth, { name: 'Cut Details (continued)' });
        pageNumber++;

        // Repeat headers on new page
        currentY = 45;
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Cut Details - Page ${pageNumber}`, 10, currentY);
        currentY += 15;

        // Repeat table header
        pdf.setFillColor(230, 240, 250);
        pdf.rect(10, currentY - 6, tableWidth, rowHeight + 2, 'F');
        pdf.setDrawColor(150, 150, 150);
        pdf.rect(10, currentY - 6, tableWidth, rowHeight + 2, 'S');

        for (let i = 1; i < colPositions.length; i++) {
          pdf.line(colPositions[i], currentY - 6, colPositions[i], currentY + rowHeight - 4);
        }

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        headers.forEach((header, i) => {
          const textWidth = pdf.getTextWidth(header);
          const centerX = colPositions[i] + (colWidths[i] - textWidth) / 2;
          pdf.text(header, centerX, currentY);
        });
        currentY += rowHeight + 4;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
      }

      const unitArea = cut.width * cut.height;
      const totalArea = unitArea * cut.quantity;

      const rowData = [
        String(index + 1),
        String(cut.width),
        String(cut.height),
        String(cut.quantity),
        unitArea.toLocaleString(),
        totalArea.toLocaleString()
      ];

      // Alternate row background with subtle colors
      if (index % 2 === 0) {
        pdf.setFillColor(252, 253, 255);
        pdf.rect(10, currentY - 4, tableWidth, rowHeight, 'F');
      }

      // Add row border
      pdf.setDrawColor(230, 230, 230);
      pdf.rect(10, currentY - 4, tableWidth, rowHeight, 'S');

      // Add column separators
      pdf.setDrawColor(240, 240, 240);
      for (let i = 1; i < colPositions.length; i++) {
        pdf.line(colPositions[i], currentY - 4, colPositions[i], currentY + rowHeight - 4);
      }

      // Add data with center alignment
      rowData.forEach((data, i) => {
        // Color-code important information
        if (i === 4 || i === 5) {
          // Area columns
          if (unitArea > 100000) {
            pdf.setTextColor(76, 175, 80); // Green for large cuts
          } else if (unitArea < 10000) {
            pdf.setTextColor(244, 67, 54); // Red for small cuts
          } else {
            pdf.setTextColor(0, 0, 0);
          }
        } else {
          pdf.setTextColor(0, 0, 0);
        }

        const textWidth = pdf.getTextWidth(data);
        const centerX = colPositions[i] + (colWidths[i] - textWidth) / 2;
        pdf.text(data, centerX, currentY + 2);
      });
      currentY += rowHeight;
    });

    // Reset color
    pdf.setTextColor(0, 0, 0);

    // Add final totals
    currentY += 10;
    this.addFinalTotals(pdf, cuts, pageWidth, currentY);

    return currentY;
  }

  addPageSubtotal(pdf, cutsOnPage, pageWidth, startY) {
    const subtotalCuts = cutsOnPage.reduce((sum, cut) => sum + cut.quantity, 0);
    const subtotalArea = cutsOnPage.reduce((sum, cut) => sum + cut.width * cut.height * cut.quantity, 0);

    pdf.setFillColor(245, 245, 245);
    pdf.rect(10, startY, pageWidth - 20, 15, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(10, startY, pageWidth - 20, 15, 'S');

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Page Subtotal: ${cutsOnPage.length} sizes, ${subtotalCuts} pieces, ${subtotalArea.toLocaleString()} mm²`, 15, startY + 8);
  }

  addFinalTotals(pdf, cuts, pageWidth, startY) {
    const totalSizes = cuts.length;
    const totalPieces = cuts.reduce((sum, cut) => sum + cut.quantity, 0);
    const totalCuts = cuts.reduce((sum, cut) => sum + cut.quantity, 0); // Total cuts (same as total pieces for clarity)
    const totalArea = cuts.reduce((sum, cut) => sum + cut.width * cut.height * cut.quantity, 0);
    const avgCutSize = Math.round(totalArea / totalPieces);

    // Totals box (expanded height to accommodate 5 entries)
    pdf.setFillColor(230, 240, 250);
    pdf.rect(10, startY, pageWidth - 20, 43, 'F');
    pdf.setDrawColor(100, 150, 200);
    pdf.setLineWidth(1);
    pdf.rect(10, startY, pageWidth - 20, 43, 'S');

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROJECT TOTALS', 15, startY + 10);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const col1 = 15;
    const col2 = pageWidth / 2 + 5;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Unique Cut Sizes:', col1, startY + 20);
    pdf.text('Total Pieces:', col2, startY + 20);

    pdf.setFont('helvetica', 'normal');
    pdf.text(String(totalSizes), col1 + 60, startY + 20);
    pdf.text(totalPieces.toLocaleString(), col2 + 60, startY + 20);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Total Cuts:', col1, startY + 28);
    pdf.text('Average Cut Size:', col2, startY + 28);

    pdf.setFont('helvetica', 'normal');
    pdf.text(totalCuts.toLocaleString(), col1 + 60, startY + 28);
    pdf.text(`${avgCutSize.toLocaleString()} mm²`, col2 + 60, startY + 28);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Total Material:', col1, startY + 36);

    pdf.setFont('helvetica', 'normal');
    pdf.text(`${totalArea.toLocaleString()} mm²`, col1 + 60, startY + 36);
  }

  addPieceDetailsTable(pdf, pieces, pageWidth, startY) {
    let currentY = startY;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const usableHeight = pageHeight - 40; // Leave space for footer
    const rowHeight = 10;

    // Add project summary at the top
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Complete Piece Requirements', 10, currentY);
    currentY += 15;

    // Add summary statistics box
    const totalPieces = pieces.reduce((sum, piece) => sum + piece.quantity, 0);
    const totalMaterial = pieces.reduce((sum, piece) => sum + piece.width * piece.height * piece.quantity, 0);
    const uniqueSizes = pieces.length;

    pdf.setFillColor(248, 249, 250);
    pdf.rect(10, currentY - 5, pageWidth - 20, 35, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(10, currentY - 5, pageWidth - 20, 35, 'S');

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    const col1Width = (pageWidth - 30) / 3;

    // First row of summary
    pdf.setFont('helvetica', 'bold');
    pdf.text('Unique Piece Sizes:', 15, currentY + 5);
    pdf.text('Total Pieces Required:', 15 + col1Width, currentY + 5);
    pdf.text('Total Material Area:', 15 + col1Width * 2, currentY + 5);

    pdf.setFont('helvetica', 'normal');
    pdf.text(String(uniqueSizes), 15, currentY + 12);
    pdf.text(totalPieces.toLocaleString(), 15 + col1Width, currentY + 12);
    pdf.text(`${totalMaterial.toLocaleString()} mm²`, 15 + col1Width * 2, currentY + 12);

    // Second row of summary
    pdf.setFont('helvetica', 'bold');
    pdf.text('Average Piece Size:', 15, currentY + 20);
    pdf.text('Material Category:', 15 + col1Width, currentY + 20);
    pdf.text('Optimization Goal:', 15 + col1Width * 2, currentY + 20);

    pdf.setFont('helvetica', 'normal');
    const avgSize = Math.round(totalMaterial / totalPieces);
    pdf.text(`${avgSize.toLocaleString()} mm²`, 15, currentY + 27);
    pdf.text('Rectangular pieces', 15 + col1Width, currentY + 27);
    pdf.text('Minimize waste & cuts', 15 + col1Width * 2, currentY + 27);

    currentY += 40;

    // Optimized table structure for portrait layout
    const tableWidth = pageWidth - 20;
    const colWidths = [25, 35, 35, 25, 40, 45];
    const colPositions = [10];
    for (let i = 1; i < colWidths.length; i++) {
      colPositions[i] = colPositions[i - 1] + colWidths[i - 1];
    }

    // Table title and description
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed Piece Requirements', 10, currentY);
    currentY += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.text('All dimensions in millimeters. Each piece will be cut from sheet material using guillotine cuts.', 10, currentY);
    currentY += 12;

    // Enhanced header row
    pdf.setFillColor(230, 240, 250);
    pdf.rect(10, currentY - 6, tableWidth, rowHeight + 2, 'F');
    pdf.setDrawColor(150, 150, 150);
    pdf.rect(10, currentY - 6, tableWidth, rowHeight + 2, 'S');

    // Add column separators
    for (let i = 1; i < colPositions.length; i++) {
      pdf.line(colPositions[i], currentY - 6, colPositions[i], currentY + rowHeight - 4);
    }

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    const headers = ['Item #', 'Width', 'Height', 'Qty', 'Unit Area', 'Total Area'];
    headers.forEach((header, i) => {
      const textWidth = pdf.getTextWidth(header);
      const centerX = colPositions[i] + (colWidths[i] - textWidth) / 2;
      pdf.text(header, centerX, currentY);
    });
    currentY += rowHeight + 4;

    // Data rows with better formatting
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);

    let pageNumber = 1;

    pieces.forEach((piece, index) => {
      // Check if we need a new page
      if (currentY > usableHeight - 30) {
        // Add page totals before new page
        this.addPageSubtotalPieces(pdf, pieces.slice(0, index), pageWidth, currentY + 5);

        pdf.addPage();
        this.addHeader(pdf, pageWidth, { name: 'Piece Requirements (continued)' });
        pageNumber++;

        // Repeat headers on new page
        currentY = 45;
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Piece Requirements - Page ${pageNumber}`, 10, currentY);
        currentY += 15;

        // Repeat table header
        pdf.setFillColor(230, 240, 250);
        pdf.rect(10, currentY - 6, tableWidth, rowHeight + 2, 'F');
        pdf.setDrawColor(150, 150, 150);
        pdf.rect(10, currentY - 6, tableWidth, rowHeight + 2, 'S');

        for (let i = 1; i < colPositions.length; i++) {
          pdf.line(colPositions[i], currentY - 6, colPositions[i], currentY + rowHeight - 4);
        }

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        headers.forEach((header, i) => {
          const textWidth = pdf.getTextWidth(header);
          const centerX = colPositions[i] + (colWidths[i] - textWidth) / 2;
          pdf.text(header, centerX, currentY);
        });
        currentY += rowHeight + 4;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
      }

      const unitArea = piece.width * piece.height;
      const totalArea = unitArea * piece.quantity;

      const rowData = [
        String(index + 1),
        String(piece.width),
        String(piece.height),
        String(piece.quantity),
        unitArea.toLocaleString(),
        totalArea.toLocaleString()
      ];

      // Alternate row background with subtle colors
      if (index % 2 === 0) {
        pdf.setFillColor(252, 253, 255);
        pdf.rect(10, currentY - 4, tableWidth, rowHeight, 'F');
      }

      // Add row border
      pdf.setDrawColor(230, 230, 230);
      pdf.rect(10, currentY - 4, tableWidth, rowHeight, 'S');

      // Add column separators
      pdf.setDrawColor(240, 240, 240);
      for (let i = 1; i < colPositions.length; i++) {
        pdf.line(colPositions[i], currentY - 4, colPositions[i], currentY + rowHeight - 4);
      }

      // Add data with center alignment
      rowData.forEach((data, i) => {
        // Color-code important information
        if (i === 4 || i === 5) {
          // Area columns
          if (unitArea > 100000) {
            pdf.setTextColor(76, 175, 80); // Green for large pieces
          } else if (unitArea < 10000) {
            pdf.setTextColor(244, 67, 54); // Red for small pieces
          } else {
            pdf.setTextColor(0, 0, 0);
          }
        } else {
          pdf.setTextColor(0, 0, 0);
        }

        const textWidth = pdf.getTextWidth(data);
        const centerX = colPositions[i] + (colWidths[i] - textWidth) / 2;
        pdf.text(data, centerX, currentY + 2);
      });
      currentY += rowHeight;
    });

    // Reset color
    pdf.setTextColor(0, 0, 0);

    // Add final totals
    currentY += 10;
    this.addFinalTotalsPieces(pdf, pieces, pageWidth, currentY);

    return currentY;
  }

  addPageSubtotalPieces(pdf, piecesOnPage, pageWidth, startY) {
    const subtotalPieces = piecesOnPage.reduce((sum, piece) => sum + piece.quantity, 0);
    const subtotalArea = piecesOnPage.reduce((sum, piece) => sum + piece.width * piece.height * piece.quantity, 0);

    pdf.setFillColor(245, 245, 245);
    pdf.rect(10, startY, pageWidth - 20, 15, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(10, startY, pageWidth - 20, 15, 'S');

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Page Subtotal: ${piecesOnPage.length} sizes, ${subtotalPieces} pieces, ${subtotalArea.toLocaleString()} mm²`, 15, startY + 8);
  }

  addFinalTotalsPieces(pdf, pieces, pageWidth, startY) {
    const totalSizes = pieces.length;
    const totalPieces = pieces.reduce((sum, piece) => sum + piece.quantity, 0);
    const totalArea = pieces.reduce((sum, piece) => sum + piece.width * piece.height * piece.quantity, 0);
    const avgPieceSize = Math.round(totalArea / totalPieces);

    // Totals box
    pdf.setFillColor(230, 240, 250);
    pdf.rect(10, startY, pageWidth - 20, 40, 'F');
    pdf.setDrawColor(100, 150, 200);
    pdf.setLineWidth(1);
    pdf.rect(10, startY, pageWidth - 20, 40, 'S');

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PIECE REQUIREMENTS TOTALS', 15, startY + 10);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const col1 = 15;
    const col2 = pageWidth / 2 + 5;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Unique Piece Sizes:', col1, startY + 20);
    pdf.text('Total Pieces Needed:', col2, startY + 20);

    pdf.setFont('helvetica', 'normal');
    pdf.text(String(totalSizes), col1 + 60, startY + 20);
    pdf.text(totalPieces.toLocaleString(), col2 + 60, startY + 20);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Average Piece Size:', col1, startY + 28);
    pdf.text('Total Material Required:', col2, startY + 28);

    pdf.setFont('helvetica', 'normal');
    pdf.text(`${avgPieceSize.toLocaleString()} mm²`, col1 + 60, startY + 28);
    pdf.text(`${totalArea.toLocaleString()} mm²`, col2 + 60, startY + 28);

    // Additional note about cutting process
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Note: These pieces will be obtained through optimized guillotine cutting to minimize waste and operations.', 15, startY + 36);
  }

  addFooter(pdf, pageWidth, pageHeight, currentPage, totalPages) {
    const footerY = pageHeight - 15;

    // Footer background
    pdf.setFillColor(245, 245, 245);
    pdf.rect(0, footerY - 5, pageWidth, 20, 'F');

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);

    // Left side - company info
    pdf.text(this.website, 10, footerY);
    pdf.text(this.developer, 10, footerY + 5);

    // Center - disclaimer
    pdf.text('Generated automatically - verify measurements before cutting', pageWidth / 2, footerY, { align: 'center' });

    // Right side - page number and version
    pdf.text(`Page ${currentPage} of ${totalPages}`, pageWidth - 10, footerY, { align: 'right' });
    pdf.text(`${this.companyName} v${this.version}`, pageWidth - 10, footerY + 5, { align: 'right' });

    // Reset text color
    pdf.setTextColor(0, 0, 0);
  }
}

export default PDFExportService;
