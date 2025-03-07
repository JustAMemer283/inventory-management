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
  Button,
  IconButton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
} from "@mui/material";
import { format, isSameDay, startOfToday } from "date-fns";
import { transactionApi } from "../services/api";
import {
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";

// transaction history page component with filtering options
const TransactionHistory = () => {
  // state management
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [openReport, setOpenReport] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

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

  // fetch data on component mount
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

  const generateSalesReport = () => {
    // Create date at start of day in local timezone
    const selectedDateTime = new Date(selectedDate + "T00:00:00");

    // Filter sales transactions for selected date
    const filteredSales = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transaction.type === "SALE" &&
        transactionDate.getDate() === selectedDateTime.getDate() &&
        transactionDate.getMonth() === selectedDateTime.getMonth() &&
        transactionDate.getFullYear() === selectedDateTime.getFullYear()
      );
    });

    // Sort by time
    filteredSales.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Generate report with just the date and sales
    const reportDate = selectedDateTime;
    let report = `Sale (${format(reportDate, "do MMM")}, ${format(
      reportDate,
      "EEEE"
    )}):\n`;

    if (filteredSales.length === 0) {
      report += "No sales recorded for this date.\n";
    } else {
      filteredSales.forEach((sale) => {
        const time = format(new Date(sale.date), "hh:mm a");
        const productInfo = sale.product
          ? `${sale.product.brand} - ${sale.product.name}`
          : "Unknown Product";
        report += `${time} - ${productInfo} - ${sale.quantity}\n`;
      });
    }

    return report;
  };

  const handleCopyReport = async () => {
    try {
      const report = generateSalesReport();
      await navigator.clipboard.writeText(report);
      setSuccessMessage("Report copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
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

  const transactionGroups = groupTransactionsByDate(transactions);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Transaction History
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ContentCopyIcon />}
            onClick={() => setOpenReport(true)}
          >
            Generate Today's Report
          </Button>
        </Box>

        {/* error alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSuccessMessage("")}
            severity="success"
            sx={{ width: "100%" }}
          >
            {successMessage}
          </Alert>
        </Snackbar>

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

        {/* Sales Report Dialog */}
        <Dialog
          open={openReport}
          onClose={() => setOpenReport(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Sales Report
              <Box>
                <IconButton
                  onClick={handleCopyReport}
                  color="primary"
                  title="Copy to clipboard"
                >
                  <ContentCopyIcon />
                </IconButton>
                <IconButton
                  onClick={() => setOpenReport(false)}
                  color="inherit"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, mb: 3 }}>
              <TextField
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                label="Select Date"
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
            <Box sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
              {generateSalesReport()}
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
};

export default TransactionHistory;
