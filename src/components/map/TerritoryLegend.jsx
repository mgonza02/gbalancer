import { Clear, ExpandMore, Search } from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Chip,
    Fade,
    IconButton,
    InputAdornment,
    TextField,
    Typography
} from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useMapContext } from '../../contexts/MapContext';

/**
 * Territory Legend Component with Search
 * Implements Single Responsibility Principle for territory legend display
 */
export default function TerritoryLegend({ editMode = false }) {
  const {
    territories,
    filteredTerritories,
    territoryColors,
    activePolygon,
    setActivePolygon,
    searchQuery,
    setSearchQuery,
    mapInstance
  } = useMapContext();

  // Handle search change
  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, [setSearchQuery]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  // Handle territory click from legend
  const handleTerritoryClick = useCallback((territory) => {
    setActivePolygon(territory);

    // Pan to territory centroid
    if (mapInstance && territory.centroid) {
      mapInstance.panTo(territory.centroid);
      mapInstance.setZoom(Math.max(mapInstance.getZoom(), 12));
    }
  }, [setActivePolygon, mapInstance]);

  // Search results summary
  const searchSummary = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const totalTerritories = territories?.length || 0;
    const filteredCount = filteredTerritories?.length || 0;

    return {
      total: totalTerritories,
      filtered: filteredCount,
      hidden: totalTerritories - filteredCount
    };
  }, [territories, filteredTerritories, searchQuery]);

  if (!territories || territories.length === 0) {
    return null;
  }

  return (
    <Fade in={true} timeout={500}>
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 60, sm: 80 },
          right: { xs: 12, sm: 16 },
          zIndex: 10,
          width: { xs: 280, sm: 320 },
          maxHeight: { xs: '60vh', sm: '70vh' },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          overflow: 'hidden'
        }}
      >
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              bgcolor: 'primary.50',
              '& .MuiAccordionSummary-content': {
                alignItems: 'center',
                gap: 1
              }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Territory Legend
            </Typography>
            {searchSummary && (
              <Chip
                label={`${searchSummary.filtered}/${searchSummary.total}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </AccordionSummary>

          <AccordionDetails sx={{ p: 0 }}>
            {/* Search Box */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search territories or customers..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        sx={{ p: 0.5 }}
                      >
                        <Clear fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main'
                    },
                    '&.Mui-focused fieldset': {
                      borderWidth: 2
                    }
                  }
                }}
              />

              {/* Search Results Summary */}
              {searchSummary && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  {searchSummary.filtered === 0
                    ? 'No territories found'
                    : `Showing ${searchSummary.filtered} of ${searchSummary.total} territories`}
                  {searchSummary.hidden > 0 && (
                    <span style={{ color: 'orange' }}>
                      {' '}({searchSummary.hidden} hidden)
                    </span>
                  )}
                </Typography>
              )}
            </Box>

            {/* Territory List */}
            <Box
              sx={{
                maxHeight: { xs: '40vh', sm: '50vh' },
                overflowY: 'auto',
                p: 2
              }}
            >
              {filteredTerritories && filteredTerritories.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {filteredTerritories.map((territory, index) => {
                    const originalIndex = territories.findIndex(t => t.id === territory.id);
                    const colorIndex = originalIndex % territoryColors.length;
                    const color = territoryColors[colorIndex];
                    const isActive = activePolygon?.id === territory.id;

                    return (
                      <Box
                        key={territory.id}
                        onClick={() => handleTerritoryClick(territory)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1.5,
                          bgcolor: isActive ? 'primary.50' : 'transparent',
                          borderRadius: 1,
                          border: isActive ? 1 : 0,
                          borderColor: isActive ? 'primary.main' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: isActive ? 'primary.100' : 'action.hover',
                            transform: 'translateX(2px)'
                          }
                        }}
                      >
                        {/* Color Indicator */}
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: 1,
                            bgcolor: color,
                            border: '2px solid white',
                            boxShadow: 1,
                            flexShrink: 0
                          }}
                        />

                        {/* Territory Info */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isActive ? 600 : 500,
                              color: isActive ? 'primary.main' : 'text.primary'
                            }}
                          >
                            Territory {territory.id}
                            {territory.name && (
                              <span style={{ color: 'text.secondary' }}>
                                {' - '}{territory.name}
                              </span>
                            )}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {territory.customerCount} customers
                            {territory.totalSales && (
                              <span> • ${territory.totalSales.toLocaleString()}</span>
                            )}
                          </Typography>
                        </Box>

                        {/* Edit Mode Indicator */}
                        {editMode && isActive && (
                          <Chip
                            label="EDIT"
                            size="small"
                            color="warning"
                            variant="filled"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              '& .MuiChip-label': {
                                px: 1
                              }
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4,
                    color: 'text.secondary'
                  }}
                >
                  <Search sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2" align="center">
                    {searchQuery.trim()
                      ? `No territories found matching "${searchQuery}"`
                      : 'No territories to display'}
                  </Typography>
                  {searchQuery.trim() && (
                    <Typography variant="caption" align="center" sx={{ mt: 1 }}>
                      Try searching by territory ID, name, or customer name
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Fade>
  );
}
