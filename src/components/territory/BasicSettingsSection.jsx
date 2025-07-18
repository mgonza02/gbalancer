import { Groups } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Basic Settings Configuration Component
 * Implements Single Responsibility Principle
 */
export default function BasicSettingsSection({ controls, onInputChange }) {
  return (
    <Accordion
      defaultExpanded
      sx={{ mb: 2, boxShadow: 'none', border: 1, borderColor: 'divider' }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          bgcolor: 'primary.50',
          '&:hover': { bgcolor: 'primary.100' }
        }}
      >
        <Typography variant='h6' sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: { xs: '1rem', sm: '1.1rem' },
          fontWeight: 600
        }}>
          <Groups />
          Basic Settings
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 2 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: { xs: 2, sm: 3 }
        }}>
          <TextField
            label='Number of Sellers'
            type='number'
            value={controls.numSellers || ''}
            onChange={e => onInputChange('numSellers', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: 20 }}
            fullWidth
            size='small'
            helperText='How many sales territories to create'
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: 'primary.main' },
                '&.Mui-focused fieldset': { borderWidth: 2 }
              }
            }}
          />

          <TextField
            label='Min Territories per Seller'
            type='number'
            value={controls.minTerritoriesPerSeller || ''}
            onChange={e => onInputChange('minTerritoriesPerSeller', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: 20 }}
            fullWidth
            size='small'
            helperText='Minimum territories each seller must handle'
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

BasicSettingsSection.propTypes = {
  controls: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired
};
