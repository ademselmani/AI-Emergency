import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  CircularProgress, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  Avatar,
  Tooltip,
  IconButton,
  Collapse,
  Box
} from '@mui/material';
import { 
  WarningRounded, 
  ExpandMore, 
  ExpandLess,
  Person,
  CalendarToday,
  Event,
  AccessTime
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const AnomalyContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '16px',
  boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.05)',
  background: 'linear-gradient(145deg, #ffffff, #f9fafb)',
  overflow: 'hidden',
  position: 'relative',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #ff5252, #ff1744)',
  }
}));

const SeverityBadge = styled(Chip)(({ severity }) => ({
  fontWeight: 600,
  backgroundColor: severity === 'high' ? '#ffebee' : severity === 'medium' ? '#fff8e1' : '#e8f5e9',
  color: severity === 'high' ? '#d32f2f' : severity === 'medium' ? '#ff8f00' : '#2e7d32',
  borderRadius: '8px',
  padding: '4px 8px'
}));

const StyledTable = styled(Table)(({ theme }) => ({
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:first-of-type': {
      borderRadius: '8px 0 0 8px'
    },
    '&:last-of-type': {
      borderRadius: '0 8px 8px 0'
    }
  },
  '& .MuiTableHead-root': {
    '& .MuiTableCell-root': {
      fontWeight: 600,
      background: theme.palette.grey[50],
      color: theme.palette.text.primary,
      fontSize: '0.875rem'
    }
  },
  '& .MuiTableRow-root': {
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  }
}));

const AnomalyDetails = ({ anomaly }) => {
  return (
    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '8px', mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            <WarningRounded color="error" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Reason
          </Typography>
          <Typography variant="body2">{anomaly.reason || 'Unusual leave pattern detected'}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            <AccessTime color="action" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Duration Impact
          </Typography>
          <Typography variant="body2">
            {anomaly.days > 10 ? 'Significant' : anomaly.days > 5 ? 'Moderate' : 'Minor'} impact
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">
            Recommended Action
          </Typography>
          <Typography variant="body2">
            {anomaly.days > 10 
              ? 'Requires immediate HR review' 
              : 'Needs supervisor approval'}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

const LeaveAnomalie = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        // Simulate API delay for demo
        await new Promise(resolve => setTimeout(resolve, 800));
        const response = await axios.get('http://localhost:5001/anomalies');
        setAnomalies(response.data);
      } catch (error) {
        console.error('Error fetching anomalies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
  }, []);

  const handleExpandRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const getSeverity = (days) => {
    return days > 10 ? 'high' : days > 5 ? 'medium' : 'low';
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '300px'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <CircularProgress thickness={4} size={40} color="error" />
        </motion.div>
      </Box>
    );
  }

  return (
    <AnomalyContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <WarningRounded color="error" sx={{ fontSize: 32, mr: 2 }} />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
          Leave Anomaly Detection
          <Typography variant="body2" color="text.secondary">
            Unusual leave patterns requiring attention
          </Typography>
        </Typography>
      </Box>

      {anomalies.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: '8px'
        }}>
          <Typography variant="h6" color="text.secondary">
            🎉 No anomalies detected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            All leave requests appear normal
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <StyledTable>
            <TableHead>
              <TableRow>
                <TableCell width="10px"></TableCell>
                <TableCell>Employee</TableCell>
                <TableCell align="center">Duration</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Date Range</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell width="50px"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {anomalies.map((anomaly, index) => (
                <React.Fragment key={index}>
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TableCell>
                      <Avatar sx={{ 
                        bgcolor: getSeverity(anomaly.days) === 'high' ? '#ffebee' : 
                                 getSeverity(anomaly.days) === 'medium' ? '#fff8e1' : '#e8f5e9',
                        color: getSeverity(anomaly.days) === 'high' ? '#d32f2f' : 
                                getSeverity(anomaly.days) === 'medium' ? '#ff8f00' : '#2e7d32',
                        width: 32, 
                        height: 32 
                      }}>
                        <Person fontSize="small" />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{anomaly.employee}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {anomaly.role || 'Unknown role'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={`${anomaly.days} days`} 
                        size="small"
                        icon={<AccessTime fontSize="small" />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={anomaly.leaveType} 
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday color="action" fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {new Date(anomaly.startDate).toLocaleDateString()} – {' '}
                          {new Date(anomaly.endDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <SeverityBadge 
                        label={getSeverity(anomaly.days).toUpperCase()} 
                        severity={getSeverity(anomaly.days)}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={expandedRow === index ? 'Hide details' : 'Show details'}>
                        <IconButton size="small" onClick={() => handleExpandRow(index)}>
                          {expandedRow === index ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </motion.tr>
                  <TableRow>
                    <TableCell style={{ padding: 0 }} colSpan={7}>
                      <Collapse in={expandedRow === index} timeout="auto" unmountOnExit>
                        <AnomalyDetails anomaly={anomaly} />
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </StyledTable>
        </TableContainer>
      )}
    </AnomalyContainer>
  );
};

export default LeaveAnomalie;