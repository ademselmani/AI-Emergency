import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  CircularProgress, 
  Paper, 
  Typography, 
  useTheme,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Modern styled components
const ForecastContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '24px',
  background: 'linear-gradient(145deg, #ffffff, #f5f7fa)',
  boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
  margin: theme.spacing(3, 0),
  overflow: 'hidden',
  position: 'relative',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
  }
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #3f51b5, #2196f3)',
  color: theme.palette.common.white,
  boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.12)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 10px 24px rgba(0, 0, 0, 0.16)'
  }
}));

const ChartContainer = styled('div')(({ theme }) => ({
  height: '450px',
  marginTop: theme.spacing(4),
  background: theme.palette.background.paper,
  borderRadius: '16px',
  padding: theme.spacing(3),
  boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.05)'
}));

const StyledTable = styled(Table)(({ theme }) => ({
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
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
      color: theme.palette.text.primary
    }
  },
  '& .MuiTableRow-root': {
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  }
}));

const COLORS = ['#c2f1f0', '#f9b3b3', '#00bcd4', '#f7c2ad', '#f3f5c3', '#e91e63', '#9c27b0'];

const LeaveForecast = () => {
  const theme = useTheme();
  const [forecast, setForecast] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        // Simulate API delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 800));
        const response = await axios.get('http://localhost:5001/forecast');
        setForecast(response.data);
      } catch (error) {
        console.error('Error fetching forecast data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  const prepareChartData = () => {
    return Object.entries(forecast).map(([month, count]) => ({
      name: month,
      leaves: count,
    }));
  };

  const calculateYearlyTotal = () => {
    return Object.values(forecast).reduce((sum, count) => sum + count, 0);
  };

  const handleMouseEnter = (_, index) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '60vh'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <CircularProgress thickness={4} size={60} />
        </motion.div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const yearlyTotal = calculateYearlyTotal();

  return (
    <Fade in timeout={500}>
      <ForecastContainer>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 4
          }}
        >
          Annual Leave Forecast
          <Typography 
            variant="subtitle1" 
            component="div" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 400
            }}
          >
            Overview of planned leaves across the year
          </Typography>
        </Typography>
        
        {Object.keys(forecast).length === 0 ? (
          <Typography variant="body1">No forecast data available.</Typography>
        ) : (
          <>
            <Zoom in timeout={600}>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <SummaryCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Total Leaves
                      </Typography>
                      <Typography variant="h2" component="div">
                        {yearlyTotal}
                      </Typography>
                      <Typography variant="body2">
                        Across all months
                      </Typography>
                    </CardContent>
                  </SummaryCard>
                </Grid>
                <Grid item xs={12} md={4}>
                  <SummaryCard sx={{ background: 'linear-gradient(135deg, #673ab7, #9c27b0)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Peak Month
                      </Typography>
                      <Typography variant="h4" component="div">
                        {Object.entries(forecast).reduce((a, b) => a[1] > b[1] ? a : b)[0]}
                      </Typography>
                      <Typography variant="body2">
                        Highest leave concentration
                      </Typography>
                    </CardContent>
                  </SummaryCard>
                </Grid>
                <Grid item xs={12} md={4}>
                  <SummaryCard sx={{ background: 'linear-gradient(135deg, #ff9800, #f44336)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Avg. Monthly
                      </Typography>
                      <Typography variant="h4" component="div">
                        {Math.round(yearlyTotal / 12)}
                      </Typography>
                      <Typography variant="body2">
                        Average leaves per month
                      </Typography>
                    </CardContent>
                  </SummaryCard>
                </Grid>
              </Grid>
            </Zoom>

            <Slide direction="up" in timeout={800}>
              <div>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  Monthly Distribution
                </Typography>
                
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke={theme.palette.divider}
                      />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: theme.palette.text.secondary }}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fill: theme.palette.text.secondary }}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          borderRadius: '12px',
                          boxShadow: theme.shadows[4],
                          border: 'none',
                          background: theme.palette.background.paper
                        }}
                      />
                      <Bar 
                        dataKey="leaves" 
                        radius={[8, 8, 0, 0]}
                        animationDuration={1500}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>

                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600,
                    mt: 6,
                    mb: 3
                  }}
                >
                  Detailed Monthly Forecast
                </Typography>
                
                <TableContainer component={Paper} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                  <StyledTable>
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell align="right">Planned Leaves</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                        <TableCell align="right">Trend</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(forecast).map(([month, count], index) => (
                        <motion.tr
                          key={month}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <TableCell>{month}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                          <TableCell align="right">
                            {yearlyTotal > 0 ? `${Math.round((count / yearlyTotal) * 100)}%` : '0%'}
                          </TableCell>
                          <TableCell align="right">
                            <div style={{
                              width: '100%',
                              height: '8px',
                              background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]} ${Math.min(100, (count / Math.max(...Object.values(forecast))) * 100)}%, ${theme.palette.grey[200]} 0%)`,
                              borderRadius: '4px'
                            }} />
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </StyledTable>
                </TableContainer>
              </div>
            </Slide>
          </>
        )}
      </ForecastContainer>
    </Fade>
  );
};

export default LeaveForecast;