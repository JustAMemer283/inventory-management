import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../context/AuthContext";

// navigation component
const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: "Sales", path: "/sales" },
    ...(user?.role === "admin"
      ? [{ label: "Inventory", path: "/inventory" }]
      : []),
    { label: "History", path: "/transactions" },
    { label: "Logout", action: handleLogout, color: "error" },
  ];

  const isActive = (path) => {
    if (!path) return false; // For logout button
    return location.pathname === path;
  };

  const renderNavButtons = () => (
    <>
      {navItems.map((item) => (
        <Button
          key={item.label}
          onClick={item.action || (() => navigate(item.path))}
          sx={{
            color: item.color === "error" ? "#ff4d4d" : "#fff",
            backgroundColor: isActive(item.path) ? "#4477ff" : "transparent",
            "&:hover": {
              backgroundColor:
                item.color === "error"
                  ? "rgba(255, 77, 77, 0.1)"
                  : isActive(item.path)
                  ? "#3366cc"
                  : "rgba(255, 255, 255, 0.1)",
            },
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            minWidth: "100px",
            padding: "8px 20px",
          }}
        >
          {item.label}
        </Button>
      ))}
    </>
  );

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#141414",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", height: "70px" }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 600,
            cursor: "pointer",
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
          }}
          onClick={() => navigate("/")}
        >
          Inventory Management System
        </Typography>

        {user && (
          <>
            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleDrawerToggle}
                  sx={{ ml: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Drawer
                  anchor="right"
                  open={mobileOpen}
                  onClose={handleDrawerToggle}
                  PaperProps={{
                    sx: {
                      backgroundColor: "#141414",
                      width: 200,
                      p: 2,
                    },
                  }}
                >
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {navItems.map((item) => (
                      <Button
                        key={item.label}
                        fullWidth
                        onClick={() => {
                          if (item.action) {
                            item.action();
                          } else {
                            navigate(item.path);
                          }
                          handleDrawerToggle();
                        }}
                        sx={{
                          color: item.color === "error" ? "#ff4d4d" : "#fff",
                          backgroundColor: isActive(item.path)
                            ? "#4477ff"
                            : "transparent",
                          "&:hover": {
                            backgroundColor:
                              item.color === "error"
                                ? "rgba(255, 77, 77, 0.1)"
                                : isActive(item.path)
                                ? "#3366cc"
                                : "rgba(255, 255, 255, 0.1)",
                          },
                          justifyContent: "flex-start",
                          textTransform: "none",
                          fontWeight: 500,
                          padding: "10px 16px",
                          borderRadius: "8px",
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </Box>
                </Drawer>
              </>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>{renderNavButtons()}</Box>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
