import { Assessment, History, PlayArrow, Save } from '@mui/icons-material';
import { Button, CircularProgress, Stack, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

/**
 * Enhanced Action Buttons Component
 * Implements Single Responsibility Principle for action handling
 */
export default function ActionButtons({
  territories,
  onSaveClick,
  isValid,
  onGenerateClick,
  loading,
  customerDataLoaded,
  customers
}) {
  const navigate = useNavigate();

  const getGenerateButtonText = () => {
    if (loading) return 'Generating Territories...';
    if (!customerDataLoaded) return 'Load Customer Data First';
    if (customers.length === 0) return 'No Customer Data Available';
    return 'Generate Territories';
  };

  const getGenerateButtonIcon = () => {
    if (loading) return <CircularProgress size={20} sx={{ color: 'white' }} />;
    return <PlayArrow />;
  };

  return (
    <>
      {/* Generate Button */}
      <Tooltip
        title={!isValid ? "Please fix configuration errors before generating" : "Generate territory assignments"}
        arrow
      >
        <span>
          <Button
            variant='contained'
            onClick={onGenerateClick}
            disabled={!isValid || loading || !customerDataLoaded || customers.length === 0}
            fullWidth
            size='large'
            startIcon={getGenerateButtonIcon()}
            sx={{
              mb: 3,
              py: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                transform: 'translateY(-2px)',
                background: 'linear-gradient(45deg, #1565c0 30%, #2196f3 90%)'
              },
              '&:disabled': {
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transform: 'none'
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            {getGenerateButtonText()}
          </Button>
        </span>
      </Tooltip>

      {/* Action Buttons */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Tooltip title="Save current territory configuration" arrow>
          <span>
            <Button
              variant='outlined'
              startIcon={<Save />}
              onClick={onSaveClick}
              disabled={!territories || territories.length === 0}
              fullWidth
              size='large'
              sx={{
                py: { xs: 1.2, sm: 1.5 },
                borderRadius: 3,
                fontWeight: 500,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                borderWidth: 2,
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderWidth: 2
                },
                '&:disabled': {
                  transform: 'none'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Save Balance
            </Button>
          </span>
        </Tooltip>

        <Tooltip title="View territory history and saved configurations" arrow>
          <Button
            variant='outlined'
            startIcon={<History />}
            onClick={() => navigate('/history')}
            fullWidth
            size='large'
            sx={{
              py: { xs: 1.2, sm: 1.5 },
              borderRadius: 3,
              fontWeight: 500,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              borderWidth: 2,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderWidth: 2
              },
              '&:disabled': {
                transform: 'none'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            History
          </Button>
        </Tooltip>

        <Tooltip title="View analytics and territory performance" arrow>
          <Button
            variant='outlined'
            startIcon={<Assessment />}
            onClick={() => navigate('/analytics')}
            fullWidth
            size='large'
            sx={{
              py: { xs: 1.2, sm: 1.5 },
              borderRadius: 3,
              fontWeight: 500,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              borderWidth: 2,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderWidth: 2
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Analytics
          </Button>
        </Tooltip>
      </Stack>
    </>
  );
}

ActionButtons.propTypes = {
  territories: PropTypes.array,
  onSaveClick: PropTypes.func.isRequired,
  isValid: PropTypes.bool.isRequired,
  onGenerateClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  customerDataLoaded: PropTypes.bool,
  customers: PropTypes.array
};
