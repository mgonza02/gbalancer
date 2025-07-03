/**
 * Cutting Optimization Service
 *
 * This service provides algorithms for optimizing the layout of pieces on sheets
 * to minimize material waste and cutting operations (guillotine cuts).
 *
 * TERMINOLOGY:
 * - PIECE: Individual object with width/height that needs to be cut from material
 * - CUT: Guillotine operation that divides a sheet into two parts
 * - SHEET: Material stock that can be divided by cuts
 */

/**
 * @fileoverview Algorithm for piece cutting optimization (Cutting Stock Problem).
 *
 * **Main Objective:**
 * Develop an algorithm that determines the best way to cut required pieces from sheets of material.
 *
 * Optimization has two goals:
 * 1. Maximize the area of material used (minimize waste).
 * 2. **Minimize the total number of guillotine cuts.** This is a critical factor.
 *
 * **Definition and Constraints of the Cutting Process (Guillotine Cuts):**
 *
 * 1. **Straight and Full Cuts:** Each cut must be a straight line that traverses a sheet
 *    from edge to edge, either horizontally or vertically, dividing it into exactly two parts.
 *
 * 2. **Cumulative Cutting Cost:** The primary efficiency metric is the total number of cuts made.
 *    Each guillotine operation counts as one (1) cut.
 *
 * 3. **Cutting Hierarchy and Sub-Sheets:**
 *    - When a cut is made on a sheet, it is divided into exactly two independent sub-sheets.
 *    - Any subsequent cut applies to one of these new sub-sheets, not to the original sheet.
 *    - If a cut generates a finished piece and a remnant, cutting another piece from
 *      the remnant requires a new cut on that remnant.
 *
 * **Example of the Logical Flow:**
 *
 * Imagine a 100x100 sheet. Two pieces are needed: P1 (30x70) and P2 (50x20).
 *
 * - **Cut #1: Vertical at X=30**
 *   - Divides original sheet into: SubSheet-A (30x100) and SubSheet-B (70x100)
 *   - Total cuts: 1
 *
 * - **Cut #2: Horizontal at Y=70 on SubSheet-A**
 *   - Divides SubSheet-A into: Piece P1 (30x70) and Waste (30x30)
 *   - Total cuts: 2
 *
 * - **Cut #3: Horizontal at Y=20 on SubSheet-B**
 *   - Divides SubSheet-B into: SubSheet-C (70x20) and SubSheet-D (70x80)
 *   - Total cuts: 3
 *
 * - **Cut #4: Vertical at X=50 on SubSheet-C**
 *   - Divides SubSheet-C into: Piece P2 (50x20) and Waste (20x20)
 *   - Total cuts: 4
 *
 * - **Final Result:** 2 pieces obtained with 4 guillotine cuts.
 *
 * **Data Structures:**
 *
 * **Data Structures:**
 *
 * - `Sheet {width: number, height: number, x: number, y: number}`
 * - `Piece {id: string, width: number, height: number, quantity: number}`
 * - `PlacedPiece {pieceId: number, instanceIndex: number, width: number, height: number, x: number, y: number, isRotated: boolean}`
 * - `GuillotineCut {type: 'horizontal'|'vertical', position: number, sheetId: string, cutId: string}`
 * - `CuttingTreeNode {sheet: Sheet, assignedPiece: Piece|null, children: CuttingTreeNode[], guillotineCuts: GuillotineCut[], isLeafNode: boolean}`
 * - `OptimizationResult {placedPieces: PlacedPiece[], totalGuillotineCuts: number, wastedArea: number, cuttingTree: CuttingTreeNode}`
 */

class CuttingOptimizationService {
  constructor() {
    this.maxSheetsLimit = 10; // Prevent infinite loops
    this.guillotineCutCounter = 0; // Track total guillotine cuts made
  }

  /**
   * Generate optimal layout using guillotine cutting algorithm
   * @param {Array} pieces - Array of piece objects with width, height, quantity
   * @param {number} sheetWidth - Width of the sheet
   * @param {number} sheetHeight - Height of the sheet
   * @returns {Array} Layout array with sheet information and piece placements
   */
  generateOptimalLayout(pieces, sheetWidth, sheetHeight) {
    this.guillotineCutCounter = 0;
    const layout = [];
    const individualPieces = this.expandPiecesToIndividualItems(pieces);

    // Sort pieces by area (largest first) for better guillotine cutting
    individualPieces.sort((a, b) => b.width * b.height - a.width * a.height);

    let currentSheetIndex = 0;

    while (individualPieces.some(piece => !piece.isPlaced) && currentSheetIndex < this.maxSheetsLimit) {
      const sheetLayout = {
        sheetNumber: currentSheetIndex + 1,
        placedPieces: [],
        guillotineCuts: [],
        totalGuillotineCuts: 0
      };

      // Apply guillotine cutting algorithm
      const rootNode = this.createCuttingTreeNode(sheetWidth, sheetHeight, 0, 0);
      const unplacedPieces = individualPieces.filter(piece => !piece.isPlaced);

      const cuttingResult = this.performGuillotineCutting(rootNode, unplacedPieces);
      sheetLayout.placedPieces = cuttingResult.placedPieces;
      sheetLayout.guillotineCuts = cuttingResult.guillotineCuts;
      sheetLayout.totalGuillotineCuts = cuttingResult.totalGuillotineCuts;

      // Mark pieces as placed
      cuttingResult.placedPieces.forEach(placedPiece => {
        const piece = individualPieces.find(p => p.pieceId === placedPiece.pieceId && p.instanceIndex === placedPiece.instanceIndex);
        if (piece) piece.isPlaced = true;
      });

      layout[currentSheetIndex] = sheetLayout;
      currentSheetIndex++;
    }

    return layout;
  }

  /**
   * Create a cutting tree node representing a sheet area
   * @param {number} width - Sheet width
   * @param {number} height - Sheet height
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {Object} Cutting tree node
   */
  createCuttingTreeNode(width, height, x, y) {
    return {
      sheet: { width, height, x, y },
      assignedPiece: null,
      children: [],
      guillotineCuts: [],
      isLeafNode: true,
      nodeId: `node_${x}_${y}_${width}_${height}`
    };
  }

  /**
   * Perform guillotine cutting algorithm on a sheet
   * @param {Object} rootNode - Root cutting tree node
   * @param {Array} pieces - Array of pieces to place
   * @returns {Object} Result with placed pieces and cutting information
   */
  performGuillotineCutting(rootNode, pieces) {
    const placedPieces = [];
    const guillotineCuts = [];
    const totalGuillotineCuts = 0;

    // Create a copy of pieces to avoid modifying the original array
    const availablePieces = [...pieces];

    const result = this.recursiveGuillotineCutting(rootNode, availablePieces, placedPieces, guillotineCuts, totalGuillotineCuts);

    return {
      placedPieces: result.placedPieces,
      guillotineCuts: result.guillotineCuts,
      totalGuillotineCuts: result.totalGuillotineCuts,
      cuttingTree: rootNode
    };
  }

  /**
   * Recursive guillotine cutting implementation
   * @param {Object} node - Current node in cutting tree
   * @param {Array} availablePieces - Pieces available for placement (mutable array)
   * @param {Array} placedPieces - Already placed pieces
   * @param {Array} guillotineCuts - List of guillotine cuts made
   * @param {number} currentGuillotineCuts - Current guillotine cut count
   * @returns {Object} Result with updated placed pieces and cut count
   */
  recursiveGuillotineCutting(node, availablePieces, placedPieces, guillotineCuts, currentGuillotineCuts) {
    if (availablePieces.length === 0 || !node.isLeafNode) {
      return {
        placedPieces,
        guillotineCuts,
        totalGuillotineCuts: currentGuillotineCuts
      };
    }

    // Find the best piece that fits in this node
    const bestFitResult = this.findBestFittingPiece(node, availablePieces);

    if (!bestFitResult.piece) {
      // No piece fits, this node becomes waste area
      return {
        placedPieces,
        guillotineCuts,
        totalGuillotineCuts: currentGuillotineCuts
      };
    }

    // Place the piece in this node
    node.assignedPiece = bestFitResult.piece;
    node.isLeafNode = false;

    const placedPiece = {
      pieceId: bestFitResult.piece.pieceId,
      instanceIndex: bestFitResult.piece.instanceIndex,
      width: bestFitResult.finalWidth,
      height: bestFitResult.finalHeight,
      x: node.sheet.x,
      y: node.sheet.y,
      isRotated: bestFitResult.isRotated,
      originalPiece: bestFitResult.piece.originalPiece
    };

    placedPieces.push(placedPiece);

    // Generate guillotine cuts and create child nodes
    const cuttingResult = this.createGuillotineCuts(node, bestFitResult);
    const newGuillotineCuts = cuttingResult.guillotineCuts;
    node.children = cuttingResult.childNodes;
    node.guillotineCuts = newGuillotineCuts;

    // Add new cuts to the global list
    guillotineCuts.push(...newGuillotineCuts);

    // Remove the placed piece from available pieces (modify the actual array)
    const pieceIndex = availablePieces.findIndex(
      p => p.pieceId === bestFitResult.piece.pieceId && p.instanceIndex === bestFitResult.piece.instanceIndex
    );
    if (pieceIndex !== -1) {
      availablePieces.splice(pieceIndex, 1);
    }

    // Recursively process child nodes with the same modified availablePieces array
    let totalCutsUsed = currentGuillotineCuts + newGuillotineCuts.length;

    for (const childNode of node.children) {
      const childResult = this.recursiveGuillotineCutting(
        childNode,
        availablePieces, // Use the same array, not a copy
        placedPieces,
        guillotineCuts,
        totalCutsUsed
      );

      totalCutsUsed = childResult.totalGuillotineCuts;
    }

    return {
      placedPieces,
      guillotineCuts,
      totalGuillotineCuts: totalCutsUsed
    };
  }

  /**
   * Expand pieces with quantities into individual items for placement
   * @param {Array} pieces - Array of piece objects
   * @returns {Array} Array of individual piece items
   */
  expandPiecesToIndividualItems(pieces) {
    const individualPieces = [];

    pieces.forEach((piece, pieceIndex) => {
      if (piece.width && piece.height && piece.quantity) {
        const pieceWidth = parseFloat(piece.width);
        const pieceHeight = parseFloat(piece.height);
        const quantity = parseInt(piece.quantity);

        for (let instance = 0; instance < quantity; instance++) {
          individualPieces.push({
            pieceId: pieceIndex,
            instanceIndex: instance,
            width: pieceWidth,
            height: pieceHeight,
            isPlaced: false,
            originalPiece: piece
          });
        }
      }
    });

    return individualPieces;
  }

  /**
   * Find the best fitting piece for a given cutting tree node
   * @param {Object} node - Cutting tree node
   * @param {Array} pieces - Available pieces
   * @returns {Object} Best fitting piece with placement info
   */
  findBestFittingPiece(node, pieces) {
    let bestFit = { piece: null, wasteRatio: Infinity };

    for (const piece of pieces) {
      // Try normal orientation
      if (piece.width <= node.sheet.width && piece.height <= node.sheet.height) {
        const wasteArea = node.sheet.width * node.sheet.height - piece.width * piece.height;
        const wasteRatio = wasteArea / (node.sheet.width * node.sheet.height);

        if (wasteRatio < bestFit.wasteRatio) {
          bestFit = {
            piece,
            finalWidth: piece.width,
            finalHeight: piece.height,
            isRotated: false,
            wasteRatio
          };
        }
      }

      // Try rotated orientation
      if (piece.height <= node.sheet.width && piece.width <= node.sheet.height) {
        const wasteArea = node.sheet.width * node.sheet.height - piece.width * piece.height;
        const wasteRatio = wasteArea / (node.sheet.width * node.sheet.height);

        if (wasteRatio < bestFit.wasteRatio) {
          bestFit = {
            piece,
            finalWidth: piece.height,
            finalHeight: piece.width,
            isRotated: true,
            wasteRatio
          };
        }
      }
    }

    return bestFit;
  }

  /**
   * Create guillotine cuts and child nodes for a placed piece
   * @param {Object} node - Parent cutting tree node
   * @param {Object} fitResult - Piece fitting result
   * @returns {Object} Guillotine cuts and child nodes created
   */
  createGuillotineCuts(node, fitResult) {
    const { piece } = fitResult;
    const pieceWidth = fitResult.finalWidth;
    const pieceHeight = fitResult.finalHeight;
    const sheetWidth = node.sheet.width;
    const sheetHeight = node.sheet.height;

    const childNodes = [];
    const guillotineCuts = [];

    // Calculate waste areas
    const rightWaste = sheetWidth - pieceWidth;
    const bottomWaste = sheetHeight - pieceHeight;

    if (rightWaste > 0 && bottomWaste > 0) {
      // Both right and bottom waste - need 2 guillotine cuts

      // Decide cutting strategy based on which creates better sub-sheets
      if (rightWaste * sheetHeight >= bottomWaste * sheetWidth) {
        // Strategy 1: Vertical cut first, then horizontal cut

        // Guillotine Cut #1: Vertical cut to separate piece from right waste
        const verticalCut = {
          type: 'vertical',
          position: node.sheet.x + pieceWidth,
          startY: node.sheet.y,
          endY: node.sheet.y + sheetHeight,
          sheetId: node.nodeId,
          cutId: `cut_v_${node.sheet.x + pieceWidth}_${node.nodeId}`
        };
        guillotineCuts.push(verticalCut);

        // Right waste sub-sheet
        childNodes.push(this.createCuttingTreeNode(rightWaste, sheetHeight, node.sheet.x + pieceWidth, node.sheet.y));

        // Guillotine Cut #2: Horizontal cut to separate piece from bottom waste
        const horizontalCut = {
          type: 'horizontal',
          position: node.sheet.y + pieceHeight,
          startX: node.sheet.x,
          endX: node.sheet.x + pieceWidth,
          sheetId: node.nodeId,
          cutId: `cut_h_${node.sheet.y + pieceHeight}_${node.nodeId}`
        };
        guillotineCuts.push(horizontalCut);

        // Bottom waste sub-sheet (only under the piece)
        childNodes.push(this.createCuttingTreeNode(pieceWidth, bottomWaste, node.sheet.x, node.sheet.y + pieceHeight));
      } else {
        // Strategy 2: Horizontal cut first, then vertical cut

        // Guillotine Cut #1: Horizontal cut to separate piece from bottom waste
        const horizontalCut = {
          type: 'horizontal',
          position: node.sheet.y + pieceHeight,
          startX: node.sheet.x,
          endX: node.sheet.x + sheetWidth,
          sheetId: node.nodeId,
          cutId: `cut_h_${node.sheet.y + pieceHeight}_${node.nodeId}`
        };
        guillotineCuts.push(horizontalCut);

        // Bottom waste sub-sheet
        childNodes.push(this.createCuttingTreeNode(sheetWidth, bottomWaste, node.sheet.x, node.sheet.y + pieceHeight));

        // Guillotine Cut #2: Vertical cut to separate piece from right waste
        const verticalCut = {
          type: 'vertical',
          position: node.sheet.x + pieceWidth,
          startY: node.sheet.y,
          endY: node.sheet.y + pieceHeight,
          sheetId: node.nodeId,
          cutId: `cut_v_${node.sheet.x + pieceWidth}_${node.nodeId}`
        };
        guillotineCuts.push(verticalCut);

        // Right waste sub-sheet (only beside the piece)
        childNodes.push(this.createCuttingTreeNode(rightWaste, pieceHeight, node.sheet.x + pieceWidth, node.sheet.y));
      }
    } else if (rightWaste > 0) {
      // Only right waste - need 1 vertical guillotine cut
      const verticalCut = {
        type: 'vertical',
        position: node.sheet.x + pieceWidth,
        startY: node.sheet.y,
        endY: node.sheet.y + sheetHeight,
        sheetId: node.nodeId,
        cutId: `cut_v_${node.sheet.x + pieceWidth}_${node.nodeId}`
      };
      guillotineCuts.push(verticalCut);

      childNodes.push(this.createCuttingTreeNode(rightWaste, sheetHeight, node.sheet.x + pieceWidth, node.sheet.y));
    } else if (bottomWaste > 0) {
      // Only bottom waste - need 1 horizontal guillotine cut
      const horizontalCut = {
        type: 'horizontal',
        position: node.sheet.y + pieceHeight,
        startX: node.sheet.x,
        endX: node.sheet.x + sheetWidth,
        sheetId: node.nodeId,
        cutId: `cut_h_${node.sheet.y + pieceHeight}_${node.nodeId}`
      };
      guillotineCuts.push(horizontalCut);

      childNodes.push(this.createCuttingTreeNode(sheetWidth, bottomWaste, node.sheet.x, node.sheet.y + pieceHeight));
    }
    // If no waste, no guillotine cuts needed (piece exactly fits the sheet)

    return { guillotineCuts, childNodes };
  }

  /**
   * Calculate cutting statistics for the layout including cutting costs
   * @param {Array} layout - Layout array
   * @param {number} sheetWidth - Sheet width
   * @param {number} sheetHeight - Sheet height
   * @returns {Object} Statistics object with cutting cost analysis
   */
  calculateStatistics(layout, sheetWidth, sheetHeight) {
    const stats = {
      totalSheets: layout.length,
      totalGuillotineCuts: 0,
      totalPieces: 0,
      totalUsedArea: 0,
      totalWasteArea: 0,
      averageEfficiency: 0,
      totalCuttingCost: 0,
      averageCutsPerSheet: 0,
      sheetEfficiencies: []
    };

    const sheetArea = sheetWidth * sheetHeight;

    layout.forEach((sheet, index) => {
      const sheetUsedArea = sheet.placedPieces.reduce((sum, piece) => sum + piece.width * piece.height, 0);
      const sheetWaste = sheetArea - sheetUsedArea;
      const sheetEfficiency = (sheetUsedArea / sheetArea) * 100;
      const sheetCuttingCost = sheet.totalGuillotineCuts || 0;

      stats.totalGuillotineCuts += sheet.totalGuillotineCuts;
      stats.totalPieces += sheet.placedPieces.length;
      stats.totalUsedArea += sheetUsedArea;
      stats.totalWasteArea += sheetWaste;
      stats.totalCuttingCost += sheetCuttingCost;

      stats.sheetEfficiencies.push({
        sheetNumber: index + 1,
        efficiency: sheetEfficiency,
        usedArea: sheetUsedArea,
        wasteArea: sheetWaste,
        piecesCount: sheet.placedPieces.length,
        cuttingCost: sheetCuttingCost,
        costPerPiece: sheet.placedPieces.length > 0 ? sheetCuttingCost / sheet.placedPieces.length : 0
      });
    });

    stats.averageEfficiency = layout.length > 0 ? (stats.totalUsedArea / (layout.length * sheetArea)) * 100 : 0;

    stats.averageCutsPerSheet = layout.length > 0 ? stats.totalCuttingCost / layout.length : 0;

    return stats;
  }

  /**
   * Optimize layout using different algorithms and return the best one
   * Now considers both material efficiency and cutting cost
   * @param {Array} pieces - Array of piece objects
   * @param {number} sheetWidth - Sheet width
   * @param {number} sheetHeight - Sheet height
   * @returns {Object} Best layout with statistics
   */
  findBestLayout(pieces, sheetWidth, sheetHeight) {
    const layouts = [];

    // Algorithm 1: Guillotine cuts with area-based sorting (largest first)
    const layout1 = this.generateOptimalLayout(pieces, sheetWidth, sheetHeight);
    const stats1 = this.calculateStatistics(layout1, sheetWidth, sheetHeight);
    layouts.push({ layout: layout1, stats: stats1, algorithm: 'Guillotine Cuts (Area-Based)' });

    // Algorithm 2: Guillotine cuts with perimeter-based sorting
    const piecesByPerimeter = [...pieces].sort((a, b) => {
      const perimeterA = 2 * (parseFloat(a.width || 0) + parseFloat(a.height || 0));
      const perimeterB = 2 * (parseFloat(b.width || 0) + parseFloat(b.height || 0));
      return perimeterB - perimeterA;
    });
    const layout2 = this.generateOptimalLayout(piecesByPerimeter, sheetWidth, sheetHeight);
    const stats2 = this.calculateStatistics(layout2, sheetWidth, sheetHeight);
    layouts.push({ layout: layout2, stats: stats2, algorithm: 'Guillotine Cuts (Perimeter-Based)' });

    // Algorithm 3: Guillotine cuts with width-based sorting
    const piecesByWidth = [...pieces].sort((a, b) => parseFloat(b.width || 0) - parseFloat(a.width || 0));
    const layout3 = this.generateOptimalLayout(piecesByWidth, sheetWidth, sheetHeight);
    const stats3 = this.calculateStatistics(layout3, sheetWidth, sheetHeight);
    layouts.push({ layout: layout3, stats: stats3, algorithm: 'Guillotine Cuts (Width-Based)' });

    // Algorithm 4: Guillotine cuts with aspect ratio sorting (most square first)
    const piecesByAspectRatio = [...pieces].sort((a, b) => {
      const ratioA =
        Math.max(parseFloat(a.width || 1), parseFloat(a.height || 1)) / Math.min(parseFloat(a.width || 1), parseFloat(a.height || 1));
      const ratioB =
        Math.max(parseFloat(b.width || 1), parseFloat(b.height || 1)) / Math.min(parseFloat(b.width || 1), parseFloat(b.height || 1));
      return ratioA - ratioB; // Most square (ratio closest to 1) first
    });
    const layout4 = this.generateOptimalLayout(piecesByAspectRatio, sheetWidth, sheetHeight);
    const stats4 = this.calculateStatistics(layout4, sheetWidth, sheetHeight);
    layouts.push({ layout: layout4, stats: stats4, algorithm: 'Guillotine Cuts (Square-First)' });

    // Find the best layout considering both efficiency and cutting cost
    // Primary: highest efficiency, Secondary: lowest cutting cost, Tertiary: fewest sheets
    const bestLayout = layouts.reduce((best, current) => {
      // Calculate combined score (weighted efficiency and cutting cost)
      const bestScore = this.calculateLayoutScore(best.stats);
      const currentScore = this.calculateLayoutScore(current.stats);

      if (currentScore > bestScore) {
        return current;
      } else if (currentScore === bestScore && current.stats.totalSheets < best.stats.totalSheets) {
        return current;
      }
      return best;
    });

    return {
      layout: bestLayout.layout,
      stats: bestLayout.stats,
      algorithm: bestLayout.algorithm,
      allAttempts: layouts
    };
  }

  /**
   * Calculate a combined score for layout quality
   * @param {Object} stats - Layout statistics
   * @returns {number} Combined score (higher is better)
   */
  calculateLayoutScore(stats) {
    // Normalize efficiency (0-100) to 0-1
    const efficiencyScore = stats.averageEfficiency / 100;

    // Normalize cutting cost (lower is better)
    // Assume optimal cutting cost is approximately totalPieces (if each piece needed 1 cut)
    const optimalCuts = stats.totalPieces;
    const cuttingEfficiency = optimalCuts > 0 ? Math.min(1, optimalCuts / Math.max(1, stats.totalCuttingCost)) : 0;

    // Weighted combination: 60% material efficiency, 40% cutting efficiency
    return efficiencyScore * 0.6 + cuttingEfficiency * 0.4;
  }

  /**
   * Get detailed cutting sequence for a sheet
   * @param {Array} layout - Layout array
   * @param {number} sheetIndex - Index of the sheet
   * @returns {Array} Cutting sequence with step-by-step instructions
   */
  getCuttingSequence(layout, sheetIndex) {
    const sheet = layout[sheetIndex];
    if (!sheet || !sheet.placedPieces) return [];

    const sequence = [];
    const pieces = [...sheet.placedPieces];

    // Sort pieces by position to create logical cutting sequence
    pieces.sort((a, b) => {
      // Primary sort by Y position (top to bottom)
      if (Math.abs(a.y - b.y) > 1) return a.y - b.y;
      // Secondary sort by X position (left to right)
      return a.x - b.x;
    });

    let stepNumber = 1;

    // Add guillotine cuts in sequence
    if (sheet.guillotineCuts && sheet.guillotineCuts.length > 0) {
      sheet.guillotineCuts.forEach((cut, index) => {
        sequence.push({
          step: stepNumber++,
          action: 'guillotine_cut',
          description: `Make ${cut.type} guillotine cut at ${cut.type === 'vertical' ? 'X' : 'Y'} = ${cut.position}`,
          cutType: cut.type,
          position: cut.position,
          cutId: cut.cutId
        });
      });
    }

    // Add piece placement information
    pieces.forEach((piece, index) => {
      sequence.push({
        step: stepNumber++,
        action: 'place_piece',
        description: `Place piece ${piece.pieceId + 1}${piece.isRotated ? ' (rotated)' : ''} at (${piece.x}, ${piece.y})`,
        piece: {
          id: piece.pieceId + 1,
          instanceIndex: piece.instanceIndex,
          width: piece.width,
          height: piece.height,
          x: piece.x,
          y: piece.y,
          isRotated: piece.isRotated
        }
      });
    });

    return sequence;
  }

  /**
   * Enhanced validation with cutting cost analysis
   * @param {Array} pieces - Array of piece objects
   * @param {number} sheetWidth - Sheet width
   * @param {number} sheetHeight - Sheet height
   * @returns {Object} Enhanced validation result
   */
  validateCuts(pieces, sheetWidth, sheetHeight) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      cuttingCostAnalysis: {
        estimatedMinCuts: 0,
        estimatedMaxCuts: 0,
        complexityLevel: 'low'
      }
    };

    let totalPieces = 0;
    let totalArea = 0;
    const sheetArea = sheetWidth * sheetHeight;

    pieces.forEach((piece, index) => {
      const pieceWidth = parseFloat(piece.width || 0);
      const pieceHeight = parseFloat(piece.height || 0);
      const quantity = parseInt(piece.quantity || 0);

      // Check if piece dimensions are valid
      if (pieceWidth <= 0 || pieceHeight <= 0) {
        validation.errors.push(`Piece ${index + 1}: Invalid dimensions`);
        validation.isValid = false;
      }

      // Check if piece fits on sheet (even with rotation)
      if (pieceWidth > sheetWidth && pieceHeight > sheetWidth) {
        validation.errors.push(`Piece ${index + 1}: Too wide for sheet (${pieceWidth}mm > ${sheetWidth}mm)`);
        validation.isValid = false;
      }

      if (pieceHeight > sheetHeight && pieceWidth > sheetHeight) {
        validation.errors.push(`Piece ${index + 1}: Too tall for sheet (${pieceHeight}mm > ${sheetHeight}mm)`);
        validation.isValid = false;
      }

      // Check quantity
      if (quantity <= 0) {
        validation.errors.push(`Piece ${index + 1}: Invalid quantity`);
        validation.isValid = false;
      }

      if (validation.isValid) {
        totalPieces += quantity;
        totalArea += pieceWidth * pieceHeight * quantity;

        // Warnings for potentially problematic pieces
        const pieceArea = pieceWidth * pieceHeight;

        if (pieceArea > sheetArea * 0.8) {
          validation.warnings.push(
            `Piece ${index + 1}: Very large piece (${((pieceArea / sheetArea) * 100).toFixed(1)}% of sheet) - may increase cutting cost`
          );
        }

        // Check aspect ratio for cutting complexity
        const aspectRatio = Math.max(pieceWidth, pieceHeight) / Math.min(pieceWidth, pieceHeight);
        if (aspectRatio > 4) {
          validation.warnings.push(`Piece ${index + 1}: High aspect ratio (${aspectRatio.toFixed(1)}:1) - may complicate cutting pattern`);
        }
      }
    });

    // Advanced cutting cost analysis
    if (validation.isValid) {
      // Estimate minimum cuts (if pieces could be arranged optimally)
      validation.cuttingCostAnalysis.estimatedMinCuts = Math.max(1, totalPieces - 1);

      // Estimate maximum cuts (worst case scenario)
      validation.cuttingCostAnalysis.estimatedMaxCuts = totalPieces * 2;

      // Determine complexity level
      const materialUtilization = totalArea / sheetArea;
      const averagePieceSize = totalArea / totalPieces;
      const sheetsNeeded = Math.ceil(totalArea / sheetArea);

      if (materialUtilization > 0.9 || totalPieces > 20 || sheetsNeeded > 3) {
        validation.cuttingCostAnalysis.complexityLevel = 'high';
        validation.warnings.push('High complexity project - cutting cost optimization is critical');
      } else if (materialUtilization > 0.7 || totalPieces > 10 || sheetsNeeded > 1) {
        validation.cuttingCostAnalysis.complexityLevel = 'medium';
        validation.warnings.push('Medium complexity project - consider cutting cost in optimization');
      }

      // Additional warnings based on piece distribution
      const uniqueSizes = pieces.length;
      if (uniqueSizes > totalPieces * 0.7) {
        validation.warnings.push('Many unique sizes detected - this may increase cutting complexity');
      }
    }

    return validation;
  }
}

export default CuttingOptimizationService;
