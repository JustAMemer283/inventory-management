import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Autocomplete,
  Switch,
  FormControlLabel,
  Snackbar,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Inventory as InventoryIcon,
  SwapHoriz as SwapIcon,
  LocalShipping as ShippingIcon,
  Assessment as AssessmentIcon,
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { productApi } from "../services/api";

// inventory page component with real-time updates
const Inventory = () => {
  // state management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    quantity: "",
    backupQuantity: "",
    price: "",
  });
  const [openUpdateStock, setOpenUpdateStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updateQuantities, setUpdateQuantities] = useState({
    quantity: "",
    backupQuantity: "",
  });
  const [isSwapMode, setIsSwapMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [openQuickLook, setOpenQuickLook] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  // Filter products based on search query
  const filteredProducts = products.filter((product) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.brand.toLowerCase().includes(searchLower)
    );
  });

  // fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // fetch products from api
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getAll();
      console.log("Fetched products:", data);
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // handle form input change
  const handleInputChange = (field) => (event) => {
    let value = event.target.value;
    // Convert numeric fields to numbers
    if (["quantity", "backupQuantity", "price"].includes(field)) {
      value = value === "" ? "" : Number(value);
    }
    console.log(`Setting ${field} to:`, value);
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // handle dialog open
  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        brand: product.brand,
        quantity: Number(product.quantity),
        backupQuantity: Number(product.backupQuantity),
        price: Number(product.price),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        brand: "",
        quantity: "",
        backupQuantity: "",
        price: "",
      });
    }
    setOpenDialog(true);
  };

  // handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      brand: "",
      quantity: "",
      backupQuantity: "",
      price: "",
    });
  };

  // handle snackbar close
  const handleSnackbarClose = () => {
    setSuccessMessage("");
  };

  // handle form submit
  const handleSubmit = async () => {
    try {
      const submissionData = {
        ...formData,
        quantity: Number(formData.quantity),
        backupQuantity: Number(formData.backupQuantity),
        price: Number(formData.price),
      };

      if (editingProduct) {
        await productApi.update(editingProduct._id, submissionData);
        setSuccessMessage(
          `Successfully updated ${submissionData.brand} - ${submissionData.name}`
        );
      } else {
        await productApi.create(submissionData);
        setSuccessMessage(
          `Successfully added ${submissionData.brand} - ${submissionData.name}`
        );
      }
      await fetchProducts();
      handleCloseDialog();
      setError(null);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.response?.data?.message || err.message);
    }
  };

  // handle delete product
  const handleDelete = async (id, productName) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productApi.delete(id);
        setSuccessMessage(`Successfully deleted ${productName}`);
        await fetchProducts();
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleUpdateStockOpen = () => {
    setOpenUpdateStock(true);
  };

  const handleUpdateStockClose = () => {
    setOpenUpdateStock(false);
    setSelectedProduct(null);
    setUpdateQuantities({
      quantity: "",
      backupQuantity: "",
    });
    setIsSwapMode(false);
    setError(null);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setUpdateQuantities({
      quantity: "",
      backupQuantity: "",
    });
  };

  const handleUpdateStock = async () => {
    try {
      if (!selectedProduct) return;

      if (isSwapMode) {
        // Validate swap quantities
        const swapQuantity = Number(updateQuantities.quantity) || 0;

        if (swapQuantity <= 0) {
          setError("Please enter a valid quantity to swap");
          return;
        }

        if (
          updateQuantities.quantity &&
          Number(updateQuantities.quantity) > selectedProduct.backupQuantity
        ) {
          setError("Cannot swap more than available backup quantity");
          return;
        }

        if (
          updateQuantities.backupQuantity &&
          Number(updateQuantities.backupQuantity) > selectedProduct.quantity
        ) {
          setError("Cannot swap more than available stock quantity");
          return;
        }

        // For swap mode, we subtract from one and add to the other
        const stockData = {
          quantity: updateQuantities.quantity
            ? Number(updateQuantities.quantity)
            : null,
          backupQuantity: updateQuantities.quantity
            ? -Number(updateQuantities.quantity)
            : null,
          isSwap: true,
        };

        await productApi.updateStock(selectedProduct._id, stockData);
        const newStockQty =
          selectedProduct.quantity + Number(updateQuantities.quantity);
        const newBackupQty =
          selectedProduct.backupQuantity - Number(updateQuantities.quantity);
        setSuccessMessage(
          `${selectedProduct.brand} - ${selectedProduct.name}: Transferred ${updateQuantities.quantity} units from backup to stock. (Stock: ${selectedProduct.quantity} → ${newStockQty}, Backup: ${selectedProduct.backupQuantity} → ${newBackupQty})`
        );
      } else {
        // Normal add mode
        const stockData = {
          quantity: updateQuantities.quantity
            ? Number(updateQuantities.quantity)
            : null,
          backupQuantity: updateQuantities.backupQuantity
            ? Number(updateQuantities.backupQuantity)
            : null,
          isSwap: false,
        };

        await productApi.updateStock(selectedProduct._id, stockData);
        let message = `${selectedProduct.brand} - ${selectedProduct.name}:`;
        if (updateQuantities.quantity) {
          const newStockQty =
            selectedProduct.quantity + Number(updateQuantities.quantity);
          message += ` Stock: ${selectedProduct.quantity} → ${newStockQty}`;
        }
        if (updateQuantities.backupQuantity) {
          const newBackupQty =
            selectedProduct.backupQuantity +
            Number(updateQuantities.backupQuantity);
          message += `${updateQuantities.quantity ? "," : ""} Backup: ${
            selectedProduct.backupQuantity
          } → ${newBackupQty}`;
        }
        setSuccessMessage(message);
      }

      await fetchProducts();
      handleUpdateStockClose();
      setError(null);
    } catch (err) {
      console.error("Error updating stock:", err);
      setError(err.response?.data?.message || err.message);
    }
  };

  // Get unique brands from products
  useEffect(() => {
    if (products.length > 0) {
      const brands = [...new Set(products.map((product) => product.brand))];
      setAvailableBrands(brands);
    }
  }, [products]);

  const handleBrandToggle = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const generateReport = () => {
    let report = "Inventory:\n\n";

    selectedBrands.forEach((brand, index) => {
      const brandProducts = products.filter((p) => p.brand === brand);
      if (brandProducts.length > 0) {
        report += `${brand}:\n`;
        brandProducts.forEach((product) => {
          const totalQuantity = product.quantity + product.backupQuantity;
          report += `${product.name}: ${totalQuantity}\n`;
        });
        if (index < selectedBrands.length - 1) {
          report += "\n-------------------\n\n";
        }
      }
    });

    return report;
  };

  const handleCopyToClipboard = async () => {
    const report = generateReport();
    try {
      await navigator.clipboard.writeText(report);
      setSuccessMessage("Report copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
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
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4" component="h1">
            Inventory
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AssessmentIcon />}
              onClick={() => setOpenQuickLook(true)}
            >
              Quick Look
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ShippingIcon />}
              onClick={() => setOpenUpdateStock(true)}
            >
              Update Stock
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: "",
                  brand: "",
                  quantity: "",
                  backupQuantity: "",
                  price: "",
                });
                setOpenDialog(true);
              }}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        {/* Search bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by product name or brand..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <Box sx={{ color: "text.secondary", mr: 1 }}>🔍</Box>
            ),
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {product.brand} - {product.name}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                      <Typography variant="body1" color="success.main">
                        Stock: {product.quantity}
                      </Typography>
                      <Typography variant="body1" color="info.main">
                        Backup: {product.backupQuantity}
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      Price: ${product.price.toFixed(2)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(product._id, product.name)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Update Stock Dialog */}
        <Dialog
          open={openUpdateStock}
          onClose={handleUpdateStockClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>Update Stock</DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <Autocomplete
                options={products}
                getOptionLabel={(option) => `${option.name} - ${option.brand}`}
                value={selectedProduct}
                onChange={(event, newValue) => handleProductSelect(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Product"
                    required
                    fullWidth
                  />
                )}
              />
              {selectedProduct && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body1" color="textSecondary">
                      Current Stock: {selectedProduct.quantity}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isSwapMode}
                          onChange={(e) => {
                            setIsSwapMode(e.target.checked);
                            setUpdateQuantities({
                              quantity: "",
                              backupQuantity: "",
                            });
                            setError(null);
                          }}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <SwapIcon sx={{ mr: 1 }} />
                          Swap Mode
                        </Box>
                      }
                    />
                  </Box>
                  <Typography variant="body1" color="textSecondary">
                    Current Backup: {selectedProduct.backupQuantity}
                  </Typography>
                  {isSwapMode ? (
                    <TextField
                      label="Quantity to move from Backup to Stock"
                      type="number"
                      value={updateQuantities.quantity}
                      onChange={(e) =>
                        setUpdateQuantities({
                          ...updateQuantities,
                          quantity: e.target.value,
                          backupQuantity: "", // Clear backup quantity in swap mode
                        })
                      }
                      fullWidth
                      inputProps={{
                        min: 0,
                        max: selectedProduct.backupQuantity,
                      }}
                      helperText={`Maximum available: ${selectedProduct.backupQuantity}`}
                    />
                  ) : (
                    <>
                      <TextField
                        label="Add to Stock"
                        type="number"
                        value={updateQuantities.quantity}
                        onChange={(e) =>
                          setUpdateQuantities({
                            ...updateQuantities,
                            quantity: e.target.value,
                          })
                        }
                        fullWidth
                        inputProps={{ min: 0 }}
                      />
                      <TextField
                        label="Add to Backup"
                        type="number"
                        value={updateQuantities.backupQuantity}
                        onChange={(e) =>
                          setUpdateQuantities({
                            ...updateQuantities,
                            backupQuantity: e.target.value,
                          })
                        }
                        fullWidth
                        inputProps={{ min: 0 }}
                      />
                    </>
                  )}
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleUpdateStockClose}>Cancel</Button>
            <Button
              onClick={handleUpdateStock}
              variant="contained"
              disabled={
                !selectedProduct ||
                (!updateQuantities.quantity && !updateQuantities.backupQuantity)
              }
            >
              {isSwapMode ? "Swap Stock" : "Update"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* add/edit dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <TextField
                label="Product Name"
                value={formData.name}
                onChange={handleInputChange("name")}
                fullWidth
                required
              />
              <TextField
                label="Brand"
                value={formData.brand}
                onChange={handleInputChange("brand")}
                fullWidth
                required
              />
              <TextField
                label="Price"
                type="number"
                value={formData.price}
                onChange={handleInputChange("price")}
                fullWidth
                required
                inputProps={{ min: 0, step: "0.01" }}
              />
              <TextField
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange("quantity")}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Backup Quantity"
                type="number"
                value={formData.backupQuantity}
                onChange={handleInputChange("backupQuantity")}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingProduct ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Quick Look Dialog */}
        <Dialog
          open={openQuickLook}
          onClose={() => setOpenQuickLook(false)}
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
              Quick Look Report
              <Box>
                <IconButton
                  onClick={handleCopyToClipboard}
                  color="primary"
                  title="Copy to clipboard"
                >
                  <ContentCopyIcon />
                </IconButton>
                <IconButton
                  onClick={() => setOpenQuickLook(false)}
                  color="inherit"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select Brands:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {availableBrands.map((brand) => (
                  <Chip
                    key={brand}
                    label={brand}
                    onClick={() => handleBrandToggle(brand)}
                    color={
                      selectedBrands.includes(brand) ? "primary" : "default"
                    }
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Box>
            {selectedBrands.length > 0 && (
              <Box
                sx={{ mt: 3, whiteSpace: "pre-wrap", fontFamily: "monospace" }}
              >
                {generateReport()}
              </Box>
            )}
          </DialogContent>
        </Dialog>

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
      </Box>
    </Container>
  );
};

export default Inventory;
