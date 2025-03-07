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
import { format, isSameDay } from "date-fns";
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
      case "NEW":
        return "secondary";
      case "ADD":
        return "success";
      case "EDIT":
        return "warning";
      case "DELETE":
        return "error";
      case "TRANSFER":
        return "info";
      default:
        return "default";
    }
  };

  const renderTransactionDetails = (transaction) => {
    // Handle case where product is null (deleted product)
    const productName = transaction.product
      ? `${transaction.product.brand} - ${transaction.product.name}`
      : "Unknown Product";

    switch (transaction.type) {
      case "SALE":
        return (
          <>
            <Typography variant="body2">
              Sold {transaction.quantity} units of {productName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {transaction.notes}
              <br />
              Current Stock: {transaction.remainingQuantity} | Backup:{" "}
              {transaction.backupQuantity}
            </Typography>
          </>
        );
      case "NEW":
        return (
          <>
            <Typography variant="body2">
              Added new product: {productName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Initial values set:
            </Typography>
            {transaction.newData && (
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Stock: {transaction.newData.quantity} units
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Backup: {transaction.newData.backupQuantity} units
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Price: ${transaction.newData.price}
                </Typography>
              </Box>
            )}
          </>
        );
      case "ADD":
        return (
          <>
            <Typography variant="body2">
              Stock update for {productName}
            </Typography>
            {transaction.previousData && transaction.newData && (
              <Typography variant="body2" color="textSecondary">
                {transaction.previousData.quantity !==
                  transaction.newData.quantity &&
                  `Stock: ${transaction.previousData.quantity} → ${transaction.newData.quantity}`}
                {transaction.previousData.quantity !==
                  transaction.newData.quantity &&
                  transaction.previousData.backupQuantity !==
                    transaction.newData.backupQuantity &&
                  " | "}
                {transaction.previousData.backupQuantity !==
                  transaction.newData.backupQuantity &&
                  `Backup: ${transaction.previousData.backupQuantity} → ${transaction.newData.backupQuantity}`}
              </Typography>
            )}
          </>
        );
      case "TRANSFER":
        return (
          <>
            <Typography variant="body2">
              Stock transfer for {productName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {transaction.notes}
            </Typography>
          </>
        );
      case "EDIT":
        return (
          <Box>
            <Typography variant="body2">Updated {productName}:</Typography>
            {Object.entries(transaction.newData || {}).map(
              ([key, value], index) => {
                const oldValue = transaction.previousData?.[key];
                if (oldValue !== value) {
                  return (
                    <Typography
                      key={index}
                      variant="body2"
                      color="textSecondary"
                    >
                      {key}: {oldValue} → {value}
                    </Typography>
                  );
                }
                return null;
              }
            )}
          </Box>
        );
      case "DELETE":
        return (
          <Typography variant="body2">
            Deleted product: {transaction.notes?.split(": ")[1] || productName}
          </Typography>
        );
      default:
        return null;
    }
  };

  // Group transactions by date
  const groupTransactionsByDate = (transactions) => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);

      if (!currentDate || !isSameDay(currentDate, transactionDate)) {
        if (currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            transactions: currentGroup,
          });
        }
        currentDate = transactionDate;
        currentGroup = [transaction];
      } else {
        currentGroup.push(transaction);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({
        date: currentDate,
        transactions: currentGroup,
      });
    }

    return groups;
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

  const transactionGroups = groupTransactionsByDate(transactions);

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
                <TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactionGroups.map((group, groupIndex) => (
                <React.Fragment key={group.date.toISOString()}>
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{
                        backgroundColor: "action.hover",
                        py: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "medium" }}
                      >
                        {format(group.date, "EEEE, MMMM d, yyyy")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {group.transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        <Chip
                          label={transaction.type}
                          color={getTransactionColor(transaction.type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {renderTransactionDetails(transaction)}
                      </TableCell>
                      <TableCell>{transaction.employee.name}</TableCell>
                      <TableCell>
                        {format(new Date(transaction.date), "HH:mm:ss")}
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default TransactionHistory;
