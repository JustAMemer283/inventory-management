# Inventory Management System

A full-stack inventory management application built with React and MongoDB.

## Features

- User Authentication
- Sales Recording
- Inventory Management
- Transaction History with Filters

## Tech Stack

- Frontend: React.js, Material-UI
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── services/      # API services
  ├── utils/         # Utility functions
  ├── context/       # React context providers
  └── assets/        # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
