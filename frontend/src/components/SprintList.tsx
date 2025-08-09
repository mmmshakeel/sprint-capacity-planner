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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Edit, Add, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Sprint, SprintListResponse } from '../types';
import { sprintApi } from '../services/api';
import { useTeam } from '../contexts/TeamContext';

const SprintList = () => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null);
  const navigate = useNavigate();
  const { selectedTeam } = useTeam();

  const fetchSprints = async (pageNum: number, limit: number) => {
    try {
      setLoading(true);
      const response: SprintListResponse = await sprintApi.getAllSprints(pageNum + 1, limit, selectedTeam?.id);
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
  }, [page, rowsPerPage, selectedTeam]);

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

  const handleDeleteClick = (sprint: Sprint, event: React.MouseEvent) => {
    event.stopPropagation();
    setSprintToDelete(sprint);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sprintToDelete) return;

    try {
      await sprintApi.deleteSprint(sprintToDelete.id);
      setDeleteDialogOpen(false);
      setSprintToDelete(null);
      fetchSprints(page, rowsPerPage);
    } catch (err) {
      setError('Failed to delete sprint');
      console.error('Error deleting sprint:', err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSprintToDelete(null);
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
        <Box>
          <Typography variant="h4" component="h1">
            Sprint List
          </Typography>
          {selectedTeam && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {selectedTeam.name}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleNewSprint}
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
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteClick(sprint, e)}
                    >
                      <Delete />
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

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Sprint
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the sprint "{sprintToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SprintList;