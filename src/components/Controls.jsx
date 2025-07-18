import { TrendingUp } from '@mui/icons-material';
import { Alert, Card, CardContent, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';

// Custom hooks
import { useControls, useControlsInput } from '../hooks/useControls';

// Modular components
import ActionButtons from './territory/ActionButtons';
import BasicSettingsSection from './territory/BasicSettingsSection';
import CapacityAnalysis from './territory/CapacityAnalysis';
import CustomerDistributionSection from './territory/CustomerDistributionSection';
import SalesTargetsSection from './territory/SalesTargetsSection';
import TerritoryConstraintsSection from './territory/TerritoryConstraintsSection';
import TerritorySummary from './territory/TerritorySummary';

// Dialogs
import SaveBalanceDialog from './SaveBalanceDialog';

/**
 * Refactored Controls Component
 * Implements SOLID principles:
 * - Single Responsibility: Each section has one clear purpose
 * - Open/Closed: Extensible through props and composition
 * - Liskov Substitution: All sections follow consistent interfaces
 * - Interface Segregation: Small, focused component interfaces
 * - Dependency Inversion: Depends on abstractions (hooks, contexts)
 */
const Controls = ({
  controls,
  onControlsChange,
  onGenerateTerritories,
  error,
  territories = [],
  customers = [],
  loading = false,
  customerDataLoaded = true
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // Custom hooks for business logic separation
  const { handleInputChange } = useControlsInput(controls, onControlsChange);
  const { metrics, validation, currencySymbol } = useControls(controls, customers);

  const handleSaveClick = () => {
    setSaveDialogOpen(true);
  };

  return (
    <Card sx={{
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid',
      borderColor: 'divider',
      height: 'fit-content'
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant='h5' gutterBottom sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontWeight: 600,
          color: 'primary.main',
          mb: 3,
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}>
          <TrendingUp />
          Territory Configuration
        </Typography>

        {/* Configuration Sections */}
        <BasicSettingsSection
          controls={controls}
          onInputChange={handleInputChange}
        />

        <TerritoryConstraintsSection
          controls={controls}
          onInputChange={handleInputChange}
        />

        <CustomerDistributionSection
          controls={controls}
          onInputChange={handleInputChange}
        />

        <SalesTargetsSection
          controls={controls}
          onInputChange={handleInputChange}
        />        {/* Capacity Analysis */}
        <CapacityAnalysis
          metrics={metrics}
          validation={validation}
          currencySymbol={currencySymbol}
        />

        {/* Action Buttons */}
        <ActionButtons
          territories={territories}
          onSaveClick={handleSaveClick}
          isValid={validation.isValid}
          onGenerateClick={onGenerateTerritories}
          loading={loading}
          customerDataLoaded={customerDataLoaded}
          customers={customers}
        />

        {/* Error Display */}
        {error && (
          <Alert
            severity='error'
            sx={{
              mb: 3,
              borderRadius: 3,
              fontSize: { xs: '0.85rem', sm: '0.875rem' },
              '& .MuiAlert-message': {
                fontWeight: 500
              },
              '& .MuiAlert-icon': {
                fontSize: { xs: '1.2rem', sm: '1.5rem' }
              }
            }}
          >
            {error}
          </Alert>
        )}

        {/* Territory Summary */}
        <TerritorySummary
          territories={territories}
          controls={controls}
          currencySymbol={currencySymbol}
        />
      </CardContent>

      {/* Save Balance Dialog */}
      <SaveBalanceDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        customers={customers}
        territories={territories}
        controls={controls}
      />
    </Card>
  );
};

Controls.propTypes = {
  controls: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  onGenerateTerritories: PropTypes.func.isRequired,
  error: PropTypes.string,
  territories: PropTypes.array,
  customers: PropTypes.array,
  loading: PropTypes.bool,
  customerDataLoaded: PropTypes.bool
};

export default Controls;
