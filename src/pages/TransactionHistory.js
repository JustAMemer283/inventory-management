import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { transactionApi } from "../services/api";

// transaction history page component with filtering options
const TransactionHistory = () => {
  // state management
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    employee: "",
    product: "",
    startDate: null,
    endDate: null,
  });

  // fetch transactions function
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transactionApi.getAll(filters);
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // fetch transactions on component mount and filter changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // handle filter change
  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
  };

  // handle date change
  const handleDateChange = (field) => (date) => {
    setFilters({
      ...filters,
      [field]: date,
    });
  };

  // handle reset filters
  const handleResetFilters = () => {
    setFilters({
      employee: "",
      product: "",
      startDate: null,
      endDate: null,
    });
  };

  // render loading state
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Transaction History
          </Typography>

          {/* error alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Employee</InputLabel>
                    <Select
                      value={filters.employee}
                      label="Employee"
                      onChange={handleFilterChange("employee")}
                    >
                      <MenuItem value="">All</MenuItem>
                      {/* Add employee options here */}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Product</InputLabel>
                    <Select
                      value={filters.product}
                      label="Product"
                      onChange={handleFilterChange("product")}
                    >
                      <MenuItem value="">All</MenuItem>
                      {/* Add product options here */}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Start Date"
                    value={filters.startDate}
                    onChange={handleDateChange("startDate")}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date"
                    value={filters.endDate}
                    onChange={handleDateChange("endDate")}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    onClick={handleResetFilters}
                    sx={{ mr: 2 }}
                  >
                    Reset Filters
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* transactions list */}
          <Grid container spacing={3}>
            {transactions.map((transaction) => (
              <Grid item xs={12} key={transaction._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {transaction.product.name}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Sold by: {transaction.employee.name}
                    </Typography>
                    <Typography variant="body2">
                      Quantity: {transaction.quantity}
                    </Typography>
                    <Typography variant="body2">
                      Date: {new Date(transaction.timestamp).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default TransactionHistory;
