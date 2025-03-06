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
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
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

  // handle dialog open
  const handleOpenDialog = (product) => {
    setSelectedProduct(product);
    setQuantity("");
    setOpenDialog(true);
  };

  // handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    setQuantity("");
  };

  // handle sale submit
  const handleSubmit = async () => {
    try {
      if (!quantity || quantity <= 0) {
        setError("Please enter a valid quantity");
        return;
      }

      const saleData = {
        productId: selectedProduct._id,
        quantity: parseInt(quantity),
        timestamp: new Date(),
      };

      await productApi.recordSale(saleData);
      await fetchProducts();
      handleCloseDialog();
      setError(null);
    } catch (err) {
      setError(err.message);
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
        <Typography variant="h4" component="h1" gutterBottom>
          Record Sales
        </Typography>

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
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Brand: {product.brand}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Price: ${product.price}
                  </Typography>
                  <Typography variant="body2">
                    Available: {product.quantity}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog(product)}
                    disabled={product.quantity <= 0}
                  >
                    Record Sale
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* record sale dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Record Sale</DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <Typography variant="h6">{selectedProduct?.name}</Typography>
              <Typography color="textSecondary">
                Available: {selectedProduct?.quantity}
              </Typography>
              <TextField
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                fullWidth
                required
                inputProps={{ min: 1, max: selectedProduct?.quantity }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              Record Sale
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Sales;
