
# Omnichannel POS System

A scalable full-stack Omnichannel POS system built with Node.js, Express.js, TypeScript, MongoDB, and Redis.

## 🚀 Features
- JWT Authentication
- Role-Based Access Control (RBAC)
- Product & Inventory Management
- Order Management
- Dockerized Setup
- REST API Architecture

## 🛠️ Tech Stack
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- Redis
- Docker

## 📁 Project Structure

```bash
omnichannel-pos/
├── client/
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── types/
├── docker-compose.yml
└── README.md
```

## ⚙️ Setup

### Clone Repository
```bash
git clone https://github.com/Raunak-K-Chirania/omnichannel-pos.git
```

### Install Dependencies
```bash
cd server
npm install
```

### Run Docker Services
```bash
docker-compose up -d
```

### Start Development Server
```bash
npm run dev
```

## 🔐 Authentication Routes

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /api/auth/register | Register User |
| POST | /api/auth/login | Login User |
| GET | /api/auth/me | Get Current User |

## 🧪 Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run test
npm run lint
```




## Inventory Routes

Created `inventoryRoutes.ts` and added:

* GET `/api/inventory`
* GET `/api/inventory/low-stock`
* PUT `/api/inventory/:id`

Integrated routes into Express app.

---

## Middleware Updates

Updated authentication middleware:

* Added `protect` middleware for JWT verification.
* Added `authorize` middleware for role-based access.

---

## Swagger Documentation

Added Swagger API documentation for:

* Inventory APIs
* Authentication APIs

Verified APIs are visible and working in Swagger UI.

---

## MongoDB & Docker

* Verified MongoDB Docker container is running.
* Connected MongoDB Compass to Docker MongoDB instance.
* Created and inserted test data into:

  * products collection
  * stores collection
  * inventories collection

---

## Inventory API Testing

Successfully tested:

### GET `/api/inventory`

* Retrieved inventory data successfully.

### GET `/api/inventory/low-stock`

* Verified low-stock logic works correctly.

### PUT `/api/inventory/:id`

* Successfully updated inventory quantity and reorder point.
* Verified stock updates reflect correctly in database.

---

## Redis Setup

* Verified Redis Docker container is running.
* Configured Redis connection setup in backend.
* Tested Redis connectivity successfully.

---

## Git Workflow

* Created a separate feature branch for inventory module work.
* Prepared changes for commit and push.
---

## Status

✅ Inventory Module Completed Successfully
✅ Authentication Working
✅ Swagger Working
✅ MongoDB Connected
✅ Redis Connected
✅ API Testing Completed

## LIVE LINK FOR BACKEND
https://omnichannel-pos-1.onrender.com

## LIVE LINK FOR BACKEND & FRONTEND
https://omnichannel-pos-1.onrender.com
https://omnichannel-pos-1-alpha.vercel.app

## 👨‍💻 Author
Raunak Chirania
Gurnoor Singh
Akshay Sharma
Aman R. Thakur
