/**
 * Comprehensive Tests for Cutting Optimization Service
 *
 * These tests verify that the guillotine cutting algorithm:
 * 1. Never produces more pieces than requested
 * 2. Correctly handles edge cases and constraints
 * 3. Maintains data structure integrity
 */

import CuttingOptimizationService from './CuttingOptimizationService.js';

describe('CuttingOptimizationService', () => {
  let service;

  beforeEach(() => {
    service = new CuttingOptimizationService();
  });

  /**
   * Helper function to count total placed pieces from layout
   */
  const countTotalPlacedPieces = layout => {
    return layout.reduce((total, sheet) => {
      return total + (sheet.placedPieces ? sheet.placedPieces.length : 0);
    }, 0);
  };

  /**
   * Helper function to count total requested pieces from input
   */
  const countTotalRequestedPieces = pieces => {
    return pieces.reduce((total, piece) => {
      return total + parseInt(piece.quantity || 0);
    }, 0);
  };

  /**
   * Helper function to verify piece placement integrity
   */
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

      expect(placedCount).toBeLessThanOrEqual(requestedCount);
    });
  };

  describe('Basic Piece Count Validation', () => {
    test('should never produce more pieces than requested - single piece type', () => {
      const pieces = [{ width: 100, height: 50, quantity: 3 }];
      const sheetWidth = 300;
      const sheetHeight = 200;

      const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

      const totalPlaced = countTotalPlacedPieces(layout);
      const totalRequested = countTotalRequestedPieces(pieces);

      expect(totalPlaced).toBeLessThanOrEqual(totalRequested);
      expect(totalPlaced).toBe(3); // Should place all 3 pieces

      verifyPlacementIntegrity(layout, pieces);
    });

    test('should never produce more pieces than requested - multiple piece types', () => {
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

      expect(totalPlaced).toBeLessThanOrEqual(totalRequested);
      expect(totalPlaced).toBe(7); // Should place all 7 pieces (2+1+4)

      verifyPlacementIntegrity(layout, pieces);
    });

    test('should handle large quantities correctly', () => {
      const pieces = [
        { width: 25, height: 25, quantity: 16 } // 16 small squares
      ];
      const sheetWidth = 100;
      const sheetHeight = 100;

      const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

      const totalPlaced = countTotalPlacedPieces(layout);
      const totalRequested = countTotalRequestedPieces(pieces);

      expect(totalPlaced).toBeLessThanOrEqual(totalRequested);
      expect(totalPlaced).toBe(16); // Should fit all 16 pieces on one sheet

      verifyPlacementIntegrity(layout, pieces);
    });
  });

  describe('Edge Cases and Constraints', () => {
    test('should handle pieces that dont fit on sheet', () => {
      const pieces = [
        { width: 300, height: 200, quantity: 1 }, // Too big
        { width: 50, height: 50, quantity: 2 } // These should fit
      ];
      const sheetWidth = 100;
      const sheetHeight = 100;

      const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

      const totalPlaced = countTotalPlacedPieces(layout);
      const totalRequested = countTotalRequestedPieces(pieces);

      expect(totalPlaced).toBeLessThanOrEqual(totalRequested);
      expect(totalPlaced).toBe(2); // Only the 2 small pieces should fit

      verifyPlacementIntegrity(layout, pieces);
    });

    test('should handle rotation scenarios correctly', () => {
      const pieces = [
        { width: 80, height: 40, quantity: 3 } // Should fit with rotation
      ];
      const sheetWidth = 50;
      const sheetHeight = 150;

      const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

      const totalPlaced = countTotalPlacedPieces(layout);
      const totalRequested = countTotalRequestedPieces(pieces);

      expect(totalPlaced).toBeLessThanOrEqual(totalRequested);

      verifyPlacementIntegrity(layout, pieces);
    });

    test('should handle empty or zero quantity pieces', () => {
      const pieces = [
        { width: 50, height: 50, quantity: 0 },
        { width: 30, height: 30, quantity: 2 },
        { width: 40, height: 40, quantity: 0 }
      ];
      const sheetWidth = 100;
      const sheetHeight = 100;

      const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

      const totalPlaced = countTotalPlacedPieces(layout);
      const totalRequested = countTotalRequestedPieces(pieces);

      expect(totalPlaced).toBeLessThanOrEqual(totalRequested);
      expect(totalPlaced).toBe(2); // Only 2 pieces have quantity > 0

      verifyPlacementIntegrity(layout, pieces);
    });

    test('should handle mixed sizes requiring multiple sheets', () => {
      const pieces = [
        { width: 90, height: 90, quantity: 3 }, // Large pieces
        { width: 20, height: 20, quantity: 10 } // Small pieces
      ];
      const sheetWidth = 100;
      const sheetHeight = 100;

      const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

      const totalPlaced = countTotalPlacedPieces(layout);
      const totalRequested = countTotalRequestedPieces(pieces);

      expect(totalPlaced).toBeLessThanOrEqual(totalRequested);
      expect(totalPlaced).toBe(13); // Should place all pieces

      verifyPlacementIntegrity(layout, pieces);
    });
  });

  describe('Algorithm Integrity Tests', () => {
    test('should create valid piece IDs and instance indices', () => {
      const pieces = [
        { width: 50, height: 30, quantity: 3 },
        { width: 40, height: 40, quantity: 2 }
      ];
      const sheetWidth = 150;
      const sheetHeight = 100;

      const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

      // Verify all placed pieces have valid IDs and indices
      layout.forEach(sheet => {
        if (sheet.placedPieces) {
          sheet.placedPieces.forEach(placedPiece => {
            expect(placedPiece.pieceId).toBeGreaterThanOrEqual(0);
            expect(placedPiece.instanceIndex).toBeGreaterThanOrEqual(0);
            expect(placedPiece.width).toBeGreaterThan(0);
            expect(placedPiece.height).toBeGreaterThan(0);
            expect(typeof placedPiece.x).toBe('number');
            expect(typeof placedPiece.y).toBe('number');
            expect(typeof placedPiece.isRotated).toBe('boolean');
          });
        }
      });

      verifyPlacementIntegrity(layout, pieces);
    });

    test('should track instance indices correctly for duplicates', () => {
      const pieces = [{ width: 50, height: 50, quantity: 4 }];
      const sheetWidth = 100;
      const sheetHeight = 100;

      const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

      const placedPieces = layout.flatMap(sheet => sheet.placedPieces || []);
      const instanceIndices = placedPieces.map(p => p.instanceIndex).sort();

      // Should have indices 0, 1, 2, 3
      expect(instanceIndices).toEqual([0, 1, 2, 3]);

      verifyPlacementIntegrity(layout, pieces);
    });

    test('should maintain consistent sheet structure', () => {
      const pieces = [{ width: 30, height: 30, quantity: 2 }];
      const sheetWidth = 100;
      const sheetHeight = 50;

      const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

      expect(Array.isArray(layout)).toBe(true);
      layout.forEach((sheet, index) => {
        expect(sheet.sheetNumber).toBe(index + 1);
        expect(Array.isArray(sheet.placedPieces)).toBe(true);
        expect(Array.isArray(sheet.guillotineCuts)).toBe(true);
        expect(typeof sheet.totalGuillotineCuts).toBe('number');
      });

      verifyPlacementIntegrity(layout, pieces);
    });
  });

  describe('Stress Tests for Bug Detection', () => {
    test('should handle high quantity stress test', () => {
      const pieces = [{ width: 10, height: 10, quantity: 50 }];
      const sheetWidth = 100;
      const sheetHeight = 100;

      const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

      const totalPlaced = countTotalPlacedPieces(layout);
      const totalRequested = countTotalRequestedPieces(pieces);

      expect(totalPlaced).toBeLessThanOrEqual(totalRequested);
      expect(totalPlaced).toBe(50); // Should fit all 50 small pieces

      verifyPlacementIntegrity(layout, pieces);
    });

    test('should handle many different piece types', () => {
      const pieces = [];
      for (let i = 1; i <= 10; i++) {
        pieces.push({
          width: 10 + i * 5,
          height: 15 + i * 3,
          quantity: 2
        });
      }

      const sheetWidth = 200;
      const sheetHeight = 200;

      const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

      const totalPlaced = countTotalPlacedPieces(layout);
      const totalRequested = countTotalRequestedPieces(pieces);

      expect(totalPlaced).toBeLessThanOrEqual(totalRequested);
      expect(totalPlaced).toBe(20); // Should place all 20 pieces (10 types × 2 each)

      verifyPlacementIntegrity(layout, pieces);
    });

    test('should handle tight fitting scenarios', () => {
      const pieces = [
        { width: 50, height: 100, quantity: 2 }, // Exactly half sheet width
        { width: 100, height: 50, quantity: 2 } // Exactly half sheet height
      ];
      const sheetWidth = 100;
      const sheetHeight = 100;

      const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

      const totalPlaced = countTotalPlacedPieces(layout);
      const totalRequested = countTotalRequestedPieces(pieces);

      expect(totalPlaced).toBeLessThanOrEqual(totalRequested);

      verifyPlacementIntegrity(layout, pieces);
    });
  });

  describe('Specific Bug Reproduction Tests', () => {
    test('should not duplicate pieces in expansion phase', () => {
      const pieces = [{ width: 25, height: 25, quantity: 4 }];

      // Test the expansion method directly
      const individualPieces = service.expandPiecesToIndividualItems(pieces);

      expect(individualPieces).toHaveLength(4);

      // Verify each has unique instance index
      const instanceIndices = individualPieces.map(p => p.instanceIndex);
      const uniqueIndices = [...new Set(instanceIndices)];
      expect(uniqueIndices).toHaveLength(4);
      expect(uniqueIndices.sort()).toEqual([0, 1, 2, 3]);
    });

    test('should not place same piece multiple times', () => {
      const pieces = [{ width: 30, height: 30, quantity: 3 }];
      const sheetWidth = 100;
      const sheetHeight = 100;

      const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

      // Check for duplicate placements
      const allPlacedPieces = layout.flatMap(sheet => sheet.placedPieces || []);
      const placementKeys = allPlacedPieces.map(p => `${p.pieceId}-${p.instanceIndex}`);
      const uniqueKeys = [...new Set(placementKeys)];

      expect(placementKeys).toHaveLength(uniqueKeys.length); // No duplicates
      expect(allPlacedPieces).toHaveLength(3); // Exactly 3 pieces

      verifyPlacementIntegrity(layout, pieces);
    });

    test('should handle recursive cutting without piece duplication', () => {
      const pieces = [
        { width: 20, height: 20, quantity: 6 } // Should create nested cuts
      ];
      const sheetWidth = 60;
      const sheetHeight = 40;

      const layout = service.generateOptimalLayout(pieces, sheetWidth, sheetHeight);

      const totalPlaced = countTotalPlacedPieces(layout);
      const totalRequested = countTotalRequestedPieces(pieces);

      expect(totalPlaced).toBeLessThanOrEqual(totalRequested);
      expect(totalPlaced).toBe(6);

      // Verify no piece is counted multiple times
      const allPlacedPieces = layout.flatMap(sheet => sheet.placedPieces || []);
      const placementKeys = allPlacedPieces.map(p => `${p.pieceId}-${p.instanceIndex}`);
      const uniqueKeys = [...new Set(placementKeys)];

      expect(placementKeys).toHaveLength(uniqueKeys.length);

      verifyPlacementIntegrity(layout, pieces);
    });
  });
});
