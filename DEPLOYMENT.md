# Deployment Guide for Smoky Seven

This guide provides step-by-step instructions for deploying the Smoky Seven to Vercel.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher)
- [Git](https://git-scm.com/)
- [Vercel CLI](https://vercel.com/cli) (optional, but recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

## Deployment Steps

### 1. Prepare Your MongoDB Database

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster or use an existing one
3. Set up database access:
   - Create a database user with read/write permissions
   - Add your IP address to the IP access list (or allow access from anywhere for testing)
4. Get your connection string:
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`)

### 2. Prepare Your Local Project

1. Clone the repository (if you haven't already):

   ```bash
   git clone https://github.com/mccharliesins/inventory-management.git
   cd inventory-management
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the deployment preparation script:

   ```bash
   npm run deploy-prep
   ```

4. Test the deployment setup:
   ```bash
   npm run test-deployment
   ```

### 3. Deploy to Vercel

#### Option 1: Using Vercel CLI

1. Install Vercel CLI (if not already installed):

   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:

   ```bash
   vercel login
   ```

3. Deploy to Vercel:

   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

#### Option 2: Using Vercel Dashboard

1. Push your code to GitHub:

   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Other
   - Build Command: `npm run vercel-build`
   - Output Directory: `build`
   - Install Command: `npm install`

### 4. Set Environment Variables in Vercel

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT token generation
   - `NODE_ENV`: Set to `production`

### 5. Verify Deployment

1. Once deployed, Vercel will provide you with a URL (e.g., `https://inventory-management-xyz.vercel.app`)
2. Visit the URL to ensure the frontend is working
3. Test the API by visiting `https://inventory-management-xyz.vercel.app/api/health`
4. Log in to the application and verify that all features are working correctly

## Troubleshooting

### Database Connection Issues

- Verify that your MongoDB Atlas cluster is running
- Check that your IP address is allowed in the MongoDB Atlas Network Access settings
- Ensure the connection string in the environment variables is correct
- Check the Vercel logs for any connection errors

### API Errors

- Check the Vercel logs for any server-side errors
- Verify that all environment variables are set correctly
- Ensure that the API routes are configured correctly in `vercel.json`

### Frontend Issues

- Clear your browser cache and reload the page
- Check the browser console for any JavaScript errors
- Verify that the API URL in the frontend is configured correctly

## Maintenance

### Updating Your Deployment

1. Make changes to your local repository
2. Run the deployment preparation script:
   ```bash
   npm run deploy-prep
   ```
3. Test your changes locally:
   ```bash
   npm run dev
   ```
4. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
5. If you've set up automatic deployments with Vercel, your changes will be deployed automatically
6. Otherwise, run:
   ```bash
   vercel --prod
   ```

### Monitoring

- Use the Vercel dashboard to monitor your deployment
- Check the logs for any errors
- Set up alerts for deployment failures

## Support

If you encounter any issues with the deployment, please open an issue in the repository or contact the developer at [LinkedIn](https://linkedin.com/in/mccharliesins).
