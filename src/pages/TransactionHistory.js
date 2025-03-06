import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { format } from "date-fns";
import { transactionApi } from "../services/api";

// transaction history page component with filtering options
const TransactionHistory = () => {
  // state management
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch transactions function
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionApi.getAll();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // fetch transactions on component mount and filter changes
  useEffect(() => {
    fetchTransactions();
  }, []);

  const getTransactionColor = (type) => {
    switch (type) {
      case "SALE":
        return "error";
      case "ADD":
        return "success";
      case "EDIT":
        return "warning";
      case "DELETE":
        return "error";
      default:
        return "default";
    }
  };

  const renderTransactionDetails = (transaction) => {
    switch (transaction.type) {
      case "SALE":
        return (
          <>
            <Typography variant="body2">
              Sold {transaction.quantity} units of {transaction.product.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Remaining Stock: {transaction.remainingQuantity} | Backup:{" "}
              {transaction.backupQuantity}
            </Typography>
          </>
        );
      case "ADD":
        return (
          <Typography variant="body2">
            Added {transaction.quantity} units of {transaction.product.name}
          </Typography>
        );
      case "EDIT":
        return (
          <Box>
            <Typography variant="body2">
              Updated {transaction.product.name}:
            </Typography>
            {Object.entries(transaction.newData).map(([key, value], index) => {
              const oldValue = transaction.previousData[key];
              if (oldValue !== value) {
                return (
                  <Typography key={index} variant="body2" color="textSecondary">
                    {key}: {oldValue} → {value}
                  </Typography>
                );
              }
              return null;
            })}
          </Box>
        );
      case "DELETE":
        return (
          <Typography variant="body2">
            Deleted product: {transaction.product.name}
          </Typography>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Date & Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>
                    <Chip
                      label={transaction.type}
                      color={getTransactionColor(transaction.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{renderTransactionDetails(transaction)}</TableCell>
                  <TableCell>{transaction.employee.name}</TableCell>
                  <TableCell>
                    {format(
                      new Date(transaction.date),
                      "MMM dd, yyyy HH:mm:ss"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default TransactionHistory;
