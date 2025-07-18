import { Box, CircularProgress, Fade, Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Enhanced Loading Spinner Component
 * Implements consistent loading states with animations
 */
export default function LoadingSpinner({
  message = 'Loading...',
  size = 40,
  minHeight = '200px',
  variant = 'indeterminate',
  value = 0,
  showProgress = false
}) {
  return (
    <Fade in timeout={300}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 2,
        p: 3
      }}>
        <CircularProgress
          size={size}
          variant={variant}
          value={value}
          sx={{
            color: 'primary.main',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }}
        />
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            textAlign: 'center',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            fontWeight: 500
          }}
        >
          {message}
        </Typography>
        {showProgress && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            {Math.round(value)}%
          </Typography>
        )}
      </Box>
    </Fade>
  );
}

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.number,
  minHeight: PropTypes.string,
  variant: PropTypes.oneOf(['determinate', 'indeterminate']),
  value: PropTypes.number,
  showProgress: PropTypes.bool
};
