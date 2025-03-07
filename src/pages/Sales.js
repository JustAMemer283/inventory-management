import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Autocomplete,
  Divider,
  Snackbar,
  Paper,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Add as AddIcon,
  LocalShipping as ShippingIcon,
} from "@mui/icons-material";
import { productApi } from "../services/api";
import { format } from "date-fns";

// sales page component for recording sales
const Sales = () => {
  // state management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customDateTime, setCustomDateTime] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // fetch products from api
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getAll();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setError(null);
  };

  // calculate total available quantity
  const getTotalQuantity = (product) => {
    if (!product) return 0;
    return product.quantity + product.backupQuantity;
  };

  // handle sale submit
  const handleSubmit = async () => {
    if (!selectedProduct || quantity < 1) return;

    try {
      const totalAvailable = getTotalQuantity(selectedProduct);
      if (quantity > totalAvailable) {
        setError("Requested quantity exceeds total available stock");
        return;
      }

      const saleData = {
        productId: selectedProduct._id,
        quantity: quantity,
        date: useCustomDate ? new Date(customDateTime) : new Date(),
      };

      await productApi.recordSale(saleData);
      await fetchProducts();
      setSelectedProduct(null);
      setQuantity(1);
      setError(null);
      setSuccessMessage(
        `Successfully sold ${quantity} units of ${selectedProduct.brand} - ${selectedProduct.name}`
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // handle snackbar close
  const handleSnackbarClose = () => {
    setSuccessMessage("");
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
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Record Sale
        </Typography>

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
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            {successMessage}
          </Alert>
        </Snackbar>

        <Paper sx={{ p: 3, mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Autocomplete
              options={products}
              getOptionLabel={(option) => `${option.brand} - ${option.name}`}
              filterOptions={(options, { inputValue }) => {
                const inputTerms = inputValue.toLowerCase().split(/\s+/);
                return options.filter((option) => {
                  const brandName = option.brand.toLowerCase();
                  const productName = option.name.toLowerCase();
                  return inputTerms.every(
                    (term) =>
                      brandName.includes(term) || productName.includes(term)
                  );
                });
              }}
              value={selectedProduct}
              onChange={(event, newValue) => handleProductSelect(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Product"
                  variant="outlined"
                  fullWidth
                />
              )}
            />

            {selectedProduct && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="h6" color="primary">
                    {selectedProduct.brand} - {selectedProduct.name}
                  </Typography>
                  <Typography variant="body1">
                    Price: ${selectedProduct.price.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 4, mt: 1 }}>
                    <Typography variant="body1" color="success.main">
                      In Stock: {selectedProduct.quantity}
                    </Typography>
                    <Typography variant="body1" color="info.main">
                      Backup: {selectedProduct.backupQuantity}
                    </Typography>
                    <Typography variant="body1" color="primary">
                      Total Available: {getTotalQuantity(selectedProduct)}
                    </Typography>
                  </Box>
                  <TextField
                    label="Quantity to Sell"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    fullWidth
                    required
                    inputProps={{
                      min: 1,
                      max: getTotalQuantity(selectedProduct),
                    }}
                    helperText={
                      quantity > selectedProduct.quantity
                        ? `Will use ${
                            quantity - selectedProduct.quantity
                          } units from backup stock`
                        : ""
                    }
                    sx={{ mt: 2 }}
                  />
                  {quantity && (
                    <Typography variant="body2" color="text.secondary">
                      Total Price: $
                      {(quantity * selectedProduct.price).toFixed(2)}
                    </Typography>
                  )}
                </Box>

                {/* Custom Date Toggle and Fields */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useCustomDate}
                        onChange={(e) => setUseCustomDate(e.target.checked)}
                      />
                    }
                    label="Use Custom Date/Time"
                  />
                  {useCustomDate && (
                    <TextField
                      type="datetime-local"
                      value={customDateTime}
                      onChange={(e) => setCustomDateTime(e.target.value)}
                      sx={{ minWidth: 250 }}
                      inputProps={{
                        max: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                      }}
                    />
                  )}
                </Box>

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={!quantity || quantity <= 0}
                    startIcon={<ShippingIcon />}
                  >
                    Record Sale
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Sales;
