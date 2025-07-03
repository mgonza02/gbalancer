/**
 * Quick test for the refactored NewPlanning component
 * Tests the new piece-based terminology and functionality
 */

import CuttingOptimizationService from './src/utils/CuttingOptimizationService.js';

console.log('🧪 Testing Refactored NewPlanning Component Logic...\n');

const optimizationService = new CuttingOptimizationService();

// Test 1: Simulate typical user input for pieces
console.log('=== TEST 1: Piece Input Simulation ===');
const pieces = [
  { id: 1, width: '100', height: '200', quantity: 2 },
  { id: 2, width: '150', height: '100', quantity: 3 }
];

console.log('User input pieces:', pieces);

// Convert to numbers as the component would
const processedPieces = pieces.map(piece => ({
  ...piece,
  width: parseInt(piece.width),
  height: parseInt(piece.height),
  quantity: parseInt(piece.quantity)
}));

console.log('Processed pieces:', processedPieces);

// Test calculation logic
const sheetWidth = 1000;
const sheetHeight = 800;

// Calculate total piece area (like component does)
let totalPieceArea = 0;
let totalPieces = 0;

processedPieces.forEach(piece => {
  if (piece.width && piece.height && piece.quantity) {
    const pieceArea = piece.width * piece.height * piece.quantity;
    totalPieceArea += pieceArea;
    totalPieces += piece.quantity;
  }
});

console.log(`Total piece area: ${totalPieceArea} mm²`);
console.log(`Total pieces: ${totalPieces}`);

// Test optimization
const optimizationResult = optimizationService.findBestLayout(processedPieces, sheetWidth, sheetHeight);

console.log('\n=== OPTIMIZATION RESULTS ===');
console.log(`Algorithm used: ${optimizationResult.algorithm}`);
console.log(`Sheets needed: ${optimizationResult.layout.length}`);
console.log(`Total pieces placed: ${optimizationResult.stats.totalPieces}`);
console.log(`Total guillotine cuts: ${optimizationResult.stats.totalGuillotineCuts}`);
console.log(`Efficiency: ${optimizationResult.stats.averageEfficiency.toFixed(2)}%`);

// Verify piece count accuracy
const placedPieces = optimizationResult.layout.reduce((sum, sheet) => sum + sheet.placedPieces.length, 0);
console.log(`\n=== PIECE COUNT VERIFICATION ===`);
console.log(`Expected pieces: ${totalPieces}`);
console.log(`Placed pieces: ${placedPieces}`);
console.log(`Match: ${totalPieces === placedPieces ? '✅ PASS' : '❌ FAIL'}`);

// Test 2: Edge case with single piece
console.log('\n=== TEST 2: Single Piece Edge Case ===');
const singlePiece = [
  { id: 1, width: '500', height: '400', quantity: 1 }
];

const singleResult = optimizationService.findBestLayout(
  singlePiece.map(p => ({ ...p, width: parseInt(p.width), height: parseInt(p.height), quantity: parseInt(p.quantity) })),
  1000, 
  800
);

console.log(`Single piece - Expected: 1, Placed: ${singleResult.stats.totalPieces}, Match: ${singleResult.stats.totalPieces === 1 ? '✅ PASS' : '❌ FAIL'}`);

console.log('\n✅ Component logic testing completed!');
