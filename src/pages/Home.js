import React, { useState } from "react";
import { Container, Typography, Box, TextField, Button } from "@mui/material";

// home page component with real-time updates
const Home = () => {
  const [welcomeMessage, setWelcomeMessage] = useState(
    "welcome to inventory management system"
  );

  // handle message update
  const handleUpdateMessage = (event) => {
    setWelcomeMessage(event.target.value);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {welcomeMessage}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="update welcome message"
            value={welcomeMessage}
            onChange={handleUpdateMessage}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            try editing the message above to see real-time updates
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
