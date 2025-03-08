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
  Collapse,
  Autocomplete,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import {
  format,
  isSameDay,
  startOfToday,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { transactionApi } from "../services/api";
import {
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { dismissKeyboard } from "../utils/keyboard";

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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "00:00",
    endTime: "23:59",
    types: [], // Selected transaction types
    employees: [], // Selected employees
    selectedBrand: null, // Selected brand (single)
    selectedProduct: null, // Selected product (single)
  });

  // Transaction types array
  const transactionTypes = ["SALE", "NEW", "ADD", "EDIT", "DELETE", "TRANSFER"];

  // Get theme and check if screen is mobile
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
          <Box>
            <Typography variant="body2" color="error">
              Deleted product:{" "}
              {transaction.previousData?.brand
                ? `${transaction.previousData.brand} - ${transaction.previousData.name}`
                : transaction.notes?.split(": ")[1] || productName}
            </Typography>
            {transaction.previousData && (
              <Box sx={{ pl: 2, mt: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Stock: {transaction.previousData.quantity} units
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Backup: {transaction.previousData.backupQuantity} units
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Price: $
                  {typeof transaction.previousData.price === "number"
                    ? transaction.previousData.price.toFixed(2)
                    : transaction.previousData.price}
                </Typography>
              </Box>
            )}
          </Box>
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

  // Get unique employees from transactions
  const getUniqueEmployees = () => {
    const uniqueEmployees = new Set();
    transactions.forEach((transaction) => {
      if (transaction.employee) {
        uniqueEmployees.add(transaction.employee.name);
      }
    });
    return Array.from(uniqueEmployees);
  };

  // Get unique brands from transactions
  const getUniqueBrands = () => {
    const uniqueBrands = new Set();
    transactions.forEach((transaction) => {
      if (transaction.product?.brand) {
        uniqueBrands.add(transaction.product.brand);
      }
    });
    return Array.from(uniqueBrands);
  };

  // Get products for selected brand
  const getProductsForBrand = () => {
    const products = new Set();
    transactions.forEach((transaction) => {
      if (
        transaction.product?.name &&
        transaction.product.brand === filters.selectedBrand
      ) {
        products.add(transaction.product.name);
      }
    });
    return Array.from(products);
  };

  // Handle employee filter toggle
  const handleEmployeeToggle = (employee) => {
    setFilters((prev) => ({
      ...prev,
      employees: prev.employees.includes(employee)
        ? prev.employees.filter((e) => e !== employee)
        : [...prev.employees, employee],
    }));
  };

  // Handle brand selection
  const handleBrandChange = (event, newValue) => {
    setFilters((prev) => ({
      ...prev,
      selectedBrand: newValue,
      selectedProduct: null, // Reset product when brand changes
    }));

    // Dismiss keyboard on mobile devices
    if (newValue) {
      dismissKeyboard(true);
    }
  };

  // Handle product selection
  const handleProductChange = (event, newValue) => {
    setFilters((prev) => ({
      ...prev,
      selectedProduct: newValue,
    }));

    // Dismiss keyboard on mobile devices
    if (newValue) {
      dismissKeyboard(true);
    }
  };

  // Filter transactions based on all criteria
  const filterTransactions = (transactions) => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const startDateTime = new Date(
        filters.startDate + "T" + filters.startTime
      );
      const endDateTime = new Date(filters.endDate + "T" + filters.endTime);

      // Check if within date/time range
      const isInDateRange = isWithinInterval(transactionDate, {
        start: startDateTime,
        end: endDateTime,
      });

      // Check if type matches
      const isTypeMatch =
        filters.types.length === 0 || filters.types.includes(transaction.type);

      // Check if employee matches
      const isEmployeeMatch =
        filters.employees.length === 0 ||
        filters.employees.includes(transaction.employee?.name);

      // Check if brand matches
      const isBrandMatch =
        !filters.selectedBrand ||
        (transaction.product &&
          transaction.product.brand === filters.selectedBrand);

      // Check if product matches
      const isProductMatch =
        !filters.selectedProduct ||
        (transaction.product &&
          transaction.product.name === filters.selectedProduct);

      return (
        isInDateRange &&
        isTypeMatch &&
        isEmployeeMatch &&
        isBrandMatch &&
        isProductMatch
      );
    });
  };

  const generateSalesReport = () => {
    try {
      // Validate the date input
      if (
        !selectedDate ||
        selectedDate === "0" ||
        !selectedDate.match(/^\d{4}-\d{2}-\d{2}$/)
      ) {
        return "Please select a valid date.";
      }

      // Create date at start of day in local timezone
      const selectedDateTime = new Date(selectedDate + "T00:00:00");

      // Check if the date is valid
      if (isNaN(selectedDateTime.getTime())) {
        return "Please select a valid date.";
      }

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
    } catch (error) {
      console.error("Error generating report:", error);
      return "Error generating report. Please select a valid date.";
    }
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

  // Add validation to the date input
  const handleDateChange = (e) => {
    const value = e.target.value;
    if (!value || value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setSelectedDate(value);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // Handle type filter toggle
  const handleTypeToggle = (type) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
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

  const transactionGroups = groupTransactionsByDate(
    filterTransactions(transactions)
  );

  return (
    <Container maxWidth="lg" sx={{ px: isMobile ? 1 : 3 }}>
      <Box sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? 2 : 0,
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom={!isMobile}>
            Transaction History
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 1,
              width: isMobile ? "100%" : "auto",
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ mr: isMobile ? 0 : 2, width: isMobile ? "100%" : "auto" }}
            >
              Filters
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ContentCopyIcon />}
              onClick={() => setOpenReport(true)}
              sx={{ width: isMobile ? "100%" : "auto" }}
            >
              Generate Today's Report
            </Button>
          </Box>
        </Box>

        {/* Filters Section */}
        <Collapse in={showFilters}>
          <Paper sx={{ p: isMobile ? 2 : 3, mb: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                Date Range
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={filters.startDate}
                    onChange={handleFilterChange("startDate")}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Start Time"
                    type="time"
                    value={filters.startTime}
                    onChange={handleFilterChange("startTime")}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="End Date"
                    type="date"
                    value={filters.endDate}
                    onChange={handleFilterChange("endDate")}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="End Time"
                    type="time"
                    value={filters.endTime}
                    onChange={handleFilterChange("endTime")}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                Transaction Types
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {transactionTypes.map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    color={
                      filters.types.includes(type)
                        ? getTransactionColor(type)
                        : "default"
                    }
                    onClick={() => handleTypeToggle(type)}
                    variant={
                      filters.types.includes(type) ? "filled" : "outlined"
                    }
                    sx={{
                      "&:hover": {
                        backgroundColor: filters.types.includes(type)
                          ? undefined
                          : "rgba(0, 0, 0, 0.04)",
                      },
                      margin: "2px",
                    }}
                  />
                ))}
              </Box>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                Employees
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {getUniqueEmployees().map((employee) => (
                  <Chip
                    key={employee}
                    label={employee}
                    color={
                      filters.employees.includes(employee)
                        ? "primary"
                        : "default"
                    }
                    onClick={() => handleEmployeeToggle(employee)}
                    variant={
                      filters.employees.includes(employee)
                        ? "filled"
                        : "outlined"
                    }
                    sx={{
                      "&:hover": {
                        backgroundColor: filters.employees.includes(employee)
                          ? undefined
                          : "rgba(0, 0, 0, 0.04)",
                      },
                      margin: "2px",
                    }}
                  />
                ))}
              </Box>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                Products
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={getUniqueBrands()}
                    value={filters.selectedBrand}
                    onChange={handleBrandChange}
                    onBlur={() => dismissKeyboard()}
                    blurOnSelect={true}
                    disablePortal={true}
                    openOnFocus={true}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Brand"
                        size="small"
                        fullWidth
                        onBlur={() => dismissKeyboard()}
                      />
                    )}
                  />
                </Grid>

                {/* Product dropdown - only show if brand is selected */}
                {filters.selectedBrand && (
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={getProductsForBrand()}
                      value={filters.selectedProduct}
                      onChange={handleProductChange}
                      onBlur={() => dismissKeyboard()}
                      blurOnSelect={true}
                      disablePortal={true}
                      openOnFocus={true}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Product"
                          size="small"
                          fullWidth
                          onBlur={() => dismissKeyboard()}
                        />
                      )}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Collapse>

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
            variant="filled"
            sx={{ width: "100%" }}
          >
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Desktop Table View */}
        {!isMobile && (
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
                          backgroundColor: "#1e1e1e",
                          py: 1,
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "medium", color: "#fff" }}
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
                        <TableCell>
                          {transaction.employee
                            ? transaction.employee.name
                            : "Deleted User"}
                        </TableCell>
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
        )}

        {/* Mobile Card View */}
        {isMobile && (
          <Box>
            {transactionGroups.map((group) => (
              <Box key={group.date.toISOString()} sx={{ mb: 3 }}>
                <Paper
                  sx={{
                    backgroundColor: "#1e1e1e",
                    py: 1,
                    px: 2,
                    mb: 1,
                    borderRadius: "4px 4px 0 0",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "medium", color: "#fff" }}
                  >
                    {format(group.date, "EEEE, MMMM d, yyyy")}
                  </Typography>
                </Paper>

                {group.transactions.map((transaction) => (
                  <Card key={transaction._id} sx={{ mb: 1 }}>
                    <CardContent sx={{ pb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Chip
                          label={transaction.type}
                          color={getTransactionColor(transaction.type)}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(transaction.date), "HH:mm:ss")}
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 1 }}>
                        {renderTransactionDetails(transaction)}
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 1 }}
                      >
                        <PersonIcon
                          fontSize="small"
                          sx={{ mr: 0.5, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {transaction.employee
                            ? transaction.employee.name
                            : "Deleted User"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ))}
          </Box>
        )}

        {/* Sales Report Dialog */}
        <Dialog
          open={openReport}
          onClose={() => setOpenReport(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              width: isMobile ? "95%" : undefined,
              margin: isMobile ? "10px" : undefined,
            },
          }}
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
                onChange={handleDateChange}
                label="Select Date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                inputProps={{
                  min: "2000-01-01",
                  max: "2099-12-31",
                }}
              />
            </Box>
            <Box
              sx={{
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                fontSize: isMobile ? "0.75rem" : "0.875rem",
                overflowX: "auto",
              }}
            >
              {generateSalesReport()}
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
};

export default TransactionHistory;
