# Cutting Plan Visualization Feature

## Overview
Added a D3.js-based visualization component to display cutting plan layouts, showing how cuts are optimally arranged on sheets. This feature helps users visualize the efficiency of their cutting plans and understand the optimization results.

## Implementation Details

### New Components
1. **CuttingPlanVisualization.jsx** - Main visualization component using D3.js
2. **PDFExportService.js** - Professional PDF generation service with branding
3. **testData.js** - Sample data for testing the visualization
4. **visualization-test.jsx** - Test page to showcase the component

### Features
- **Interactive Visualization**: Shows cuts arranged on sheets with different colors for each cut type
- **Hover Tooltips**: Display detailed information about each cut piece
- **Multi-Sheet Support**: Navigation buttons to switch between sheets when multiple sheets are required
- **Rotation Indicator**: Shows when pieces are rotated 90° for optimal fitting
- **Waste Area Visualization**: Highlights unused areas with detailed waste information
- **Efficiency Metrics**: Real-time display of material usage and waste percentages
- **Interactive Waste Areas**: Hover over waste areas to see utilization suggestions
- **PDF Export**: Professional PDF generation with company branding and detailed reports
- **Responsive Design**: Scales visualization to fit different container sizes
- **Legend**: Color-coded legend showing cut dimensions, quantities, and waste areas

### New Waste Visualization Features

#### Waste Area Highlighting
- **Visual Indicators**: Unused areas are highlighted with red dashed borders
- **Interactive Tooltips**: Hover over waste areas to see size and potential usage suggestions
- **Area Calculations**: Precise measurement of wasted material in mm²
- **Efficiency Metrics**: Color-coded efficiency indicators (green > 80%, orange > 60%, red < 60%)

#### Detailed Information Panels
- **Current Sheet Stats**: Shows used area, waste area, and efficiency for selected sheet
- **Project Totals**: Displays total material usage across all sheets
- **Real-time Updates**: Metrics update when switching between sheets
- **Cost Implications**: Visual representation helps understand material costs

#### Enhanced Legend
- **Cut Types**: Color-coded squares showing different cut dimensions
- **Waste Areas**: Dashed pattern indicator for unused regions
- **Efficiency Guide**: Visual guide for interpreting waste levels

### Professional PDF Export

#### Document Structure
- **Branded Header**: Company logo, name, and project information
- **Project Summary**: Complete project details and material specifications
- **Cutting Statistics**: Sheet-by-sheet breakdown with efficiency metrics
- **Visual Layout**: High-quality capture of the cutting plan visualization
- **Cut Details Table**: Comprehensive table with all cut specifications
- **Professional Footer**: Contact information, disclaimers, and page numbers

#### Branding Elements
- **Company Identity**: GCut branding with logo placeholder
- **Color Scheme**: Material UI blue theme for professional appearance
- **Typography**: Helvetica font family for clear, readable text
- **Layout**: A4 landscape format optimized for workshop use

#### Export Options
- **Automatic Naming**: Intelligent file naming with project and date
- **Multiple Pages**: Automatic page breaks for large projects
- **Quality Control**: High-resolution visualization capture
- **Error Handling**: Graceful fallbacks for capture issues

#### Technical Features
- **jsPDF Integration**: Vector-based PDF generation for crisp text
- **html2canvas**: High-quality visualization rendering
- **Responsive Sizing**: Automatic scaling to fit page dimensions
- **Memory Optimization**: Efficient handling of large visualizations

### Integration Points

#### New Planning Page
- Visualization appears in the results section after calculation
- Shows the optimal layout with all pieces positioned on sheets
- Helps users understand the efficiency of their cutting plan

#### View Historic Page  
- Added visualization to the project details dialog
- Users can view saved cutting layouts for any project
- Provides visual confirmation of past optimization results

### Technical Implementation

#### D3.js Features Used
- SVG rendering for scalable graphics
- Data binding for dynamic cut positioning
- Color scales for visual differentiation
- Interactive events (hover, mouseover)
- Tooltip creation and positioning

#### Layout Algorithm
- First-fit decreasing bin packing approach
- Considers piece rotation for better space utilization
- Handles multiple sheets when cuts don't fit on single sheet
- Optimizes for material efficiency

#### Waste Detection Algorithm
- **Grid-based Analysis**: Uses a 10mm grid to identify unused rectangular regions
- **Rectangular Region Finding**: Efficiently detects larger waste areas that could be useful
- **Minimum Size Filtering**: Only highlights waste areas larger than 20×20mm
- **Overlap Prevention**: Ensures waste areas don't overlap with placed cuts
- **Performance Optimized**: Fast algorithm suitable for real-time visualization

#### Data Structure
```javascript
layout: [
  {
    sheetNumber: 1,
    cuts: [
      {
        cutId: 0,
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        rotated: false
      }
      // ... more cuts
    ]
  }
  // ... more sheets
]
```

## User Benefits

1. **Visual Confirmation**: Users can see exactly how their cuts will be arranged
2. **Efficiency Understanding**: Visual representation of optimization results with waste highlighting
3. **Material Cost Awareness**: Clear display of unused material and potential cost implications
4. **Planning Validation**: Helps verify that the cutting plan meets expectations
5. **Waste Optimization**: Interactive waste areas suggest potential improvements
6. **Professional Documentation**: Generate branded PDF reports for clients and workshops
7. **Workshop Ready**: Print-ready cutting plans with all necessary information
8. **Historical Reference**: Saved visualizations and PDFs provide reference for future projects
9. **Better Decision Making**: Visual feedback helps in adjusting cut sizes or quantities
10. **Resource Planning**: Understanding waste helps in material ordering and cost estimation

## Future Enhancements

### Possible Improvements
- **Advanced Algorithms**: Implement more sophisticated bin packing algorithms
- **3D Visualization**: For materials with thickness considerations
- **Cut Sequence**: Show optimal cutting sequence and tool paths
- **Interactive Editing**: Allow manual adjustment of piece positions
- **Custom Branding**: Configurable company logos and color schemes
- **Multiple Export Formats**: SVG, DXF, and other CAD formats
- **Cost Calculations**: Integration with material pricing databases

### Performance Optimizations
- **Virtual Scrolling**: For projects with many sheets
- **WebGL Rendering**: For complex layouts with many pieces
- **Lazy Loading**: Load visualizations on demand

## Usage Instructions

### For New Projects
1. Enter sheet dimensions and cut requirements
2. Click "Calculate Sheets"
3. View the generated visualization in the results section
4. Use sheet navigation buttons if multiple sheets are required
5. Hover over pieces and waste areas for detailed information
6. Click the PDF icon to export a professional cutting plan document

### For Historic Projects
1. Go to "Planning History" page
2. Click "View Details" for any project to see the visualization
3. Use the PDF export button in the visualization or table row
4. Navigate between sheets if applicable

### PDF Export Features
- **From Visualization**: Click the PDF icon in the visualization header
- **From Table**: Use the download button in the actions column
- **Automatic Naming**: Files named with project name and date
- **Professional Format**: Branded documents ready for workshop use

### Test Page
- Access `/visualization-test` to see sample visualization
- Demonstrates all features with test data
- Useful for understanding component capabilities

## Code Quality
- TypeScript-ready (can be easily converted)
- Modular and reusable component design
- Responsive and accessible
- Well-documented with comments
- Error handling for edge cases
- Performance optimized rendering
