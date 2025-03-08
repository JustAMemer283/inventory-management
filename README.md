# Inventory Management System

A modern, feature-rich inventory management system built with React and Material-UI. Perfect for small to medium businesses to track inventory, manage sales, and monitor transactions in real-time.

## ✨ Features

### 📦 Inventory Management

- Add, edit, and delete products with brand and name
- Track main stock and backup quantities
- Quick Look feature for instant inventory status
- Flexible search with partial matching across brand and product names
- Automatic stock validation and low stock alerts

### 💰 Sales Management

- Easy product selection with smart search
- Quick sale processing with quantity validation
- Custom date/time selection for sales records
- Real-time stock updates
- Automatic backup stock utilization
- Sale confirmation with detailed summaries

### 📊 Transaction History

- Comprehensive transaction logging
- Advanced filtering options:
  - Date and time range filters
  - Transaction type filters (SALE, NEW, ADD, EDIT, DELETE, TRANSFER)
  - Employee filters
  - Brand and product filters
- Daily sales reports with copy functionality
- Dark-themed date headers for better readability

### 🎨 User Interface

- Modern Material-UI design
- Responsive layout for all devices
- Intuitive navigation
- Dark mode support
- Toast notifications for actions
- Confirmation dialogs for critical operations

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/inventory-management.git
cd inventory-management
```

2. Install dependencies

```bash
npm install
# or if using yarn
yarn install
```

3. Start the development server

```bash
npm start
# or using yarn
yarn start
```

The application will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

## 🚀 Deployment

### Deploying to Vercel

This project is configured for seamless deployment to Vercel. Follow these steps:

1. Prepare for deployment

```bash
npm run deploy-prep
```

2. Deploy using Vercel CLI

```bash
vercel
```

3. For production deployment

```bash
vercel --prod
```

### Environment Variables

Make sure to set these environment variables in your Vercel project settings:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `NODE_ENV`: Set to "production"

### Vercel Configuration

The project includes a `vercel.json` file that configures both the frontend and backend deployment. The configuration:

- Builds the Node.js server
- Serves the static frontend files
- Routes API requests to the server
- Routes all other requests to the frontend

## 📱 Usage

### Adding Products

1. Navigate to Inventory
2. Click "Add Product"
3. Fill in product details:
   - Brand
   - Product Name
   - Quantity
   - Backup Quantity
   - Price

### Recording Sales

1. Go to Sales page
2. Search and select product
3. Enter quantity
4. Optionally select custom date/time
5. Click "Record Sale"

### Viewing Transactions

1. Open Transaction History
2. Use filters to find specific transactions:
   - Date range
   - Transaction types
   - Employee
   - Brand/Product

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

```bash
git commit -m "feat: add amazing feature"
```

4. Push to the branch

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI for the amazing component library
- React community for excellent documentation
- All contributors who have helped shape this project

## 📞 Support

For support, please open an issue in the repository.

---

## 👨‍💻 Developer

Developed by McCharlie Sins (Venkateshwar Yadav)  
[Connect on LinkedIn](https://linkedin.com/in/mccharliesins)
