// Test data for the cutting plan visualization
export const testCuttingData = {
  sheetWidth: 2400,
  sheetHeight: 1200,
  cuts: [
    { id: 0, width: 800, height: 600, quantity: 2 },
    { id: 1, width: 400, height: 300, quantity: 3 },
    { id: 2, width: 200, height: 200, quantity: 4 }
  ],
  layout: [
    {
      sheetNumber: 1,
      cuts: [
        { cutId: 0, width: 800, height: 600, x: 0, y: 0 },
        { cutId: 0, width: 800, height: 600, x: 800, y: 0 },
        { cutId: 1, width: 400, height: 300, x: 0, y: 600 },
        { cutId: 1, width: 400, height: 300, x: 400, y: 600 },
        { cutId: 2, width: 200, height: 200, x: 1600, y: 0 },
        { cutId: 2, width: 200, height: 200, x: 1800, y: 0 }
        // This leaves significant waste areas that will be highlighted
      ]
    },
    {
      sheetNumber: 2,
      cuts: [
        { cutId: 1, width: 400, height: 300, x: 0, y: 0 },
        { cutId: 2, width: 200, height: 200, x: 400, y: 0 },
        { cutId: 2, width: 200, height: 200, x: 600, y: 0 }
        // This sheet has a lot of waste to demonstrate the feature
      ]
    }
  ]
};
