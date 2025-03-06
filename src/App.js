import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Navigation from "./components/Navigation";

// create theme
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

// main app component
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="app">
          <Navigation />
          <Routes>
            <Route path="/" element={<div>home page</div>} />
            <Route path="/inventory" element={<div>inventory page</div>} />
            <Route path="/sales" element={<div>sales page</div>} />
            <Route
              path="/transactions"
              element={<div>transactions page</div>}
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
