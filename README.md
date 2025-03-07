# Inventory Management System

A modern, feature-rich inventory management system built with React and Material-UI. This system helps businesses track inventory, manage sales, and monitor transactions in real-time.

## 🌟 Features

### Inventory Management

- Add, edit, and delete products with brand and name
- Track stock and backup quantities
- Quick Look feature for instant inventory status
- Flexible search with partial matching across brand and product names
- Automatic stock validation and low stock alerts

### Sales Management

- Easy product selection with search functionality
- Quick sale processing with quantity validation
- Real-time stock updates
- Sale confirmation with detailed summaries

### Transaction History

- Comprehensive transaction logging
- Advanced filtering options:
  - Date and time range filters
  - Transaction type filters (SALE, NEW, ADD, EDIT, DELETE, TRANSFER)
  - Employee filters
  - Brand and product filters
- Daily sales reports with copy functionality
- Dark-themed date headers for better readability

### User Interface

- Modern Material-UI design
- Responsive layout
- Intuitive navigation
- Dark mode support
- Toast notifications for actions
- Confirmation dialogs for critical operations

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Setup Instructions

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

3. Create a .env file in the root directory

```bash
cp .env.example .env
```

4. Update the .env file with your configuration

```
REACT_APP_API_URL=your_api_url
REACT_APP_API_KEY=your_api_key
```

5. Start the development server

```bash
npm start
# or using yarn
yarn start
```

The application will be available at `http://localhost:3000`

### Production Build

To create a production build:

```bash
npm run build
# or using yarn
yarn build
```

## 📚 Project Structure

```
inventory-management/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API and other services
│   ├── utils/         # Utility functions
│   ├── contexts/      # React contexts
│   └── App.js         # Main application component
├── public/            # Static files
└── package.json       # Project dependencies
```

## 🔧 Configuration

### Environment Variables

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_API_KEY`: API authentication key
- `REACT_APP_ENV`: Environment (development/production)

### API Integration

The system is designed to work with a RESTful API. Ensure your API implements the following endpoints:

- `/api/products` - Product management
- `/api/sales` - Sales operations
- `/api/transactions` - Transaction history
- `/api/auth` - Authentication

## 🤝 Contributing

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature/amazing-feature
```

3. Make your changes
4. Commit your changes

```bash
git commit -m "feat: add amazing feature"
```

5. Push to the branch

```bash
git push origin feature/amazing-feature
```

6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI for the amazing component library
- React community for the excellent documentation
- All contributors who have helped shape this project

## 📞 Support

For support, email support@yourdomain.com or open an issue in the repository.
