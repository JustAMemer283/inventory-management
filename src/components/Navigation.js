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
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";

// navigation component
const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { themeMode, toggleTheme } = useThemeContext();
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
            color:
              item.color === "error"
                ? theme.palette.error.main
                : theme.palette.text.primary,
            backgroundColor: isActive(item.path)
              ? theme.palette.primary.main
              : "transparent",
            "&:hover": {
              backgroundColor:
                item.color === "error"
                  ? `${theme.palette.error.main}10`
                  : isActive(item.path)
                  ? theme.palette.primary.dark
                  : `${theme.palette.text.primary}10`,
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
      <Tooltip
        title={`Switch to ${themeMode === "dark" ? "light" : "dark"} theme`}
      >
        <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 1 }}>
          {themeMode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Tooltip>
    </>
  );

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom:
          theme.palette.mode === "dark"
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : "1px solid rgba(0, 0, 0, 0.1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", height: "70px" }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
            color: theme.palette.text.primary,
          }}
          onClick={() => navigate("/")}
        >
          Smoky Seven
        </Typography>

        {user && (
          <>
            {isMobile ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <Tooltip
                    title={`Switch to ${
                      themeMode === "dark" ? "light" : "dark"
                    } theme`}
                  >
                    <IconButton
                      onClick={toggleTheme}
                      color="inherit"
                      sx={{ mr: 1 }}
                    >
                      {themeMode === "dark" ? (
                        <Brightness7Icon />
                      ) : (
                        <Brightness4Icon />
                      )}
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="end"
                    onClick={handleDrawerToggle}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
                <Drawer
                  anchor="right"
                  open={mobileOpen}
                  onClose={handleDrawerToggle}
                  PaperProps={{
                    sx: {
                      backgroundColor: theme.palette.background.paper,
                      width: 200,
                      p: 2,
                    },
                  }}
                >
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        fontWeight: "bold",
                        mb: 2,
                        pb: 2,
                        borderBottom:
                          theme.palette.mode === "dark"
                            ? "1px solid rgba(255, 255, 255, 0.1)"
                            : "1px solid rgba(0, 0, 0, 0.1)",
                        color: theme.palette.text.primary,
                      }}
                    >
                      Smoky Seven
                    </Typography>
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
                          color:
                            item.color === "error"
                              ? theme.palette.error.main
                              : theme.palette.text.primary,
                          backgroundColor: isActive(item.path)
                            ? theme.palette.primary.main
                            : "transparent",
                          "&:hover": {
                            backgroundColor:
                              item.color === "error"
                                ? `${theme.palette.error.main}10`
                                : isActive(item.path)
                                ? theme.palette.primary.dark
                                : `${theme.palette.text.primary}10`,
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
