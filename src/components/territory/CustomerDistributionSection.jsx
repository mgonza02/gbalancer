import { People } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Customer Distribution Configuration Component
 * Implements Single Responsibility Principle
 */
export default function CustomerDistributionSection({ controls, onInputChange }) {
  return (
    <Accordion sx={{ mb: 2, boxShadow: 'none', border: 1, borderColor: 'divider' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          bgcolor: 'success.50',
          '&:hover': { bgcolor: 'success.100' }
        }}
      >
        <Typography variant='h6' sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: { xs: '1rem', sm: '1.1rem' },
          fontWeight: 600
        }}>
          <People />
          Customer Distribution
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 2 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: { xs: 2, sm: 3 }
        }}>
          <TextField
            label='Max Customers per Territory'
            type='number'
            value={controls.maxCustomersPerPolygon || ''}
            onChange={e => onInputChange('maxCustomersPerPolygon', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: 100 }}
            fullWidth
            size='small'
            helperText='Maximum customers any single seller should handle'
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: 'primary.main' },
                '&.Mui-focused fieldset': { borderWidth: 2 }
              }
            }}
          />

          <TextField
            label='Min Customers per Territory'
            type='number'
            value={controls.minCustomersPerPolygon || ''}
            onChange={e => onInputChange('minCustomersPerPolygon', parseInt(e.target.value) || 0)}
            inputProps={{ min: 0, max: 100 }}
            fullWidth
            size='small'
            helperText='Minimum customers per territory (0 = no minimum)'
            error={controls.minCustomersPerPolygon > controls.maxCustomersPerPolygon}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: 'primary.main' },
                '&.Mui-focused fieldset': { borderWidth: 2 }
              }
            }}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

CustomerDistributionSection.propTypes = {
  controls: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired
};
