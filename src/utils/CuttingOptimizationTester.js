/**
 * Test Suite for Cutting Optimization Algorithm
 *
 * This test suite identifies and validates piece counting issues in the optimization algorithm.
 *
 * ISSUE: Algorithm is calculating more pieces than user defined
 * GOAL: Identify where the discrepancy occurs and validate correct counting
 */

import CuttingOptimizationService from '../utils/CuttingOptimizationService.js';

class CuttingOptimizationTester {
  constructor() {
    this.optimizationService = new CuttingOptimizationService();
    this.testResults = [];
  }

  /**
   * Test basic piece counting accuracy
   */
  testBasicPieceCounting() {
    console.log('=== BASIC PIECE COUNTING TEST ===');

    const testCases = [
      {
        name: 'Simple 3 pieces',
        pieces: [
          { id: 1, width: 100, height: 200, quantity: 2 },
          { id: 2, width: 150, height: 100, quantity: 1 }
        ],
        expectedTotal: 3
      },
      {
        name: 'Mixed quantities',
        pieces: [
          { id: 1, width: 50, height: 50, quantity: 5 },
          { id: 2, width: 100, height: 100, quantity: 2 },
          { id: 3, width: 75, height: 150, quantity: 3 }
        ],
        expectedTotal: 10
      },
      {
        name: 'Single large piece',
        pieces: [{ id: 1, width: 800, height: 600, quantity: 1 }],
        expectedTotal: 1
      }
    ];

    testCases.forEach(testCase => {
      console.log(`\n--- Testing: ${testCase.name} ---`);
      console.log('Input pieces:', testCase.pieces);

      // Test expansion
      const expandedPieces = this.optimizationService.expandPiecesToIndividualItems(testCase.pieces);
      console.log(`Expanded pieces count: ${expandedPieces.length}`);
      console.log(`Expected pieces count: ${testCase.expectedTotal}`);

      // Test layout generation
      const layout = this.optimizationService.generateOptimalLayout(testCase.pieces, 1000, 800);
      console.log(`Layout sheets: ${layout.length}`);

      // Count total placed pieces
      const totalPlacedPieces = layout.reduce((sum, sheet) => sum + sheet.placedPieces.length, 0);
      console.log(`Total placed pieces: ${totalPlacedPieces}`);

      // Test statistics
      const stats = this.optimizationService.calculateStatistics(layout, 1000, 800);
      console.log(`Stats total pieces: ${stats.totalPieces}`);

      // Test findBestLayout
      const bestLayout = this.optimizationService.findBestLayout(testCase.pieces, 1000, 800);
      console.log(`Best layout total pieces: ${bestLayout.stats.totalPieces}`);

      // Validation
      const expandedCorrect = expandedPieces.length === testCase.expectedTotal;
      const placedCorrect = totalPlacedPieces === testCase.expectedTotal;
      const statsCorrect = stats.totalPieces === testCase.expectedTotal;
      const bestLayoutCorrect = bestLayout.stats.totalPieces === testCase.expectedTotal;

      console.log('\n--- VALIDATION RESULTS ---');
      console.log(`✓ Expanded pieces correct: ${expandedCorrect ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Placed pieces correct: ${placedCorrect ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Statistics correct: ${statsCorrect ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Best layout correct: ${bestLayoutCorrect ? 'PASS' : 'FAIL'}`);

      this.testResults.push({
        testCase: testCase.name,
        expected: testCase.expectedTotal,
        expanded: expandedPieces.length,
        placed: totalPlacedPieces,
        stats: stats.totalPieces,
        bestLayout: bestLayout.stats.totalPieces,
        allCorrect: expandedCorrect && placedCorrect && statsCorrect && bestLayoutCorrect
      });
    });
  }

  /**
   * Test detailed piece tracking through the algorithm
   */
  testPieceTracking() {
    console.log('\n\n=== DETAILED PIECE TRACKING TEST ===');

    const testPieces = [
      { id: 1, width: 100, height: 200, quantity: 2 },
      { id: 2, width: 150, height: 100, quantity: 3 }
    ];

    console.log('Input pieces:', testPieces);

    // Calculate expected total
    const expectedTotal = testPieces.reduce((sum, piece) => sum + parseInt(piece.quantity), 0);
    console.log(`Expected total pieces: ${expectedTotal}`);

    // Step 1: Test expansion
    console.log('\n--- Step 1: Piece Expansion ---');
    const expandedPieces = this.optimizationService.expandPiecesToIndividualItems(testPieces);
    console.log(`Expanded pieces count: ${expandedPieces.length}`);

    expandedPieces.forEach((piece, index) => {
      console.log(`  ${index + 1}. Piece ${piece.pieceId + 1}, Instance ${piece.instanceIndex + 1}: ${piece.width}x${piece.height}`);
    });

    // Step 2: Test layout generation
    console.log('\n--- Step 2: Layout Generation ---');
    const layout = this.optimizationService.generateOptimalLayout(testPieces, 1000, 800);

    layout.forEach((sheet, sheetIndex) => {
      console.log(`\n  Sheet ${sheetIndex + 1}:`);
      console.log(`    Placed pieces: ${sheet.placedPieces.length}`);
      console.log(`    Guillotine cuts: ${sheet.totalGuillotineCuts}`);

      sheet.placedPieces.forEach((piece, pieceIndex) => {
        console.log(
          `      ${pieceIndex + 1}. Piece ${piece.pieceId + 1}, Instance ${piece.instanceIndex + 1}: ${piece.width}x${piece.height} at (${piece.x}, ${piece.y})${piece.isRotated ? ' [ROTATED]' : ''}`
        );
      });
    });

    const totalPlacedPieces = layout.reduce((sum, sheet) => sum + sheet.placedPieces.length, 0);
    console.log(`\nTotal placed pieces across all sheets: ${totalPlacedPieces}`);

    // Step 3: Test statistics calculation
    console.log('\n--- Step 3: Statistics Calculation ---');
    const stats = this.optimizationService.calculateStatistics(layout, 1000, 800);
    console.log('Statistics:', {
      totalSheets: stats.totalSheets,
      totalPieces: stats.totalPieces,
      totalGuillotineCuts: stats.totalGuillotineCuts,
      totalCuttingCost: stats.totalCuttingCost
    });

    // Step 4: Test findBestLayout
    console.log('\n--- Step 4: Best Layout Algorithm ---');
    const bestLayout = this.optimizationService.findBestLayout(testPieces, 1000, 800);
    console.log('Best layout result:', {
      algorithm: bestLayout.algorithm,
      totalPieces: bestLayout.stats.totalPieces,
      totalSheets: bestLayout.stats.totalSheets,
      efficiency: `${bestLayout.stats.averageEfficiency.toFixed(2)}%`
    });

    // Final validation
    console.log('\n--- FINAL VALIDATION ---');
    console.log(`Expected: ${expectedTotal}`);
    console.log(`Expanded: ${expandedPieces.length} ${expandedPieces.length === expectedTotal ? '✓' : '✗'}`);
    console.log(`Placed: ${totalPlacedPieces} ${totalPlacedPieces === expectedTotal ? '✓' : '✗'}`);
    console.log(`Stats: ${stats.totalPieces} ${stats.totalPieces === expectedTotal ? '✓' : '✗'}`);
    console.log(`Best: ${bestLayout.stats.totalPieces} ${bestLayout.stats.totalPieces === expectedTotal ? '✓' : '✗'}`);
  }

  /**
   * Test edge cases that might cause counting issues
   */
  testEdgeCases() {
    console.log('\n\n=== EDGE CASE TESTING ===');

    const edgeCases = [
      {
        name: 'Zero quantity (should be ignored)',
        pieces: [
          { id: 1, width: 100, height: 200, quantity: 2 },
          { id: 2, width: 150, height: 100, quantity: 0 }, // Should be ignored
          { id: 3, width: 75, height: 75, quantity: 1 }
        ],
        expectedTotal: 3
      },
      {
        name: 'String quantities',
        pieces: [
          { id: 1, width: '100', height: '200', quantity: '2' },
          { id: 2, width: '150', height: '100', quantity: '3' }
        ],
        expectedTotal: 5
      },
      {
        name: 'Missing dimensions',
        pieces: [
          { id: 1, width: 100, height: 200, quantity: 2 },
          { id: 2, width: null, height: 100, quantity: 1 }, // Should be ignored
          { id: 3, width: 75, height: 75, quantity: 1 }
        ],
        expectedTotal: 3
      }
    ];

    edgeCases.forEach(testCase => {
      console.log(`\n--- Testing: ${testCase.name} ---`);

      try {
        const expandedPieces = this.optimizationService.expandPiecesToIndividualItems(testCase.pieces);
        const layout = this.optimizationService.generateOptimalLayout(testCase.pieces, 1000, 800);
        const totalPlacedPieces = layout.reduce((sum, sheet) => sum + sheet.placedPieces.length, 0);
        const stats = this.optimizationService.calculateStatistics(layout, 1000, 800);

        console.log(`Expected: ${testCase.expectedTotal}`);
        console.log(`Expanded: ${expandedPieces.length} ${expandedPieces.length === testCase.expectedTotal ? '✓' : '✗'}`);
        console.log(`Placed: ${totalPlacedPieces} ${totalPlacedPieces === testCase.expectedTotal ? '✓' : '✗'}`);
        console.log(`Stats: ${stats.totalPieces} ${stats.totalPieces === testCase.expectedTotal ? '✓' : '✗'}`);
      } catch (error) {
        console.log(`ERROR: ${error.message}`);
      }
    });
  }

  /**
   * Test validation method accuracy
   */
  testValidation() {
    console.log('\n\n=== VALIDATION METHOD TEST ===');

    const testPieces = [
      { id: 1, width: 100, height: 200, quantity: 2 },
      { id: 2, width: 150, height: 100, quantity: 3 }
    ];

    const validation = this.optimizationService.validateCuts(testPieces, 1000, 800);
    console.log('Validation result:', validation);
  }

  /**
   * Run all tests
   */
  runAllTests() {
    console.log('🧪 CUTTING OPTIMIZATION ALGORITHM TESTING');
    console.log('==========================================');

    this.testBasicPieceCounting();
    this.testPieceTracking();
    this.testEdgeCases();
    this.testValidation();

    console.log('\n\n=== TEST SUMMARY ===');
    this.testResults.forEach(result => {
      console.log(`${result.testCase}: ${result.allCorrect ? '✓ PASS' : '✗ FAIL'}`);
      if (!result.allCorrect) {
        console.log(
          `  Expected: ${result.expected}, Got: Expanded=${result.expanded}, Placed=${result.placed}, Stats=${result.stats}, Best=${result.bestLayout}`
        );
      }
    });
  }
}

// Export for use in browser console or test environment
if (typeof window !== 'undefined') {
  window.CuttingOptimizationTester = CuttingOptimizationTester;
}

export default CuttingOptimizationTester;
