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
    startDate: "",
    endDate: "",
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

  // handle reset filters
  const handleResetFilters = () => {
    setFilters({
      employee: "",
      product: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Transaction History
        </Typography>

        {/* filters */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={filters.employee}
                    onChange={handleFilterChange("employee")}
                    label="Employee"
                  >
                    <MenuItem value="">All</MenuItem>
                    {/* Add employee options here */}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={filters.product}
                    onChange={handleFilterChange("product")}
                    label="Product"
                  >
                    <MenuItem value="">All</MenuItem>
                    {/* Add product options here */}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={filters.startDate}
                  onChange={handleFilterChange("startDate")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={filters.endDate}
                  onChange={handleFilterChange("endDate")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                  sx={{ mt: 2 }}
                >
                  Reset Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* error alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* loading state */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          /* transactions list */
          <Grid container spacing={2}>
            {transactions.map((transaction) => (
              <Grid item xs={12} key={transaction._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      {transaction.product?.name}
                    </Typography>
                    <Typography color="textSecondary">
                      Quantity: {transaction.quantity}
                    </Typography>
                    <Typography color="textSecondary">
                      Employee: {transaction.employee?.name}
                    </Typography>
                    <Typography color="textSecondary">
                      Date: {new Date(transaction.date).toLocaleDateString()}
                    </Typography>
                    {transaction.notes && (
                      <Typography color="textSecondary">
                        Notes: {transaction.notes}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default TransactionHistory;
