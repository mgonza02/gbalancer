#!/bin/bash

# Verification script for the customer data source selection feature

echo "=== GBalancer Customer Data Source Feature Verification ==="
echo ""

# Check if all required files exist
echo "1. Checking required files..."

files=(
  "src/components/DataSourceSelector.jsx"
  "src/services/customerDataService.js"
  "src/pages/Dashboard.jsx"
  "sample-customer-data.json"
  "DATA_SOURCE_FEATURE.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file exists"
  else
    echo "✗ $file missing"
  fi
done

echo ""
echo "2. Checking component structure..."

# Check if DataSourceSelector component has the key functions
if grep -q "DataSourceSelector" src/components/DataSourceSelector.jsx; then
  echo "✓ DataSourceSelector component defined"
else
  echo "✗ DataSourceSelector component not found"
fi

if grep -q "handleSampleDataLoad" src/components/DataSourceSelector.jsx; then
  echo "✓ Sample data loading function found"
else
  echo "✗ Sample data loading function not found"
fi

if grep -q "handleFileUpload" src/components/DataSourceSelector.jsx; then
  echo "✓ File upload function found"
else
  echo "✗ File upload function not found"
fi

if grep -q "handleApiDataFetch" src/components/DataSourceSelector.jsx; then
  echo "✓ API data fetch function found"
else
  echo "✗ API data fetch function not found"
fi

echo ""
echo "3. Checking service functions..."

# Check if customerDataService has the key functions
if grep -q "saveCustomerData" src/services/customerDataService.js; then
  echo "✓ Save customer data function found"
else
  echo "✗ Save customer data function not found"
fi

if grep -q "loadCustomerData" src/services/customerDataService.js; then
  echo "✓ Load customer data function found"
else
  echo "✗ Load customer data function not found"
fi

if grep -q "validateCustomerData" src/services/customerDataService.js; then
  echo "✓ Validate customer data function found"
else
  echo "✗ Validate customer data function not found"
fi

echo ""
echo "4. Checking Dashboard integration..."

# Check if Dashboard has been updated
if grep -q "DataSourceSelector" src/pages/Dashboard.jsx; then
  echo "✓ DataSourceSelector integrated into Dashboard"
else
  echo "✗ DataSourceSelector not integrated into Dashboard"
fi

if grep -q "handleCustomerDataLoad" src/pages/Dashboard.jsx; then
  echo "✓ Customer data load handler found"
else
  echo "✗ Customer data load handler not found"
fi

if grep -q "customerDataLoaded" src/pages/Dashboard.jsx; then
  echo "✓ Customer data loaded state found"
else
  echo "✗ Customer data loaded state not found"
fi

echo ""
echo "5. Checking sample data file..."

# Check if sample JSON file is valid
if [ -f "sample-customer-data.json" ]; then
  if node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('sample-customer-data.json', 'utf8'));
    if (Array.isArray(data) && data.length > 0) {
      console.log('✓ Sample JSON file is valid with ' + data.length + ' customers');
    } else {
      console.log('✗ Sample JSON file is invalid');
    }
  " 2>/dev/null; then
    true
  else
    echo "✗ Sample JSON file parsing failed"
  fi
else
  echo "✗ Sample JSON file not found"
fi

echo ""
echo "6. Checking documentation..."

if [ -f "DATA_SOURCE_FEATURE.md" ]; then
  echo "✓ Feature documentation exists"
else
  echo "✗ Feature documentation missing"
fi

if grep -q "Customer Data Source Selection" README.md; then
  echo "✓ README updated with new feature"
else
  echo "✗ README not updated"
fi

echo ""
echo "=== Verification Complete ==="
echo ""
echo "If all items show ✓, the feature is ready to use!"
echo "To test the feature:"
echo "1. Start the development server: npm start"
echo "2. Navigate to the dashboard"
echo "3. Use the 'Customer Data Source' section to load data"
echo "4. Test all three options: Sample Data, Upload JSON, and From API"
