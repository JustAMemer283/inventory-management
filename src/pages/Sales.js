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
} from "@mui/material";
import {
  Add as AddIcon,
  LocalShipping as ShippingIcon,
} from "@mui/icons-material";
import { productApi } from "../services/api";

// sales page component for recording sales
const Sales = () => {
  // state management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
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
    setQuantity("");
    setError(null);
  };

  // calculate total available quantity
  const getTotalQuantity = (product) => {
    if (!product) return 0;
    return product.quantity + product.backupQuantity;
  };

  // handle sale submit
  const handleSubmit = async () => {
    try {
      if (!quantity || quantity <= 0) {
        setError("Please enter a valid quantity");
        return;
      }

      const totalAvailable = getTotalQuantity(selectedProduct);
      if (quantity > totalAvailable) {
        setError("Requested quantity exceeds total available stock");
        return;
      }

      const saleData = {
        productId: selectedProduct._id,
        quantity: parseInt(quantity),
      };

      await productApi.recordSale(saleData);
      await fetchProducts();
      setSelectedProduct(null);
      setQuantity("");
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
    <Container maxWidth="md">
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

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Autocomplete
                options={products}
                getOptionLabel={(option) => `${option.name} - ${option.brand}`}
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
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography variant="h6" color="primary">
                      {selectedProduct.name} - {selectedProduct.brand}
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
                      onChange={(e) => setQuantity(e.target.value)}
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
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Sales;
