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
2. **Build and run the Docker containers:**
   ```sh
   docker-compose up --build
   ```
3. **Initialize the database:**
   - Access the PostgreSQL container:
     ```sh
     docker exec -it truecaller_login_api_db_1 psql -U postgres
     ```
   - Create the database and user:
     ```sql
     CREATE DATABASE truecaller_db;
     CREATE USER truecaller_user WITH ENCRYPTED PASSWORD 'password';
     GRANT ALL PRIVILEGES ON DATABASE truecaller_db TO truecaller_user;
     ```
   - Exit the PostgreSQL prompt:
     ```sql
     \q
     ```
4. **Import the initial data (optional):**
   - If you have an `init.sql` file with initial data, import it using:
     ```sh
     docker exec -i truecaller_login_api_db_1 psql -U postgres -d truecaller_db < init.sql
     ```
5. **Access the API:**
   - The API should be running at `http://localhost:5000`. Check the Swagger docs at `http://localhost:5000/api-docs`.

## API Documentation

API documentation is available via Swagger UI. After starting the project, access it at `http://localhost:5000/api-docs`.



---

**Note:** This project is for learning purposes only. Do not use it as-is for production applications.


