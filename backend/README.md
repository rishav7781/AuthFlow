# AuthFlow

AuthFlow is a Truecaller-inspired authentication and contact discovery system built with Node.js, Express, PostgreSQL, JWT authentication, and Docker.  
This project is designed primarily for **learning purposes**—to help you understand how modern authentication, protected APIs, and contact discovery work together in a real-world stack.

## Features

- **User Signup & Login:** Register or login using name and mobile number (Truecaller-style).
- **JWT Authentication:** Secure, stateless authentication using JSON Web Tokens stored in HTTP-only cookies.
- **Profile Management:** View your profile details after login.
- **Contact Discovery:** Upload a list of mobile numbers to find which are registered in the system.
- **RESTful API:** Clean, documented endpoints (see Swagger docs).
- **Dockerized:** Easy to run locally with Docker and Docker Compose.
- **PostgreSQL Database:** Stores user and contact data.

## Tech Stack

- Node.js + Express (Backend API)
- PostgreSQL (Database)
- JWT (Authentication)
- Docker & Docker Compose (Containerization)
- Vanilla JS + HTML/CSS (Frontend)
- Swagger (API documentation)

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine

### Running the Project

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd Truecaller-Based JWT Authentication System/truecaller_login_api
   ```
2. **Create a `.env` file in the backend directory:**
   ```
   DATABASE_URL=postgresql://postgres:admin404@localhost:5432/Truecaller_Based_JWT_db
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=90d
   PORT=5000
   ```
   - Replace `your_jwt_secret_here` with a strong secret string.
   - Ensure the database name, user, and password match your Docker/Postgres setup.
3. **Build and run the Docker containers:**
   ```sh
   docker-compose up --build
   ```
4. **Database Table Creation:**
   - The backend will automatically check for and create the `users` table on startup. **You do not need to manually run any SQL.**
   - If the table already exists, nothing will be changed.
5. **Access the API:**
   - The API should be running at `http://localhost:5000`. Check the Swagger docs at `http://localhost:5000/api-docs`.

## API Documentation

API documentation is available via Swagger UI. After starting the project, access it at `http://localhost:5000/api-docs`.

---

## Troubleshooting

- **500 Internal Server Error on Signup/Login:**
  - Ensure your `.env` file is present and correct.
  - Make sure PostgreSQL is running and accessible at the address in `DATABASE_URL`.
  - The backend will auto-create the `users` table if it does not exist.
  - Check the backend terminal for detailed error logs.
- **Frontend not connecting:**
  - Make sure the backend is running at `http://127.0.0.1:5000` and CORS is enabled.
  - Open `frontend/index.html` in your browser and use the app.

---

**Note:** This project is for learning purposes only. Do not use it as-is for production applications.


