import { AttachMoney } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Sales Targets Configuration Component
 * Implements Single Responsibility Principle
 */
export default function SalesTargetsSection({ controls, onInputChange }) {
  return (
    <Accordion sx={{ mb: 3, boxShadow: 'none', border: 1, borderColor: 'divider' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          bgcolor: 'warning.50',
          '&:hover': { bgcolor: 'warning.100' }
        }}
      >
        <Typography variant='h6' sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: { xs: '1rem', sm: '1.1rem' },
          fontWeight: 600
        }}>
          <AttachMoney />
          Sales Targets
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 2 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: { xs: 2, sm: 3 }
        }}>
          <TextField
            label='Max Sales per Territory'
            type='number'
            value={controls.maxSalesPerTerritory || ''}
            onChange={e => onInputChange('maxSalesPerTerritory', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1000, max: 100000 }}
            fullWidth
            size='small'
            helperText='Maximum sales target per territory'
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: 'primary.main' },
                '&.Mui-focused fieldset': { borderWidth: 2 }
              }
            }}
          />

          <TextField
            label='Min Sales per Territory'
            type='number'
            value={controls.minSalesPerTerritory || ''}
            onChange={e => onInputChange('minSalesPerTerritory', parseInt(e.target.value) || 0)}
            inputProps={{ min: 0, max: 100000 }}
            fullWidth
            size='small'
            helperText='Minimum sales target per territory (0 = no minimum)'
            error={controls.minSalesPerTerritory > controls.maxSalesPerTerritory}
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

SalesTargetsSection.propTypes = {
  controls: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired
};
