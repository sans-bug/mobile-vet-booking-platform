# 🐾 VetConnect — Mobile Veterinary Services Booking Platform

A full-stack, production-ready web application connecting pet owners with verified veterinarians for clinic visits, online consultations, and emergency home dispatches.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** ≥ 18.x
- **MongoDB** running locally (`mongodb://localhost:27017`) **or** a MongoDB Atlas connection string
- **npm** ≥ 9.x

---

### 1. Clone & Setup

```bash
cd mobile-vet-booking-platform
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy the environment template and configure:
```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Edit `.env` — the defaults use **mock mode** for Stripe and Azure, so no external credentials are needed to run locally.

Start the backend server:
```bash
npm run dev
```

The API server will start at: **http://localhost:5000**

### 3. Seed the Database (optional but recommended)

```bash
npm run seed
```

This populates the database with sample accounts, pets, veterinarians, appointments, reviews, and notifications.

### 4. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The React app will start at: **http://localhost:3000**

---

## 🧪 Demo Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@vetconnect.com | admin123 |
| **Pet Owner** | user@vetconnect.com | user123 |
| **Veterinarian** | vet1@vetconnect.com | vet123 |
| **Veterinarian 2** | vet2@vetconnect.com | vet123 |

---

## 📁 Project Structure

```
mobile-vet-booking-platform/
├── backend/
│   ├── src/
│   │   ├── config/         # DB, Azure Blob, Stripe, Seeder
│   │   ├── controllers/    # Auth, Pets, Bookings, Chat, Admin, Analytics, SOS
│   │   ├── middleware/     # JWT Auth, Error handler
│   │   ├── models/         # Mongoose Schemas
│   │   ├── routes/         # Express route modules
│   │   └── index.ts        # Server entry point
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── web.config          # Azure App Service IISNode config
│
├── frontend/
│   ├── public/
│   │   └── staticwebapp.config.json  # Azure Static Web Apps routing
│   ├── src/
│   │   ├── components/     # Navbar, Footer, Sidebar, SOSButton, AIChatbotModal
│   │   ├── context/        # AuthContext, ThemeContext
│   │   ├── pages/          # All page components
│   │   ├── App.tsx         # Router & layout wrapper
│   │   ├── main.tsx        # React entry point
│   │   └── index.css       # Global Tailwind + animations
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.app.json
│
├── azure/
│   ├── azure-pipelines.yml           # Azure DevOps CI/CD pipeline
│   └── staticwebapp.config.json      # Azure SWA deployment config
│
└── README.md
```

---

## 🌐 API Reference

All endpoints are prefixed with `/api`.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user (pet owner or vet) |
| POST | `/auth/login` | Email + password login |
| POST | `/auth/google-login` | Google OAuth token exchange |
| POST | `/auth/forgot-password` | Send password reset link |
| GET | `/auth/me` | Get current authenticated user |
| PUT | `/auth/update-profile` | Update profile and vet credentials |

### Pets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pets` | List owner's pets |
| POST | `/pets` | Add a new pet |
| GET | `/pets/:id` | Get pet by ID |
| PUT | `/pets/:id` | Update pet info |
| DELETE | `/pets/:id` | Remove pet |
| POST | `/pets/:id/weight` | Log weight entry |
| POST | `/pets/:id/vaccination` | Add vaccination record |

### Bookings & Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings/vets` | Search verified veterinarians |
| POST | `/bookings` | Create appointment + Stripe payment intent |
| GET | `/bookings` | List appointments (role-filtered) |
| POST | `/bookings/confirm-payment` | Confirm Stripe payment |
| PUT | `/bookings/:id/status` | Update status (confirm/cancel/complete) |
| PUT | `/bookings/:id/prescription` | Add digital prescription |
| POST | `/bookings/:id/report` | Upload medical report PDF |

### Emergency SOS
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/emergencies/sos` | Broadcast SOS alert |
| GET | `/emergencies/requests` | List SOS alerts (vet/admin) |
| PUT | `/emergencies/requests/:id/respond` | Update dispatch status |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reviews` | Submit appointment review |
| GET | `/reviews/vet/:vetId` | Get all reviews for a vet |

### Chat & AI Bot
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/bot` | AI pet care FAQ chatbot |
| GET | `/chat/contacts` | List chat contacts |
| GET | `/chat/messages/:userId` | Get message thread |
| POST | `/chat/messages` | Send a message |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/admin` | Platform-wide analytics (admin only) |
| GET | `/analytics/vet` | Veterinarian income & schedule analytics |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List all users |
| DELETE | `/admin/users/:id` | Delete user account |
| GET | `/admin/vets` | List all veterinarians |
| PUT | `/admin/vets/:id/verify` | Approve or reject vet license |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get user's notifications |
| PUT | `/notifications/mark-read` | Mark all notifications as read |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| Charts | Chart.js + React-Chartjs-2 |
| Icons | Lucide React |
| State | React Context API + TanStack React Query |
| Forms | React Hook Form |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (HTTP Bearer token) |
| Payments | Stripe (with sandbox mock mode) |
| Cloud Storage | Azure Blob Storage (with local filesystem mock) |
| Security | Helmet, CORS, Rate Limiter, bcrypt |

---

## ☁️ Azure Deployment

### Backend → Azure App Service

1. Create an **Azure App Service** (Node.js 20 LTS)
2. Add all environment variables from `.env.example` to App Settings
3. Set `MOCK_STRIPE=false` and `MOCK_AZURE_STORAGE=false` with real credentials
4. Deploy using Azure DevOps pipeline in `azure/azure-pipelines.yml`

### Frontend → Azure Static Web Apps

1. Create an **Azure Static Web App** resource
2. Connect to your GitHub repo
3. Set build settings:
   - **App location**: `frontend`
   - **Output location**: `dist`
4. Add `VITE_API_BASE_URL=https://your-api.azurewebsites.net/api` as an environment variable

---

## 🔐 Environment Variables

See [`backend/.env.example`](backend/.env.example) for the full reference.

Key variables:
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `MOCK_STRIPE` | `true` = sandbox mode, `false` = real Stripe |
| `STRIPE_SECRET_KEY` | Stripe secret key (production) |
| `MOCK_AZURE_STORAGE` | `true` = local files, `false` = real Azure |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob Storage connection |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |

---

## ✨ Key Features

- 🐾 **Multi-pet household support** with individual health profiles
- 📈 **Growth tracker** with interactive weight history charts
- 💉 **Vaccination calendar** with next-due-date reminders
- 📅 **Multi-step booking wizard** with real Stripe checkout
- 🚨 **Emergency SOS** with browser GPS dispatch to nearby vets
- 🤖 **AI Pet Care Chatbot** with symptom guidance
- 💬 **Live chat** between owners and veterinarians
- 📋 **Digital prescriptions** issued by doctors post-appointment
- 📁 **Medical report uploads** (Azure Blob / local storage)
- 🌙 **Dark/Light mode** with localStorage persistence
- 📱 **Fully responsive** — desktop, tablet, and mobile
- 🔒 **Role-based access** — Pet Owner, Veterinarian, Admin

---

## 📄 License

MIT License — VetConnect © 2026
