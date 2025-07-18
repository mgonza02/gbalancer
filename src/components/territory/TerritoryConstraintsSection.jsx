import { Business } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Territory Constraints Configuration Component
 * Implements Single Responsibility Principle
 */
export default function TerritoryConstraintsSection({ controls, onInputChange }) {
  return (
    <Accordion sx={{ mb: 2, boxShadow: 'none', border: 1, borderColor: 'divider' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          bgcolor: 'info.50',
          '&:hover': { bgcolor: 'info.100' }
        }}
      >
        <Typography variant='h6' sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: { xs: '1rem', sm: '1.1rem' },
          fontWeight: 600
        }}>
          <Business />
          Territory Constraints
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 2 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: { xs: 2, sm: 3 }
        }}>
          <TextField
            label='Territory Size'
            type='number'
            value={controls.territorySize || ''}
            onChange={e => onInputChange('territorySize', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: 1000 }}
            fullWidth
            size='small'
            helperText='Territory size parameter'
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: 'primary.main' },
                '&.Mui-focused fieldset': { borderWidth: 2 }
              }
            }}
          />

          <TextField
            label='Max Territories'
            type='number'
            value={controls.maxTerritories || ''}
            onChange={e => onInputChange('maxTerritories', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: 50 }}
            fullWidth
            size='small'
            helperText='Maximum number of territories allowed'
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

TerritoryConstraintsSection.propTypes = {
  controls: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired
};
