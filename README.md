week 1 -:
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

## 👨‍💻 Author

Raunak Chirania
Gurnoor Singh
Akshay Sharma
Aman Thakur