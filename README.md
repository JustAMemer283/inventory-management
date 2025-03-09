# Smoky Seven Inventory Management System

A modern, feature-rich inventory management system built with the MERN stack (MongoDB, Express, React, Node.js) and Material-UI. Perfect for small to medium businesses to track inventory, manage sales, and monitor transactions in real-time.

## 📸 Application Screenshots

### Login Screen

<!-- SCREENSHOT 1: Add a screenshot of the login page -->

### Dashboard/Home

<!-- SCREENSHOT 2: Add a screenshot of the dashboard/home page -->

### Inventory Management

<!-- SCREENSHOT 3: Add a screenshot of the inventory management page -->

### Sales Interface

<!-- SCREENSHOT 4: Add a screenshot of the sales interface -->

### Transaction History

<!-- SCREENSHOT 5: Add a screenshot of the transaction history page with filters -->

### Reports

<!-- SCREENSHOT 6: Add a screenshot of a generated report -->

## ✨ Features

### 📦 Inventory Management

- **Product Management**

  - Add, edit, and delete products with brand and name
  - Track main stock and backup quantities
  - Quick Look feature for instant inventory status
  - Automatic stock validation and low stock alerts

- **Search and Filter**
  - Flexible search with partial matching across brand and product names
  - Filter products by brand, stock status, and more
  - Sort products by various attributes

<!-- SCREENSHOT 7: Add a screenshot of the inventory search and filter functionality -->

### 💰 Sales Management

- **Intuitive Sales Interface**

  - Easy product selection with smart search
  - Quick sale processing with quantity validation
  - Real-time stock updates
  - Automatic backup stock utilization when main stock is depleted

- **Custom Sales Records**
  - Custom date/time selection for sales records
  - Sale confirmation with detailed summaries
  - Ability to record historical sales

<!-- SCREENSHOT 8: Add a screenshot of the sales process or confirmation -->

### 📊 Transaction History

- **Comprehensive Transaction Logging**

  - All inventory changes are tracked (SALE, NEW, ADD, EDIT, DELETE, TRANSFER)
  - Detailed information for each transaction

- **Advanced Filtering**
  - Date and time range filters
  - Transaction type filters
  - Employee filters
  - Brand and product filters

<!-- SCREENSHOT 9: Add a screenshot of the transaction filters in action -->

- **Reporting Tools**
  - Daily sales reports with copy functionality
  - Download reports as images for sharing
  - Delete older transactions with password confirmation

<!-- SCREENSHOT 10: Add a screenshot of the report generation or download feature -->

### 🔐 User Authentication & Authorization

- **Secure Login System**

  - JWT-based authentication
  - Password encryption
  - Session management

- **Role-Based Access Control**
  - Admin and regular user roles
  - Feature access based on user role
  - Protected routes

<!-- SCREENSHOT 11: Add a screenshot showing role-based features or admin panel -->

### 🎨 Modern UI/UX

- **Material Design**

  - Clean, intuitive interface
  - Responsive layout for all devices
  - Consistent design language

- **User Experience Enhancements**
  - Toast notifications for actions
  - Loading indicators
  - Confirmation dialogs for critical operations
  - Form validation

<!-- SCREENSHOT 12: Add a screenshot showing the responsive design on mobile -->

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/mccharliesins/inventory-management.git
cd inventory-management
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

4. Start the development server

```bash
# Start backend server
npm run server

# Start frontend development server
npm run client

# Run both concurrently
npm run dev
```

## 🛠️ Technologies Used

- **Frontend**

  - React.js
  - Material-UI
  - React Router
  - Context API for state management
  - Axios for API requests
  - date-fns for date manipulation
  - html2canvas for report image generation

- **Backend**

  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JSON Web Tokens (JWT) for authentication
  - bcrypt for password hashing

- **Development Tools**
  - Git for version control
  - ESLint for code linting
  - Prettier for code formatting
  - Concurrently for running multiple scripts

## 📱 Mobile Responsiveness

The application is fully responsive and works seamlessly on:

- Desktop computers
- Tablets
- Mobile phones

<!-- SCREENSHOT 13: Add a screenshot showing the app on different devices -->

## 🔄 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/current-user` - Get current user
- `POST /api/auth/verify-password` - Verify user password for sensitive operations

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PUT /api/products/:id/stock` - Update product stock
- `POST /api/products/sale` - Record a sale

### Transactions

- `GET /api/transactions` - Get all transactions with filters
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get transaction by ID
- `DELETE /api/transactions/older-than/:days` - Delete transactions older than specified days

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ by Smoky Seven
