import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";

// inventory page component with real-time updates
const Inventory = () => {
  // sample product data
  const [products, setProducts] = useState([
    { id: 1, name: "product 1", quantity: 10 },
    { id: 2, name: "product 2", quantity: 20 },
    { id: 3, name: "product 3", quantity: 15 },
  ]);

  // new product state
  const [newProduct, setNewProduct] = useState({ name: "", quantity: "" });

  // handle add product
  const handleAddProduct = () => {
    if (newProduct.name && newProduct.quantity) {
      setProducts([
        ...products,
        {
          id: products.length + 1,
          name: newProduct.name,
          quantity: parseInt(newProduct.quantity),
        },
      ]);
      setNewProduct({ name: "", quantity: "" });
    }
  };

  // handle input change
  const handleInputChange = (field) => (event) => {
    setNewProduct({
      ...newProduct,
      [field]: event.target.value,
    });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          inventory management
        </Typography>

        {/* add new product form */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            add new product
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="product name"
              value={newProduct.name}
              onChange={handleInputChange("name")}
              fullWidth
            />
            <TextField
              label="quantity"
              type="number"
              value={newProduct.quantity}
              onChange={handleInputChange("quantity")}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleAddProduct}
              disabled={!newProduct.name || !newProduct.quantity}
            >
              add
            </Button>
          </Box>
        </Paper>

        {/* product list */}
        <Paper>
          <List>
            {products.map((product) => (
              <ListItem key={product.id}>
                <ListItemText
                  primary={product.name}
                  secondary={`quantity: ${product.quantity}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default Inventory;
