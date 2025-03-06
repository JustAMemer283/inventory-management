import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

// navigation component with app bar
const Navigation = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          inventory management
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">
            home
          </Button>
          <Button color="inherit" component={RouterLink} to="/inventory">
            inventory
          </Button>
          <Button color="inherit" component={RouterLink} to="/sales">
            sales
          </Button>
          <Button color="inherit" component={RouterLink} to="/transactions">
            transactions
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
