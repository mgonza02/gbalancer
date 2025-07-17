# Customer Data Source Selection Feature

This document describes the new customer data source selection functionality that allows users to choose from different data sources for their customer data.

## Features

### 1. Data Source Selection UI
- **Location**: Dashboard sidebar, above the territory controls
- **Options**:
  - Sample Data
  - Upload JSON File
  - From API
- **Interactive**: Dropdown selector with icons for each option

### 2. Sample Data Option
- **Description**: Loads pre-configured sample customer data
- **Action**: Click "Load Sample Data" button
- **Source**: Uses existing `handleMakeCustomers()` function
- **Data**: Processes and validates dummy customer data from `dummy-customers.js`

### 3. Upload JSON File Option
- **Description**: Allows users to upload a JSON file with customer data
- **File Requirements**:
  - Must be a `.json` file
  - File size limit: 5MB
  - Must contain array of customer objects
- **Validation**: Checks for required fields (id, customer_name/name, lat, lng, sales)
- **Error Handling**: Shows specific error messages for validation failures

### 4. From API Option
- **Description**: Fetches customer data from a REST API endpoint
- **Fields**:
  - API Endpoint (required): URL to fetch data from
  - Bearer Token (optional): Authentication token
- **Headers**: Automatically includes `Authorization: Bearer <token>` if provided
- **Validation**: Same validation as file upload
- **Error Handling**: Shows HTTP status codes and error messages

### 5. Data Persistence
- **Storage**: All customer data is automatically saved to browser's localStorage
- **Key**: `customerData`
- **Auto-load**: Application checks localStorage on startup and loads existing data
- **Persistence**: Data persists across browser sessions

### 6. Data Management
- **Normalization**: All data is normalized to consistent structure
- **Validation**: Comprehensive validation of required fields
- **Statistics**: Calculates data statistics (total customers, sales, etc.)
- **Error Handling**: Graceful error handling with user-friendly messages

## Required JSON Structure

Customer objects must have the following structure:

```json
{
  "id": "unique_identifier",
  "customer_name": "Customer Name", // or "name"
  "document_number": "optional_document_number",
  "lat": "latitude_as_string",
  "lng": "longitude_as_string",
  "sales": "sales_amount_as_number"
}
```

## Example JSON File

```json
[
  {
    "id": 1,
    "customer_name": "Sample Customer 1",
    "document_number": "12345678",
    "lat": "-16.408155",
    "lng": "-71.474054",
    "sales": 183.55
  },
  {
    "id": 2,
    "customer_name": "Sample Customer 2",
    "document_number": "87654321",
    "lat": "-16.392622",
    "lng": "-71.479856",
    "sales": 187.73
  }
]
```

## API Endpoint Requirements

Your API endpoint should:
- Accept GET requests
- Return JSON array of customer objects
- Support optional Bearer token authentication
- Follow the same structure as JSON file uploads

Example API response:
```json
[
  {
    "id": 1,
    "customer_name": "API Customer 1",
    "lat": "-16.408155",
    "lng": "-71.474054",
    "sales": 183.55
  }
]
```

## Files Modified/Created

### New Files:
- `src/components/DataSourceSelector.jsx` - Main UI component for data source selection
- `src/services/customerDataService.js` - Service for localStorage operations
- `sample-customer-data.json` - Sample JSON file for testing
- `src/test/customerDataService.test.js` - Test file for service functions

### Modified Files:
- `src/pages/Dashboard.jsx` - Integrated data source selector
- `src/components/Controls.jsx` - Updated to handle data loading states
- `src/data/mockCustomers.js` - Updated to save data to localStorage

## Usage Instructions

1. **Access the Dashboard**: Navigate to the main dashboard page
2. **Select Data Source**: Use the dropdown in the "Customer Data Source" section
3. **Load Data**:
   - **Sample Data**: Click "Load Sample Data"
   - **Upload JSON**: Click "Choose JSON File" and select your file
   - **From API**: Enter endpoint URL and optional token, then click "Fetch Data"
4. **Generate Territories**: Once data is loaded, use the territory controls as usual
5. **Data Persistence**: Your data will be automatically saved and reloaded on future visits

## Error Handling

The system provides clear error messages for:
- Invalid file formats
- File size limits exceeded
- Missing required fields
- Invalid coordinate values
- API connection failures
- Authentication errors
- Data parsing errors

## Technical Implementation

### Data Flow:
1. User selects data source
2. Data is loaded and validated
3. Data is normalized to consistent structure
4. Data is saved to localStorage
5. Dashboard updates with new customer data
6. Territory generation uses the loaded data

### State Management:
- `customers`: Array of customer objects
- `dataSource`: Current data source type
- `customerDataLoaded`: Boolean flag for data loading state
- `loading`: Loading state for async operations
- `error`: Error messages for user feedback

This implementation ensures a seamless user experience while maintaining data integrity and providing robust error handling.
