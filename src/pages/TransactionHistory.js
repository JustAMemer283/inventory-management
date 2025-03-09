import React, { useState, useEffect, useRef } from "react";
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
  DialogActions,
  TextField,
  Collapse,
  Autocomplete,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Grid,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  format,
  isSameDay,
  startOfToday,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { transactionApi, productApi } from "../services/api";
import { authApi } from "../services/api";
import {
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  DeleteForever as DeleteForeverIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { dismissKeyboard } from "../utils/keyboard";
import { useAuth } from "../context/AuthContext";
import html2canvas from "html2canvas";

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

  // Delete older transactions state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Get auth context
  const { user } = useAuth();

  // Transaction types array
  const transactionTypes = ["SALE", "NEW", "ADD", "EDIT", "DELETE", "TRANSFER"];

  // Get theme and check if screen is mobile
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Add snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Add ref for report content
  const reportRef = useRef(null);

  // Add loading state for image download
  const [imageLoading, setImageLoading] = useState(false);

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
            ? `${sale.product.brand} ${sale.product.name}`
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

  // handle delete older transactions
  const handleDeleteOlderTransactions = async () => {
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    setDeleteLoading(true);

    try {
      // Verify password
      await authApi.verifyPassword(password);

      // Password is correct, proceed with deletion
      const result = await transactionApi.deleteOlderThan(7);

      // Show success message
      setSnackbar({
        open: true,
        message: result.message || "Transactions deleted successfully",
        severity: "success",
      });

      await fetchTransactions();
      handleCloseDeleteDialog();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setPasswordError("Incorrect password");
      } else {
        setPasswordError(err.message || "An error occurred");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // handle delete dialog close
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setPassword("");
    setPasswordError("");
  };

  // handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle download report as image
  const handleDownloadReportAsImage = async () => {
    try {
      setImageLoading(true);
      setSnackbar({
        open: true,
        message: "Generating image...",
        severity: "info",
      });

      // Create a temporary div for the styled report
      const reportContainer = document.createElement("div");
      reportContainer.style.padding = "20px";
      reportContainer.style.backgroundColor = "#ffffff";
      reportContainer.style.fontFamily = "Arial, sans-serif";
      reportContainer.style.width = "800px";
      reportContainer.style.color = "#000000";

      // Get the date from the selected date
      const selectedDateTime = new Date(selectedDate + "T00:00:00");
      const reportDate = format(selectedDateTime, "do MMM yyyy, EEEE");

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

      // Fetch current inventory data
      const inventoryData = await productApi.getAll();

      // Group by brand instead of individual products
      const brandSales = {};
      const brandInventory = {};

      // First, calculate total stock for each brand from inventory
      inventoryData.forEach((product) => {
        const brand = product.brand;

        if (!brandInventory[brand]) {
          brandInventory[brand] = {
            totalStock: 0,
            productCount: 0,
          };
        }

        brandInventory[brand].totalStock += product.stock;
        brandInventory[brand].productCount += 1;
      });

      // Then process sales by brand
      filteredSales.forEach((sale) => {
        if (!sale.product) return;

        let brand = "Unknown Brand";

        if (typeof sale.product === "object" && sale.product.brand) {
          brand = sale.product.brand;
        } else {
          // If product is just an ID, try to find it in inventory
          const product = inventoryData.find((p) => p._id === sale.product);
          if (product) {
            brand = product.brand;
          }
        }

        if (!brandSales[brand]) {
          brandSales[brand] = {
            sold: 0,
            left: brandInventory[brand] ? brandInventory[brand].totalStock : 0,
            productCount: brandInventory[brand]
              ? brandInventory[brand].productCount
              : 0,
          };
        }

        brandSales[brand].sold += sale.quantity;
      });

      // Add any brands from inventory that had no sales
      Object.keys(brandInventory).forEach((brand) => {
        if (!brandSales[brand]) {
          brandSales[brand] = {
            sold: 0,
            left: brandInventory[brand].totalStock,
            productCount: brandInventory[brand].productCount,
          };
        }
      });

      // Create the HTML content for the report
      reportContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); border-radius: 5px;">
          <h2 style="text-align: center; margin-bottom: 20px; color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">Inventory Report: ${reportDate}</h2>
          
          <table style="width: 100%; border-collapse: collapse; border: 2px solid #333; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 12px; border: 1px solid #333; text-align: left; width: 40%;">Brand Name</th>
                <th style="padding: 12px; border: 1px solid #333; text-align: center; width: 20%;">Products</th>
                <th style="padding: 12px; border: 1px solid #333; text-align: center; width: 20%;">Total Stock</th>
                <th style="padding: 12px; border: 1px solid #333; text-align: center; width: 20%;">Sold Today</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(brandSales)
                .map(
                  ([brand, data], index) => `
                <tr style="background-color: ${
                  index % 2 === 0 ? "#ffffff" : "#f9f9f9"
                };">
                  <td style="padding: 10px; border: 1px solid #333; font-weight: ${
                    data.sold > 0 ? "bold" : "normal"
                  };">${brand}</td>
                  <td style="padding: 10px; border: 1px solid #333; text-align: center;">${
                    data.productCount
                  }</td>
                  <td style="padding: 10px; border: 1px solid #333; text-align: center;">${
                    data.left
                  }</td>
                  <td style="padding: 10px; border: 1px solid #333; text-align: center;">${
                    data.sold
                  }</td>
                </tr>
              `
                )
                .join("")}
              ${
                Object.keys(brandSales).length === 0
                  ? `
                <tr>
                  <td colspan="4" style="padding: 15px; border: 1px solid #333; text-align: center; font-style: italic;">No inventory data available for this date</td>
                </tr>
              `
                  : ""
              }
            </tbody>
            ${
              Object.keys(brandSales).length > 0
                ? `
              <tfoot>
                <tr style="background-color: #f2f2f2; font-weight: bold;">
                  <td style="padding: 10px; border: 1px solid #333;">Total</td>
                  <td style="padding: 10px; border: 1px solid #333; text-align: center;">
                    ${Object.values(brandSales).reduce(
                      (sum, data) => sum + data.productCount,
                      0
                    )}
                  </td>
                  <td style="padding: 10px; border: 1px solid #333; text-align: center;">
                    ${Object.values(brandSales).reduce(
                      (sum, data) => sum + data.left,
                      0
                    )}
                  </td>
                  <td style="padding: 10px; border: 1px solid #333; text-align: center;">
                    ${Object.values(brandSales).reduce(
                      (sum, data) => sum + data.sold,
                      0
                    )}
                  </td>
                </tr>
              </tfoot>
            `
                : ""
            }
          </table>
          
          <div style="display: flex; justify-content: space-between; margin-top: 20px; font-size: 12px; color: #666;">
            <div>Report ID: INV-${Math.floor(Math.random() * 10000)
              .toString()
              .padStart(4, "0")}</div>
            <div>Generated on: ${format(
              new Date(),
              "do MMM yyyy, h:mm a"
            )}</div>
          </div>
        </div>
      `;

      // Append to body temporarily (will be hidden)
      reportContainer.style.position = "absolute";
      reportContainer.style.left = "-9999px";
      document.body.appendChild(reportContainer);

      // Use html2canvas to convert the styled div to an image
      const canvas = await html2canvas(reportContainer, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
      });

      // Remove the temporary element
      document.body.removeChild(reportContainer);

      // Convert canvas to data URL
      const imageUrl = canvas.toDataURL("image/png");

      // Create a download link
      const downloadLink = document.createElement("a");
      downloadLink.href = imageUrl;
      downloadLink.download = `Inventory_Report_${selectedDate}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setSnackbar({
        open: true,
        message: "Report downloaded as image!",
        severity: "success",
      });
    } catch (err) {
      console.error("Failed to download as image:", err);
      setSnackbar({
        open: true,
        message: "Failed to download report as image",
        severity: "error",
      });
    } finally {
      setImageLoading(false);
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

  const transactionGroups = groupTransactionsByDate(
    filterTransactions(transactions)
  );

  return (
    <Container maxWidth="lg" sx={{ px: isMobile ? 1 : 3 }}>
      <Box sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
          }}
        >
          <Typography variant="h4" component="h1">
            Transaction History
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              width: isMobile ? "100%" : "auto",
              justifyContent: isMobile ? "space-between" : "flex-end",
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                flex: isMobile ? "1 1 100%" : "0 0 auto",
                mb: isMobile ? 1 : 0,
                order: isMobile ? 0 : 1,
              }}
            >
              Filters
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenReport(true)}
              startIcon={<ContentCopyIcon />}
              size={isMobile ? "medium" : "medium"}
              sx={{
                flex: isMobile ? "1 1 48%" : "0 0 auto",
                minWidth: isMobile ? "0" : "auto",
                order: isMobile ? 1 : 2,
              }}
            >
              Generate Report
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={() => setOpenDeleteDialog(true)}
              startIcon={<DeleteForeverIcon />}
              size={isMobile ? "medium" : "medium"}
              sx={{
                flex: isMobile ? "1 1 48%" : "0 0 auto",
                minWidth: isMobile ? "0" : "auto",
                order: isMobile ? 2 : 3,
              }}
            >
              Delete Old Records
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
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
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

        {/* Report Dialog */}
        <Dialog
          open={openReport}
          onClose={() => setOpenReport(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" component="div">
                Sales Report
              </Typography>
              <Box>
                <Tooltip title="Copy to clipboard">
                  <IconButton
                    onClick={handleCopyReport}
                    color="primary"
                    disabled={imageLoading}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download as image">
                  <IconButton
                    onClick={handleDownloadReportAsImage}
                    color="primary"
                    disabled={imageLoading}
                  >
                    {imageLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <ImageIcon />
                    )}
                  </IconButton>
                </Tooltip>
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
              ref={reportRef}
              sx={{
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                fontSize: isMobile ? "0.75rem" : "0.875rem",
                overflowX: "auto",
                padding: 2,
                backgroundColor: "#ffffff",
                color: "#000000",
                borderRadius: 1,
                mb: 2,
                minHeight: "200px",
                border: "1px solid #e0e0e0",
              }}
            >
              {generateSalesReport()}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: isMobile ? "center" : "space-between",
                gap: isMobile ? 2 : 0,
                mt: 2,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyReport}
                size={isMobile ? "medium" : "medium"}
                fullWidth={isMobile}
              >
                Copy to Clipboard
              </Button>

              <Button
                variant="contained"
                color="secondary"
                startIcon={
                  imageLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <ImageIcon />
                  )
                }
                onClick={handleDownloadReportAsImage}
                disabled={imageLoading}
                size={isMobile ? "medium" : "medium"}
                fullWidth={isMobile}
              >
                Download as Image
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Delete Older Transactions Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "error.light",
              color: "error.contrastText",
            }}
          >
            <WarningIcon sx={{ mr: 1 }} />
            Delete Old Transactions
            <IconButton
              aria-label="close"
              onClick={handleCloseDeleteDialog}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: isMobile ? 2 : 1 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
              You are about to delete all transactions older than 7 days.
            </Typography>
            <Typography
              variant="body2"
              color="error"
              gutterBottom
              sx={{ mb: 2 }}
            >
              This action cannot be undone. Please enter your password to
              confirm:
            </Typography>
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && handleDeleteOlderTransactions()
              }
              fullWidth
              margin="normal"
              error={!!passwordError}
              helperText={passwordError}
              autoFocus
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={handleCloseDeleteDialog}
              variant={isMobile ? "outlined" : "text"}
              fullWidth={isMobile}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteOlderTransactions}
              variant="contained"
              color="error"
              disabled={deleteLoading}
              fullWidth={isMobile}
              sx={{ ml: isMobile ? 0 : 1, mt: isMobile ? 1 : 0 }}
            >
              {deleteLoading ? <CircularProgress size={24} /> : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default TransactionHistory;
