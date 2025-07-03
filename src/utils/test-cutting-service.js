/**
 * Simple Test Runner for Cutting Optimization Service
 * Run with: node src/utils/test-cutting-service.js
 */

const CuttingOptimizationService = require('./CuttingOptimizationService.js');

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  expect(actual) {
    return {
      toBe: expected => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected}, but got ${actual}`);
        }
      },
      toBeLessThanOrEqual: expected => {
        if (actual > expected) {
          throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
        }
      },
      toBeGreaterThanOrEqual: expected => {
        if (actual < expected) {
          throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
        }
      },
      toHaveLength: expected => {
        if (actual.length !== expected) {
          throw new Error(`Expected length ${expected}, but got ${actual.length}`);
        }
      },
      toEqual: expected => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
        }
      }
    };
  }

  async run() {
    console.log('🧪 Running Cutting Optimization Service Tests\n');

    for (const test of this.tests) {
      try {
        await test.testFn();
        console.log(`✅ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.name}`);
        console.log(`   Error: ${error.message}\n`);
        this.failed++;
      }
    }

    console.log('\n📊 Test Results:');
    console.log(`   Passed: ${this.passed}`);
    console.log(`   Failed: ${this.failed}`);
    console.log(`   Total:  ${this.tests.length}`);

    if (this.failed > 0) {
      console.log('\n🚨 Some tests failed! There may be bugs in the algorithm.');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
    }
  }
}

// Test Setup
const runner = new TestRunner();
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

  // Count placed pieces by original piece
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

  // Verify each original piece has correct count
  originalPieces.forEach((piece, index) => {
    const key = `${index}`;
    const placedCount = placedPiecesByOriginal[key] || 0;
    const requestedCount = parseInt(piece.quantity || 0);

    if (placedCount > requestedCount) {
      throw new Error(`Piece ${index} has ${placedCount} placed but only ${requestedCount} requested`);
    }
  });
};

// Test Cases
runner.test('should never produce more pieces than requested - single piece type', () => {
  const pieces = [{ width: 100, height: 50, quantity: 3 }];
  const sheetWidth = 300;
  const sheetHeight = 200;

  const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

  const totalPlaced = countTotalPlacedPieces(layout);
  const totalRequested = countTotalRequestedPieces(pieces);

  runner.expect(totalPlaced).toBeLessThanOrEqual(totalRequested);
  runner.expect(totalPlaced).toBe(3);

  verifyPlacementIntegrity(layout, pieces);
});

runner.test('should never produce more pieces than requested - multiple piece types', () => {
  const pieces = [
    { width: 50, height: 30, quantity: 2 },
    { width: 80, height: 40, quantity: 1 },
    { width: 20, height: 20, quantity: 4 }
  ];
  const sheetWidth = 200;
  const sheetHeight = 150;

  const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

  const totalPlaced = countTotalPlacedPieces(layout);
  const totalRequested = countTotalRequestedPieces(pieces);

  runner.expect(totalPlaced).toBeLessThanOrEqual(totalRequested);
  runner.expect(totalPlaced).toBe(7);

  verifyPlacementIntegrity(layout, pieces);
});

runner.test('should handle large quantities correctly', () => {
  const pieces = [{ width: 25, height: 25, quantity: 16 }];
  const sheetWidth = 100;
  const sheetHeight = 100;

  const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

  const totalPlaced = countTotalPlacedPieces(layout);
  const totalRequested = countTotalRequestedPieces(pieces);

  runner.expect(totalPlaced).toBeLessThanOrEqual(totalRequested);
  runner.expect(totalPlaced).toBe(16);

  verifyPlacementIntegrity(layout, pieces);
});

runner.test('should not duplicate pieces in expansion phase', () => {
  const pieces = [{ width: 25, height: 25, quantity: 4 }];

  const individualPieces = service.expandPiecesToIndividualItems(pieces);

  runner.expect(individualPieces).toHaveLength(4);

  // Verify each has unique instance index
  const instanceIndices = individualPieces.map(p => p.instanceIndex);
  const uniqueIndices = [...new Set(instanceIndices)];
  runner.expect(uniqueIndices).toHaveLength(4);
  runner.expect(uniqueIndices.sort()).toEqual([0, 1, 2, 3]);
});

runner.test('should not place same piece multiple times', () => {
  const pieces = [{ width: 30, height: 30, quantity: 3 }];
  const sheetWidth = 100;
  const sheetHeight = 100;

  const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

  // Check for duplicate placements
  const allPlacedPieces = layout.flatMap(sheet => sheet.placedPieces || []);
  const placementKeys = allPlacedPieces.map(p => `${p.pieceId}-${p.instanceIndex}`);
  const uniqueKeys = [...new Set(placementKeys)];

  runner.expect(placementKeys).toHaveLength(uniqueKeys.length);
  runner.expect(allPlacedPieces).toHaveLength(3);

  verifyPlacementIntegrity(layout, pieces);
});

runner.test('should handle high quantity stress test', () => {
  const pieces = [{ width: 10, height: 10, quantity: 50 }];
  const sheetWidth = 100;
  const sheetHeight = 100;

  const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

  const totalPlaced = countTotalPlacedPieces(layout);
  const totalRequested = countTotalRequestedPieces(pieces);

  runner.expect(totalPlaced).toBeLessThanOrEqual(totalRequested);
  runner.expect(totalPlaced).toBe(50);

  verifyPlacementIntegrity(layout, pieces);
});

runner.test('should handle recursive cutting without piece duplication', () => {
  const pieces = [{ width: 20, height: 20, quantity: 6 }];
  const sheetWidth = 60;
  const sheetHeight = 40;

  const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

  const totalPlaced = countTotalPlacedPieces(layout);
  const totalRequested = countTotalRequestedPieces(pieces);

  runner.expect(totalPlaced).toBeLessThanOrEqual(totalRequested);
  runner.expect(totalPlaced).toBe(6);

  // Verify no piece is counted multiple times
  const allPlacedPieces = layout.flatMap(sheet => sheet.placedPieces || []);
  const placementKeys = allPlacedPieces.map(p => `${p.pieceId}-${p.instanceIndex}`);
  const uniqueKeys = [...new Set(placementKeys)];

  runner.expect(placementKeys).toHaveLength(uniqueKeys.length);

  verifyPlacementIntegrity(layout, pieces);
});

runner.test('should handle tight fitting scenarios', () => {
  const pieces = [
    { width: 50, height: 100, quantity: 2 },
    { width: 100, height: 50, quantity: 2 }
  ];
  const sheetWidth = 100;
  const sheetHeight = 100;

  const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

  const totalPlaced = countTotalPlacedPieces(layout);
  const totalRequested = countTotalRequestedPieces(pieces);

  runner.expect(totalPlaced).toBeLessThanOrEqual(totalRequested);

  verifyPlacementIntegrity(layout, pieces);
});

// Run all tests
runner.run().catch(console.error);
