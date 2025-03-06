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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
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
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    quantity: "",
    backupQuantity: "",
    imageUrl: "",
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
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // handle form input change
  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  // handle dialog open
  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        brand: product.brand,
        quantity: product.quantity,
        backupQuantity: product.backupQuantity,
        imageUrl: product.imageUrl || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        brand: "",
        quantity: "",
        backupQuantity: "",
        imageUrl: "",
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
      imageUrl: "",
    });
  };

  // handle form submit
  const handleSubmit = async () => {
    try {
      if (editingProduct) {
        await productApi.update(editingProduct._id, formData);
      } else {
        await productApi.add(formData);
      }
      await fetchProducts();
      handleCloseDialog();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // handle delete product
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productApi.delete(id);
        await fetchProducts();
        setError(null);
      } catch (err) {
        setError(err.message);
      }
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
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4" component="h1">
            Inventory Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Product
          </Button>
        </Box>

        {/* error alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* products grid */}
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card>
                {product.imageUrl && (
                  <Box
                    component="img"
                    src={product.imageUrl}
                    alt={product.name}
                    sx={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                    }}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Brand: {product.brand}
                  </Typography>
                  <Typography variant="body2">
                    Quantity: {product.quantity}
                  </Typography>
                  <Typography variant="body2">
                    Backup Quantity: {product.backupQuantity}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(product)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(product._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

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
              <TextField
                label="Image URL"
                value={formData.imageUrl}
                onChange={handleInputChange("imageUrl")}
                fullWidth
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
      </Box>
    </Container>
  );
};

export default Inventory;
