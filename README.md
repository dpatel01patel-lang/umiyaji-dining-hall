# 🍽️ Umiya Ji Dining Hall Management System

A complete tiffin service management system built with React, Node.js, and MongoDB. This system helps dining halls manage their tiffin subscriptions, meal orders, attendance, and billing efficiently.

## 🚀 Features

### Admin Panel
- **📊 Dashboard:** Real-time analytics and overview
- **👥 Client Management:** Add, edit, and manage clients
- **🍽️ Menu Management:** Create and update meal menus
- **📋 Order Management:** Track and manage meal orders
- **📝 Subscription Plans:** Create and manage tiffin plans (Weekly/Monthly)
- **📈 Attendance Tracking:** Monitor student meal attendance
- **💰 Billing System:** Generate and manage bills
- **📢 Notifications:** Send updates to clients

### Student Portal
- **🍽️ Menu Browsing:** View daily meal menus
- **📦 Order Meals:** Place individual meal orders
- **📅 Subscription Plans:** Subscribe to weekly/monthly tiffin plans
- **📋 Attendance History:** View personal meal attendance
- **💳 Billing History:** Check payment history and download bills
- **🔔 Notifications:** Receive service updates

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **Lucide React** - Beautiful icons
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **PDFKit** - PDF generation

### Deployment
- **Render** - Cloud hosting platform
- **MongoDB Atlas** - Cloud database
- **GitHub** - Version control and CI/CD

## 📁 Project Structure

```
umiya-dining-hall/
├── backend/                 # Node.js API server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication & validation
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── render.yaml         # Render deployment config
│
├── front/                  # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   │   ├── admin/      # Admin panel pages
│   │   │   └── student/    # Student portal pages
│   │   ├── lib/            # Utilities and API calls
│   │   └── hooks/          # Custom React hooks
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── render.yaml         # Render deployment config
│
├── .github/workflows/      # GitHub Actions for CI/CD
├── DEPLOYMENT.md           # Detailed deployment guide
└── README.md              # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- Git

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd umiya-dining-hall
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your MongoDB URI and other configs
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd front
   npm install
   cp .env.example .env
   # Update .env with your API URL
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

### Default Admin Credentials
- **Email:** admin@umiyajidining.com
- **Password:** Admin123!@#

## 🌐 Live Demo

- **Frontend:** [https://umiya-dining-frontend.onrender.com](https://umiya-dining-frontend.onrender.com)
- **Backend API:** [https://umiya-dining-backend.onrender.com](https://umiya-dining-backend.onrender.com)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - User registration

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Meals
- `GET /api/meals` - Get all meals
- `POST /api/meals` - Create new meal
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

### Attendance
- `GET /api/attendance` - Get all attendance records
- `POST /api/attendance` - Record attendance
- `GET /api/attendance/student/:phone/history` - Get student attendance history

### Bills
- `GET /api/bills` - Get all bills
- `POST /api/bills/generate` - Generate new bill
- `GET /api/bills/student/:phone` - Get student bills

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/umiya-dining-hall
JWT_SECRET=your-jwt-secret
ADMIN_NAME=Umiya Ji Dining Hall
ADMIN_EMAIL=admin@umiyajidining.com
ADMIN_PASSWORD=Admin123!@#
CORS_ORIGINS=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Umiya Ji Dining Hall
```

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

Quick deployment steps:
1. Push code to GitHub
2. Set up MongoDB Atlas
3. Deploy backend to Render
4. Deploy frontend to Render
5. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Review the logs in your hosting dashboard
- Check browser console for frontend issues

---

**Built with ❤️ for Umiya Ji Dining Hall**