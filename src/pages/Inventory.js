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
  useMediaQuery,
  useTheme,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  List,
  ListItem,
  ListItemText,
  Divider,
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
  Menu as MenuIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { productApi } from "../services/api";
import { dismissKeyboard } from "../utils/keyboard";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";

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
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // Password confirmation dialog state
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Get auth context
  const { user } = useAuth();

  // Get theme and check if screen is mobile
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Filter products based on search query
  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true;
    const inputTerms = searchQuery.toLowerCase().split(/\s+/);
    const brandName = product.brand.toLowerCase();
    const productName = product.name.toLowerCase();
    return inputTerms.every(
      (term) => brandName.includes(term) || productName.includes(term)
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
      // Validate required fields
      if (!formData.brand || !formData.name) {
        setError("Brand and Product Name are required");
        return;
      }

      const submissionData = {
        ...formData,
        price: Number(formData.price) || 0,
        quantity: Number(formData.quantity) || 0,
        backupQuantity: Number(formData.backupQuantity) || 0,
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
  const handleDelete = async (id, product) => {
    setProductToDelete(product);
    setOpenPasswordDialog(true);
    setPassword("");
    setPasswordError("");
  };

  // handle password confirmation dialog close
  const handlePasswordDialogClose = () => {
    setOpenPasswordDialog(false);
    setPassword("");
    setPasswordError("");
    setProductToDelete(null);
  };

  // handle password confirmation
  const handlePasswordConfirm = async () => {
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    setPasswordLoading(true);

    try {
      // Verify password
      await authApi.verifyPassword(password);

      // Password is correct, proceed with deletion
      await productApi.delete(productToDelete._id);

      setSuccessMessage(
        `Successfully deleted ${productToDelete.brand} - ${productToDelete.name}`
      );
      await fetchProducts();
      handlePasswordDialogClose();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setPasswordError("Incorrect password");
      } else {
        setPasswordError(err.message || "An error occurred");
      }
    } finally {
      setPasswordLoading(false);
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

    // Dismiss keyboard on mobile devices
    if (product) {
      dismissKeyboard(true);
    }
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
        report += `[${brand}]:\n`;
        brandProducts.forEach((product) => {
          const totalQuantity = product.quantity + product.backupQuantity;
          report += `${product.name}: ${totalQuantity}\n`;
        });
        if (index < selectedBrands.length - 1) {
          report += "\n";
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

  // Define speed dial actions
  const actions = [
    {
      icon: <AddIcon />,
      name: "Add Product",
      onClick: () => {
        setEditingProduct(null);
        setFormData({
          name: "",
          brand: "",
          quantity: "",
          backupQuantity: "",
          price: "",
        });
        setOpenDialog(true);
        setSpeedDialOpen(false);
      },
    },
    {
      icon: <ShippingIcon />,
      name: "Update Stock",
      onClick: () => {
        setOpenUpdateStock(true);
        setSpeedDialOpen(false);
      },
    },
    {
      icon: <AssessmentIcon />,
      name: "Quick Look",
      onClick: () => {
        setOpenQuickLook(true);
        setSpeedDialOpen(false);
      },
    },
  ];

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

          {/* Desktop buttons */}
          {!isMobile && (
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
          )}
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

        {/* Mobile SpeedDial */}
        {isMobile && (
          <SpeedDial
            ariaLabel="Inventory actions"
            sx={{ position: "fixed", bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
            open={speedDialOpen}
            onOpen={() => setSpeedDialOpen(true)}
            onClose={() => setSpeedDialOpen(false)}
          >
            {actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                tooltipOpen
                onClick={action.onClick}
              />
            ))}
          </SpeedDial>
        )}

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
                      onClick={() => handleDelete(product._id, product)}
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
                getOptionLabel={(option) => `${option.brand} - ${option.name}`}
                filterOptions={(options, { inputValue }) => {
                  if (!inputValue) return options;
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
                onBlur={() => dismissKeyboard()}
                blurOnSelect={true}
                disablePortal={true}
                openOnFocus={true}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Product"
                    required
                    fullWidth
                    onBlur={() => dismissKeyboard()}
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
                      onBlur={() => dismissKeyboard()}
                      fullWidth
                      inputProps={{
                        min: 0,
                        max: selectedProduct.backupQuantity,
                        inputMode: "numeric",
                        pattern: "[0-9]*",
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
                        onBlur={() => dismissKeyboard()}
                        fullWidth
                        inputProps={{
                          min: 0,
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        }}
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
                        onBlur={() => dismissKeyboard()}
                        fullWidth
                        inputProps={{
                          min: 0,
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        }}
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
              <Autocomplete
                options={availableBrands}
                value={formData.brand}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setFormData({
                      ...formData,
                      brand:
                        newValue.charAt(0).toUpperCase() +
                        newValue.slice(1).toLowerCase(),
                    });
                    dismissKeyboard(true);
                  }
                }}
                onBlur={() => dismissKeyboard()}
                blurOnSelect={true}
                disablePortal={true}
                openOnFocus={true}
                freeSolo
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Brand"
                    required
                    onBlur={() => dismissKeyboard()}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        brand:
                          value.charAt(0).toUpperCase() +
                          value.slice(1).toLowerCase(),
                      });
                    }}
                  />
                )}
              />
              <TextField
                label="Product Name"
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    name:
                      value.charAt(0).toUpperCase() +
                      value.slice(1).toLowerCase(),
                  });
                }}
                onBlur={() => dismissKeyboard()}
                fullWidth
                required
              />
              <TextField
                label="Price"
                type="number"
                value={formData.price}
                onChange={handleInputChange("price")}
                onBlur={() => dismissKeyboard()}
                fullWidth
                inputProps={{
                  min: 0,
                  step: "0.01",
                  inputMode: "decimal",
                  pattern: "[0-9]*[.]?[0-9]*",
                }}
              />
              <TextField
                label="In Stock Quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange("quantity")}
                onBlur={() => dismissKeyboard()}
                fullWidth
                inputProps={{
                  min: 0,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
              />
              <TextField
                label="Backup Quantity"
                type="number"
                value={formData.backupQuantity}
                onChange={handleInputChange("backupQuantity")}
                onBlur={() => dismissKeyboard()}
                fullWidth
                inputProps={{
                  min: 0,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
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

        {/* Password Confirmation Dialog */}
        <Dialog
          open={openPasswordDialog}
          onClose={handlePasswordDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
            <WarningIcon color="error" sx={{ mr: 1 }} />
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            {productToDelete && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  You are about to delete the following product:
                </Typography>
                <Box
                  sx={{
                    my: 2,
                    p: 2,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Brand"
                        secondary={productToDelete.brand}
                        primaryTypographyProps={{
                          color: "text.secondary",
                          variant: "body2",
                        }}
                        secondaryTypographyProps={{
                          color: "text.primary",
                          variant: "body1",
                          fontWeight: "medium",
                        }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Product Name"
                        secondary={productToDelete.name}
                        primaryTypographyProps={{
                          color: "text.secondary",
                          variant: "body2",
                        }}
                        secondaryTypographyProps={{
                          color: "text.primary",
                          variant: "body1",
                          fontWeight: "medium",
                        }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Current Stock"
                        secondary={productToDelete.quantity}
                        primaryTypographyProps={{
                          color: "text.secondary",
                          variant: "body2",
                        }}
                        secondaryTypographyProps={{
                          color: "text.primary",
                          variant: "body1",
                          fontWeight: "medium",
                        }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Backup Stock"
                        secondary={productToDelete.backupQuantity}
                        primaryTypographyProps={{
                          color: "text.secondary",
                          variant: "body2",
                        }}
                        secondaryTypographyProps={{
                          color: "text.primary",
                          variant: "body1",
                          fontWeight: "medium",
                        }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Price"
                        secondary={`$${productToDelete.price.toFixed(2)}`}
                        primaryTypographyProps={{
                          color: "text.secondary",
                          variant: "body2",
                        }}
                        secondaryTypographyProps={{
                          color: "text.primary",
                          variant: "body1",
                          fontWeight: "medium",
                        }}
                      />
                    </ListItem>
                  </List>
                </Box>
                <Typography variant="body1" color="error" gutterBottom>
                  This action cannot be undone. Please enter your password to
                  confirm:
                </Typography>
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handlePasswordConfirm()
                  }
                  fullWidth
                  margin="normal"
                  error={!!passwordError}
                  helperText={passwordError}
                  autoFocus
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePasswordDialogClose}>Cancel</Button>
            <Button
              onClick={handlePasswordConfirm}
              variant="contained"
              color="error"
              disabled={passwordLoading}
            >
              {passwordLoading ? <CircularProgress size={24} /> : "Delete"}
            </Button>
          </DialogActions>
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
