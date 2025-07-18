import { ErrorOutline, Home, Refresh } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { Component } from 'react';

/**
 * Enhanced Error Boundary Component
 * Implements proper error handling following React best practices
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });

    // Log to external service if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: true
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          p: 3,
          bgcolor: 'background.default'
        }}>
          <Card sx={{
            maxWidth: 600,
            textAlign: 'center',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <ErrorOutline sx={{
                fontSize: 72,
                color: 'error.main',
                mb: 3,
                animation: 'pulse 2s infinite'
              }} />

              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                Oops! Something went wrong
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
                We encountered an unexpected error. Don't worry, our team has been notified.
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                  <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                    {this.state.error.toString()}
                  </Typography>
                </Alert>
              )}

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleRetry}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600
                  }}
                >
                  Try Again
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={this.handleGoHome}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600
                  }}
                >
                  Go Home
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
