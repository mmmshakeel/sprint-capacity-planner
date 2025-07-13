import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import { Edit, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Sprint, SprintListResponse } from '../types';
import { sprintApi } from '../services/api';

const SprintList = () => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const fetchSprints = async (pageNum: number, limit: number) => {
    try {
      setLoading(true);
      const response: SprintListResponse = await sprintApi.getAllSprints(pageNum + 1, limit);
      setSprints(response?.sprints || []);
      setTotalCount(response?.total || 0);
      setError(null);
    } catch (err) {
      setError('Failed to fetch sprints');
      console.error('Error fetching sprints:', err);
      setSprints([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSprints(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (sprintId: number) => {
    navigate(`/sprints/${sprintId}`);
  };

  const handleNewSprint = () => {
    navigate('/sprints/new');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusChip = (sprint: Sprint) => {
    const now = new Date();
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);

    if (now < startDate) {
      return <Chip label="Planned" color="default" size="small" />;
    } else if (now >= startDate && now <= endDate) {
      return <Chip label="Active" color="primary" size="small" />;
    } else {
      return <Chip label="Completed" color="success" size="small" />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Sprint List
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleNewSprint}
          sx={{ borderRadius: 2 }}
        >
          New Sprint
        </Button>
      </Box>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Sprint Name</strong></TableCell>
                <TableCell><strong>Start Date</strong></TableCell>
                <TableCell><strong>End Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Capacity</strong></TableCell>
                <TableCell><strong>Projected Velocity</strong></TableCell>
                <TableCell><strong>Completed Velocity</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(sprints || []).map((sprint) => (
                <TableRow
                  key={sprint.id}
                  hover
                  onClick={() => handleRowClick(sprint.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {sprint.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(sprint.startDate)}</TableCell>
                  <TableCell>{formatDate(sprint.endDate)}</TableCell>
                  <TableCell>{getStatusChip(sprint)}</TableCell>
                  <TableCell>{sprint.capacity}</TableCell>
                  <TableCell>{sprint.projectedVelocity}</TableCell>
                  <TableCell>{sprint.completedVelocity}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(sprint.id);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default SprintList;