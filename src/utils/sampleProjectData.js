// Test script to create sample projects in localStorage for testing PDF export
// This can be run in the browser console to add test data

const sampleProjects = [
  {
    id: '1730000000001',
    name: 'Kitchen Cabinet Doors',
    materialType: 'wood',
    sheetWidth: 2400,
    sheetHeight: 1200,
    sheetsNeeded: 3,
    totalPieces: 12,
    efficiency: 85.5,
    totalCutArea: 2456000,
    sheetArea: 2880000,
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
    cuts: [
      { id: 0, width: 600, height: 400, quantity: 4 },
      { id: 1, width: 800, height: 350, quantity: 4 },
      { id: 2, width: 300, height: 200, quantity: 4 }
    ],
    layout: [
      {
        sheetNumber: 1,
        cuts: [
          { cutId: 0, width: 600, height: 400, x: 0, y: 0 },
          { cutId: 0, width: 600, height: 400, x: 600, y: 0 },
          { cutId: 1, width: 800, height: 350, x: 0, y: 400 },
          { cutId: 1, width: 800, height: 350, x: 800, y: 400 },
          { cutId: 2, width: 300, height: 200, x: 1200, y: 0 },
          { cutId: 2, width: 300, height: 200, x: 1500, y: 0 }
        ]
      },
      {
        sheetNumber: 2,
        cuts: [
          { cutId: 0, width: 600, height: 400, x: 0, y: 0 },
          { cutId: 0, width: 600, height: 400, x: 600, y: 0 },
          { cutId: 1, width: 800, height: 350, x: 0, y: 400 },
          { cutId: 1, width: 800, height: 350, x: 800, y: 400 },
          { cutId: 2, width: 300, height: 200, x: 1200, y: 0 },
          { cutId: 2, width: 300, height: 200, x: 1500, y: 0 }
        ]
      },
      {
        sheetNumber: 3,
        cuts: [
          { cutId: 1, width: 800, height: 350, x: 0, y: 0 },
          { cutId: 1, width: 800, height: 350, x: 800, y: 0 }
        ]
      }
    ]
  },
  {
    id: '1730000000002',
    name: 'Glass Shelving Units',
    materialType: 'glass',
    sheetWidth: 3000,
    sheetHeight: 2000,
    sheetsNeeded: 2,
    totalPieces: 8,
    efficiency: 92.3,
    totalCutArea: 5540000,
    sheetArea: 6000000,
    createdAt: '2024-01-14T14:20:00.000Z',
    updatedAt: '2024-01-14T14:20:00.000Z',
    cuts: [
      { id: 0, width: 1200, height: 800, quantity: 4 },
      { id: 1, width: 900, height: 600, quantity: 4 }
    ],
    layout: [
      {
        sheetNumber: 1,
        cuts: [
          { cutId: 0, width: 1200, height: 800, x: 0, y: 0 },
          { cutId: 0, width: 1200, height: 800, x: 1200, y: 0 },
          { cutId: 1, width: 900, height: 600, x: 0, y: 800 },
          { cutId: 1, width: 900, height: 600, x: 900, y: 800 },
          { cutId: 0, width: 1200, height: 800, x: 0, y: 1400 }
        ]
      },
      {
        sheetNumber: 2,
        cuts: [
          { cutId: 0, width: 1200, height: 800, x: 0, y: 0 },
          { cutId: 1, width: 900, height: 600, x: 1200, y: 0 },
          { cutId: 1, width: 900, height: 600, x: 1200, y: 600 }
        ]
      }
    ]
  },
  {
    id: '1730000000003',
    name: 'Metal Brackets',
    materialType: 'metal',
    sheetWidth: 1500,
    sheetHeight: 1000,
    sheetsNeeded: 1,
    totalPieces: 20,
    efficiency: 78.5,
    totalCutArea: 1177500,
    sheetArea: 1500000,
    createdAt: '2024-01-13T09:15:00.000Z',
    updatedAt: '2024-01-13T09:15:00.000Z',
    cuts: [
      { id: 0, width: 150, height: 100, quantity: 10 },
      { id: 1, width: 200, height: 150, quantity: 6 },
      { id: 2, width: 100, height: 75, quantity: 4 }
    ],
    layout: [
      {
        sheetNumber: 1,
        cuts: [
          // Row 1
          { cutId: 0, width: 150, height: 100, x: 0, y: 0 },
          { cutId: 0, width: 150, height: 100, x: 150, y: 0 },
          { cutId: 0, width: 150, height: 100, x: 300, y: 0 },
          { cutId: 0, width: 150, height: 100, x: 450, y: 0 },
          { cutId: 0, width: 150, height: 100, x: 600, y: 0 },
          { cutId: 1, width: 200, height: 150, x: 750, y: 0 },
          { cutId: 1, width: 200, height: 150, x: 950, y: 0 },
          { cutId: 1, width: 200, height: 150, x: 1150, y: 0 },
          // Row 2
          { cutId: 0, width: 150, height: 100, x: 0, y: 150 },
          { cutId: 0, width: 150, height: 100, x: 150, y: 150 },
          { cutId: 0, width: 150, height: 100, x: 300, y: 150 },
          { cutId: 0, width: 150, height: 100, x: 450, y: 150 },
          { cutId: 0, width: 150, height: 100, x: 600, y: 150 },
          { cutId: 1, width: 200, height: 150, x: 750, y: 150 },
          { cutId: 1, width: 200, height: 150, x: 950, y: 150 },
          { cutId: 1, width: 200, height: 150, x: 1150, y: 150 },
          // Row 3
          { cutId: 2, width: 100, height: 75, x: 0, y: 300 },
          { cutId: 2, width: 100, height: 75, x: 100, y: 300 },
          { cutId: 2, width: 100, height: 75, x: 200, y: 300 },
          { cutId: 2, width: 100, height: 75, x: 300, y: 300 }
        ]
      }
    ]
  }
];

// Function to populate localStorage with sample data
function addSampleProjects() {
  try {
    // Get existing projects
    const existingProjects = JSON.parse(localStorage.getItem('cuttingProjects') || '[]');

    // Check if sample projects already exist to avoid duplicates
    const sampleIds = sampleProjects.map(p => p.id);
    const filteredExisting = existingProjects.filter(p => !sampleIds.includes(p.id));

    // Combine and save
    const allProjects = [...sampleProjects, ...filteredExisting];
    localStorage.setItem('cuttingProjects', JSON.stringify(allProjects));

    console.log('Sample projects added successfully!');
    console.log(`Total projects: ${allProjects.length}`);

    return allProjects;
  } catch (error) {
    console.error('Error adding sample projects:', error);
  }
}

// Function to clear all projects (for testing)
function clearAllProjects() {
  localStorage.removeItem('cuttingProjects');
  console.log('All projects cleared from localStorage');
}

// Export functions for browser console use
window.addSampleProjects = addSampleProjects;
window.clearAllProjects = clearAllProjects;

// Auto-run to add sample data
if (typeof window !== 'undefined') {
  console.log('Sample project loader ready. Run addSampleProjects() to add test data.');
}

export { sampleProjects, addSampleProjects, clearAllProjects };
