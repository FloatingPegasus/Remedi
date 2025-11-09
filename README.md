# Re-medi - Healthcare Appointment Management System

A full-stack healthcare appointment booking and management platform built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)

---

## ✨ Features

### For Patients (Frontend)
- 👤 User registration and authentication
- 🔍 Browse and search doctors by speciality
- 📅 Book appointments with available time slots
- 💳 Online payment integration (Stripe & Razorpay)
- 📋 View and manage appointments
- 👨‍⚕️ View doctor profiles and specialities
- 💊 Medicine reminder system (set, view, and delete reminders)
- 🤖 AI Tools (coming soon - disease prediction & diagnosis)

### For Admins (Admin Panel)
- 🏥 Add and manage doctors
- 📊 Dashboard with analytics
- 📋 View all appointments
- ❌ Cancel appointments
- 👥 Manage doctor availability

### For Doctors (Doctor Panel)
- 📅 View assigned appointments
- ✅ Mark appointments as complete
- 💰 Track earnings
- 📊 Personal dashboard
- 🔄 Toggle availability status

---

## 🛠️ Tech Stack

**Frontend:**
- React 18.3
- React Router DOM 6.25
- Axios
- Tailwind CSS
- Vite

**Backend:**
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- JWT Authentication
- Bcrypt for password hashing

**Cloud Services:**
- MongoDB Atlas (Database)
- Cloudinary (Image Storage)
- Stripe (Payment Gateway)
- Razorpay (Payment Gateway)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Cloudinary Account** - [Sign up](https://cloudinary.com/)

### Verify Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version
```

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd prescripto-full-stack
```

### Step 2: Install Dependencies

**Install Backend Dependencies:**
```bash
cd backend
npm install
```

**Install Frontend Dependencies:**
```bash
cd ../frontend
npm install
```

**Install Admin Panel Dependencies:**
```bash
cd ../admin
npm install
```

---

## ⚙️ Environment Setup

### Backend Environment Variables

1. Navigate to the `backend` folder
2. The `.env` file should already exist with the following structure:

```env
# Currency
CURRENCY = "INR"

# JWT Secret (use a strong random string)
JWT_SECRET="your_jwt_secret_here"

# Admin Panel Credentials
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "your_admin_password"

# MongoDB Atlas Setup (REQUIRED)
MONGODB_URI = "mongodb+srv://username:password@cluster.mongodb.net"

# Cloudinary Setup (REQUIRED)
CLOUDINARY_NAME = "your_cloudinary_cloud_name"
CLOUDINARY_API_KEY = "your_cloudinary_api_key"
CLOUDINARY_SECRET_KEY = "your_cloudinary_secret_key"

# Payment Gateway - Razorpay (Optional)
RAZORPAY_KEY_ID = "your_razorpay_key_id"
RAZORPAY_KEY_SECRET = "your_razorpay_key_secret"

# Payment Gateway - Stripe (Optional)
STRIPE_SECRET_KEY = "your_stripe_secret_key"
```

**Important:** Replace the placeholder values with your actual credentials!

### Frontend Environment Variables

1. Navigate to the `frontend` folder
2. The `.env` file should contain:

```env
VITE_BACKEND_URL = 'http://localhost:4000'
VITE_RAZORPAY_KEY_ID = 'your_razorpay_key_id'
```

### Admin Panel Environment Variables

1. Navigate to the `admin` folder
2. Create a `.env` file with:

```env
VITE_BACKEND_URL = 'http://localhost:4000'
```

---

## 🎯 Running the Application

### Step 1: Start the Backend Server

Open a new terminal and run:

```bash
cd backend
node server.js
```

**Expected Output:**
```
✅ Database Connected Successfully
📍 Database: remedi (MongoDB Atlas)
✅ Cloudinary Connected Successfully

🚀 Server started successfully on PORT: 4000
📡 API URL: http://localhost:4000
💚 All systems ready!
```

**Keep this terminal running!**

---

### Step 2: Start the Frontend (User Portal)

Open a **new terminal** and run:

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Access:** Open your browser and go to `http://localhost:5173/`

---

### Step 3: Start the Admin Panel (Optional)

Open a **new terminal** and run:

```bash
cd admin
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5174/
➜  Network: use --host to expose
```

**Access:** Open your browser and go to `http://localhost:5174/`

**Login with:**
- Email: The `ADMIN_EMAIL` from your backend `.env`
- Password: The `ADMIN_PASSWORD` from your backend `.env`

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. **Backend Won't Start**

**Problem:** `Cannot find module` or `MONGODB_URI is not defined`

**Solution:**
- Check that you're in the `backend` folder
- Verify `.env` file exists in `backend` folder
- Ensure all environment variables are set correctly
- Check MongoDB Atlas connection string is valid

---

#### 2. **Frontend Shows Blank Page**

**Problem:** Page doesn't load or shows errors

**Solution:**
```bash
# Clear localStorage
# Open browser console (F12) and run:
localStorage.clear()

# Then refresh the page
```

---

#### 3. **"Create Account" Button Not Working**

**Problem:** Button flickers and returns to home page

**Solution:**
```javascript
// Open browser console (F12) and run:
localStorage.clear()
// Then refresh the page
```

---

#### 4. **Cannot Add Doctor (Image Upload Fails)**

**Problem:** Error when trying to add a doctor

**Solution:**
- Verify Cloudinary credentials in backend `.env`
- Ensure image file is selected
- Check that backend server is running
- Verify you're logged in as admin

---

#### 5. **Database Connection Failed**

**Problem:** `Failed to connect to MongoDB Atlas`

**Solutions:**
1. **Check IP Whitelist:**
   - Go to MongoDB Atlas Dashboard
   - Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (for development)

2. **Check Connection String:**
   - Ensure no spaces in MONGODB_URI
   - Verify username and password are correct
   - Don't use `@` symbol in password (causes issues)

3. **Check Database User:**
   - Go to Database Access in MongoDB Atlas
   - Ensure user has read/write permissions

---

#### 6. **Port Already in Use**

**Problem:** `EADDRINUSE: address already in use :::4000`

**Solution (Windows PowerShell):**
```powershell
# Find and kill the process using port 4000
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process -Force
```

**Solution (Mac/Linux):**
```bash
# Find and kill the process using port 4000
lsof -ti:4000 | xargs kill -9
```

---

#### 7. **PowerShell Script Execution Error**

**Problem:** `running scripts is disabled on this system`

**Solution:**
```powershell
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try running npm commands again
```

---

## 📁 Project Structure

```
prescripto-full-stack/
│
├── backend/                 # Backend API Server
│   ├── config/             # Configuration files
│   │   ├── mongodb.js      # MongoDB connection
│   │   └── cloudinary.js   # Cloudinary configuration
│   ├── controllers/        # Request handlers
│   │   ├── adminController.js
│   │   ├── doctorController.js
│   │   ├── userController.js
│   │   └── reminderController.js
│   ├── middleware/         # Custom middleware
│   │   ├── authAdmin.js
│   │   ├── authDoctor.js
│   │   ├── authUser.js
│   │   └── multer.js
│   ├── models/             # Database schemas
│   │   ├── doctorModel.js
│   │   ├── userModel.js
│   │   ├── appointmentModel.js
│   │   └── reminderModel.js
│   ├── routes/             # API routes
│   │   ├── adminRoute.js
│   │   ├── doctorRoute.js
│   │   ├── userRoute.js
│   │   └── reminderRoute.js
│   ├── .env               # Environment variables (DO NOT COMMIT)
│   ├── server.js          # Entry point
│   └── package.json
│
├── frontend/               # User-facing application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context
│   │   ├── assets/        # Images, icons
│   │   └── App.jsx        # Main app component
│   ├── .env              # Frontend environment variables
│   └── package.json
│
├── admin/                 # Admin panel
│   ├── src/
│   │   ├── components/   # Admin components
│   │   ├── pages/        # Admin pages
│   │   ├── context/      # Admin context
│   │   └── App.jsx
│   ├── .env             # Admin environment variables
│   └── package.json
│
└── README.md            # This file
```

---

## 🌐 API Endpoints

### Base URL: `http://localhost:4000`

### User Endpoints (`/api/user`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /get-profile` - Get user profile
- `POST /update-profile` - Update user profile
- `POST /book-appointment` - Book an appointment
- `GET /appointments` - Get user appointments
- `POST /cancel-appointment` - Cancel appointment
- `POST /payment-stripe` - Stripe payment
- `POST /payment-razorpay` - Razorpay payment

### Admin Endpoints (`/api/admin`)
- `POST /login` - Admin login
- `POST /add-doctor` - Add new doctor
- `GET /all-doctors` - Get all doctors
- `GET /appointments` - Get all appointments
- `POST /cancel-appointment` - Cancel appointment
- `POST /change-availability` - Change doctor availability
- `GET /dashboard` - Admin dashboard data

### Doctor Endpoints (`/api/doctor`)
- `POST /login` - Doctor login
- `GET /appointments` - Get doctor appointments
- `POST /complete-appointment` - Mark appointment complete
- `POST /cancel-appointment` - Cancel appointment
- `GET /dashboard` - Doctor dashboard
- `GET /profile` - Get doctor profile
- `POST /update-profile` - Update doctor profile
- `GET /list` - Get all doctors (public)

### Reminder Endpoints (`/api/reminders`)
- `POST /add` - Add new medicine reminder (requires auth)
- `GET /list` - Get all user reminders (requires auth)
- `DELETE /:id` - Delete a reminder (requires auth)

---

## 🔒 Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong passwords** for admin accounts
3. **Keep JWT secrets complex** and secure
4. **Regularly update dependencies** for security patches
5. **Use HTTPS** in production
6. **Whitelist specific IPs** in MongoDB Atlas for production

---

## 🚦 Shutting Down the Application

### Proper Shutdown Procedure:

1. **Stop Frontend/Admin:**
   - Press `Ctrl + C` in the terminal running the dev server

2. **Stop Backend:**
   - Press `Ctrl + C` in the terminal running the backend server

**Your data is safe!** All data is stored in MongoDB Atlas (cloud) and persists even when servers are stopped.

---

## 📝 Development Notes

### Adding a New Doctor:
1. Start all servers (backend + admin)
2. Login to admin panel (`http://localhost:5174`)
3. Navigate to "Add Doctor"
4. Fill in all required fields
5. Upload doctor image
6. Click "Add Doctor"

### Testing User Registration:
1. Start backend + frontend servers
2. Go to `http://localhost:5173`
3. Click "Create Account"
4. Fill registration form
5. Password must be at least 8 characters

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👥 Authors

**Team Kasam**

---

## 🆘 Support

If you encounter any issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Verify all environment variables are correctly set
3. Ensure MongoDB Atlas IP whitelist is configured
4. Check that all three servers are running
5. Clear browser cache and localStorage

For additional help, please open an issue in the repository.

---

## 🎉 Success Checklist

- [ ] Node.js and npm installed
- [ ] MongoDB Atlas account created and cluster set up
- [ ] Cloudinary account created
- [ ] All dependencies installed (`npm install` in all 3 folders)
- [ ] Environment variables configured in all `.env` files
- [ ] Backend server running on port 4000
- [ ] Frontend server running on port 5173
- [ ] Admin panel running on port 5174
- [ ] Can access frontend in browser
- [ ] Can login to admin panel
- [ ] Can add a doctor successfully
- [ ] Can register a user successfully

---

**🎊 Congratulations! Your Re-medi application is now running successfully!**

For questions or support, contact: damnbrocrazy@gmail.com


