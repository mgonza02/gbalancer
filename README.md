# GBalancer

**Territory Balancer** - A React web application for creating and visualizing balanced sales force territories on a Google Map. This application serves as a planning tool for sales managers to automatically partition customers into balanced, geographically clustered polygons (territories).

## Features

- **Customer Data Source Selection**: Choose from sample data, JSON file upload, or API integration
- **Interactive Google Maps Integration**: View customers and territories on a real map
- **K-means Clustering**: Automatically cluster customers into balanced territories
- **Convex Hull Visualization**: Generate polygon boundaries for each territory
- **Real-time Validation**: Ensure territories don't exceed customer limits
- **Interactive Territory Info**: Click on territories to see detailed information
- **Data Persistence**: Customer data is automatically saved to browser storage
- **Responsive Design**: Works on desktop and mobile devices

## Core User Story

As a sales manager, you can:
1. **Load customer data** from multiple sources:
   - Use pre-configured sample data
   - Upload your own JSON file (up to 5MB)
   - Fetch data from your API endpoint
2. **Configure territories** by specifying:
   - Number of available sellers
   - Maximum customers per seller
   - Territory size and sales constraints
3. **Generate territories** automatically to partition customers into balanced, geographically clustered territories
4. **Visualize results** on an interactive map with territory boundaries
5. View the resulting territories as colored polygons on the map

## Customer Data Source Selection

The application now supports multiple ways to load customer data:

### 1. Sample Data
- **Use case**: Quick testing and demonstrations
- **Action**: Click "Load Sample Data" button
- **Data**: Pre-configured customer data from Arequipa, Peru region

### 2. Upload JSON File
- **Use case**: Import your own customer data
- **Requirements**:
  - JSON file format only
  - Maximum file size: 5MB
  - Must contain array of customer objects
- **Required fields**: `id`, `customer_name` (or `name`), `lat`, `lng`, `sales`

### 3. From API
- **Use case**: Real-time data integration
- **Configuration**:
  - API endpoint URL (required)
  - Bearer token for authentication (optional)
- **API Requirements**: Must return JSON array of customer objects

### Data Persistence
- All customer data is automatically saved to browser's localStorage
- Data persists across browser sessions
- Application automatically loads saved data on startup

For detailed information about the data source feature, see [DATA_SOURCE_FEATURE.md](DATA_SOURCE_FEATURE.md).

### Example JSON File
A sample JSON file (`sample-customer-data.json`) is provided in the project root for testing the upload functionality.

## Setup Instructions

### Prerequisites
- Node.js 18+
- Google Maps API key

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd /path/to/gbalancer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Google Maps API**:
   - Copy `.env.local` and add your Google Maps API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY="your-actual-api-key-here"
   ```
   - Enable the following APIs in Google Cloud Console:
     - Maps JavaScript API
     - Geocoding API

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Access the application**:
   - Open your browser and navigate to `http://localhost:3003/gbalancer`

## Usage Guide

### Basic Operation

1. **View Customer Data**: The map loads with 100 mock customers distributed across the San Francisco Bay Area
2. **Set Parameters**:
   - **Number of Sellers**: How many sales territories to create (1-20)
   - **Max Customers per Territory**: Maximum customers any single seller should handle (1-100)
3. **Generate Territories**: Click the "Generate Territories" button to create balanced territories
4. **Explore Results**:
   - View territories as colored polygons on the map
   - Click on any territory to see detailed information
   - Use the legend to identify different territories

### Parameter Guidelines

- **Capacity Check**: Total max capacity (sellers × max customers) must be ≥ total customers
- **Minimum Requirements**: Total min requirements (sellers × min customers) should be ≤ total customers
- **Range Validation**: Min customers per territory must be ≤ max customers per territory
- **Optimal Settings**: For 100 customers, try:
  - 5 sellers with 15-25 customers each (min 15, max 25)
  - 4 sellers with 20-30 customers each (min 20, max 30)
  - 10 sellers with 8-15 customers each (min 8, max 15)

### Error Handling

The application provides clear error messages for:
- Insufficient max capacity settings
- Excessive minimum requirements
- Invalid parameter ranges (min > max)
- Unbalanced clustering results
- Google Maps API issues
- Invalid parameter inputs

1. Clone the repository
```bash
git clone <repository-url>
cd modern-dashboard-template
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run prettier` - Format code with Prettier
- `npm run format` - Run both Prettier and ESLint fixes

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Theme, etc.)
├── hooks/             # Custom React hooks
├── i18n/              # Internationalization setup
├── layout/            # Layout components
├── menu-items/        # Navigation menu configuration
├── pages/             # Page components
├── routes/            # Routing configuration
├── themes/            # Theme configuration
├── utils/             # Utility functions
└── App.jsx            # Main App component
```

## Features Guide

### Dark/Light Mode

The template includes a built-in theme switcher that allows users to toggle between dark and light modes. The preference is automatically saved to localStorage and persists across sessions.

### Multilanguage Support

Currently supports English and Spanish. Languages can be switched using the language switcher component. Add new languages by extending the translation files in `src/i18n/`.

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route in `src/routes/MainRoutes.jsx`
3. Add menu item in `src/menu-items/`
4. Add translations in `src/i18n/index.js`

### Customizing Themes

Theme customization can be done in `src/themes/`. The template uses Material-UI's theming system, allowing you to customize colors, typography, spacing, and component styles.

## Building for Production

```bash
npm run build
```

The build folder will contain the optimized production build.

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For questions and support, please open an issue on the GitHub repository.

## Technical Implementation

### Core Technologies

- **React 19**: Modern React with hooks for state management
- **Material-UI**: Professional UI components and theming
- **@react-google-maps/api**: Google Maps integration for React
- **ml-kmeans**: K-means clustering algorithm for territory creation
- **convex-hull**: Polygon boundary calculation for territory visualization
- **Vite**: Fast development build tool

### Architecture

```
src/
├── components/
│   ├── Controls.jsx          # User input panel for territory parameters
│   └── MapContainer.jsx      # Google Maps display with markers and polygons
├── services/
│   └── territoryService.js   # Core business logic for territory generation
├── data/
│   └── mockCustomers.js      # Mock customer data (100 customers)
├── App.jsx                   # Main application orchestrator
└── index.jsx                 # Application entry point
```

### Key Algorithms

1. **K-means Clustering**:
   - Groups customers into geographically close clusters
   - Number of clusters = number of sellers
   - Uses kmeans++ initialization for better results

2. **Convex Hull Calculation**:
   - Creates polygon boundaries around customer clusters
   - Handles edge cases (1-2 customers) with special shapes
   - Falls back to bounding boxes if hull calculation fails

3. **Validation Logic**:
   - Pre-clustering: Ensures sufficient capacity
   - Post-clustering: Validates no territory exceeds customer limits
   - Provides clear error messages for adjustments

## Customization Options

### Adding New Customer Data

Replace the mock data in `src/data/mockCustomers.js`:
```javascript
const mockCustomers = [
  { id: 1, name: 'Customer Name', location: { lat: 37.7749, lng: -122.4194 } },
  // ... more customers
];
```

### Modifying Territory Colors

Edit the color palette in `src/components/MapContainer.jsx`:
```javascript
const territoryColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', // Add more colors
];
```

### Adjusting Clustering Parameters

Modify clustering settings in `src/services/territoryService.js`:
```javascript
const kmeansResult = kmeans(coordinates, numSellers, {
  initialization: 'kmeans++',
  maxIterations: 100,
  tolerance: 1e-6
});
```

## Troubleshooting

### Common Issues

1. **Google Maps not loading**:
   - Verify API key is correct in `.env.local`
   - Check that Maps JavaScript API is enabled
   - Ensure billing is set up in Google Cloud Console

2. **Clustering errors**:
   - Reduce number of sellers or increase max customers
   - Ensure customer data has valid lat/lng coordinates
   - Check browser console for detailed error messages

3. **Performance issues**:
   - Limit customer data to <1000 points for optimal performance
   - Consider using marker clustering for large datasets
   - Reduce polygon complexity for better rendering

### Development Tips

- Use React DevTools for debugging component state
- Check Network tab for Google Maps API call issues
- Monitor console for clustering algorithm warnings
- Test with different parameter combinations

## Future Enhancements

Potential improvements for production use:
- **Advanced Balancing**: Implement territory rebalancing algorithms
- **Custom Constraints**: Add distance limits, demographic balancing
- **Data Import**: CSV/Excel file upload for customer data
- **Export Features**: Save territories as GeoJSON or print maps
- **Performance Optimization**: Marker clustering for large datasets
- **Real-time Updates**: WebSocket integration for live territory updates

## License

This project is licensed under the MIT License.
