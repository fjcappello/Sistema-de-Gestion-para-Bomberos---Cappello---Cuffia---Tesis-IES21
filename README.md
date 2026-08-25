# Fire Department Management System (SIGB)

## Overview

**SIGB** (Sistema Integral de Gestión para Bomberos) is a comprehensive web-based management system designed to streamline fire department operations. This project serves as the foundation for a complete thesis on systems analysis and software development, providing tools for efficient resource management, incident tracking, and operational coordination for firefighting organizations.

## Authors

- **Franco Cappello** - Systems Analyst & Software Developer
- **Facundo Cuffia** - Systems Analyst & Software Developer

## Academic Information

**Degree Program:** Systems Analysis & Software Development  
**Educational Institution:** Colegio Universitario IES 
**Location:** Córdoba, Argentina

### Thesis Defense Details
- **Defense Date:** July 30, 2025
- **Final Grade:** 10/10
- **Thesis Director:** Magister Fernando Frías
- **Tribunal Members:**
  - Magister Fernando Frías
  - Systems Analyst Esteban López Belcoure 

---

## Project Description

This system provides an integrated platform for fire departments to:

- **Incident Management:** Record, track, and manage emergency responses
- **Resource Allocation:** Optimize personnel and equipment distribution
- **Operational Reporting:** Generate comprehensive reports on department activities
- **Real-time Coordination:** Enable efficient communication and task assignment
- **Data Analytics:** Monitor department performance and response metrics

The application is built with modern web technologies, featuring a responsive frontend interface and robust backend services to support critical emergency management operations.

---

## Technology Stack

### Frontend
- **React** - UI library for building interactive user interfaces
- **JavaScript/TypeScript** - Primary development language
- **Node.js** - Runtime environment

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Additional technologies:** RESTful APIs, database integration

### Database
- **SQL-based** - Data persistence layer

---

## Project Structure

```
Sistema-de-Gestion-para-Bomberos/
├── frontend/               # React-based user interface
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── backend/               # Backend server & APIs
│   ├── routes/            # API endpoints
│   ├── controllers/       # Business logic
│   └── models/            # Data models
├── resources/             # Documentation and resources
└── .gitignore             # Git configuration
```

---

## Installation & Setup

### Prerequisites
- Node.js (v14.0 or higher)
- npm (v6.0 or higher)
- Git

### Clone the Repository
```bash
git clone https://github.com/fjcappello/Sistema-de-Gestion-para-Bomberos---Cappello---Cuffia---Tesis-IES21.git
cd Sistema-de-Gestion-para-Bomberos---Cappello---Cuffia---Tesis-IES21
```

### Install Dependencies
```bash
npm install
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

### Backend Setup
```bash
cd backend
npm install
npm start
```

The backend server will run on the configured port (typically `http://localhost:5000`)

---

## Usage

1. **Access the Application:** Open your browser and navigate to `http://localhost:3000/` for the frontend and `http://localhost:5000/` for the backend

2. **Authentication:** Log in with your fire department credentials

3. **Create Incident Records:** Use the dashboard to register new emergency responses

4. **Manage Resources:** Allocate personnel and equipment efficiently

5. **Generate Reports:** Access analytics and performance metrics

6. **Real-time Updates:** Monitor ongoing operations through the live dashboard

---

## Features

✅ Incident Recording & Tracking  
✅ Personnel & Equipment Management  
✅ Real-time Operational Dashboard  
✅ Report Generation & Analytics  
✅ User Role-based Access Control  
✅ Mobile-responsive Design  
✅ Search & Filtering Capabilities  
✅ Historical Data Analysis  

---

## Development

### Running in Development Mode

Both frontend and backend include development scripts with hot-reload capabilities:

```bash
# Terminal 1: Frontend
cd frontend
npm start

# Terminal 2: Backend
cd backend
npm start
```

### Environment Variables

Create `.env` files in both `frontend/` and `backend/` directories with necessary configuration:

```
# Backend .env (example)
PORT=5000
DATABASE_URL=your_database_url
NODE_ENV=development
```

---

## Deployment

To deploy this application:

1. **Frontend:** Choose your hosting platform (Netlify, AWS S3, etc.) and build the React application
2. **Backend:** Deploy to your preferred server (Heroku, AWS, DigitalOcean, VPS, etc.)
3. Set environment variables in your hosting dashboard
4. Update the frontend API endpoints to match your backend URL
5. Configure CORS settings for frontend-backend communication

---

## Contributing

This is an academic thesis project. For inquiries or contributions, please contact the authors:

- Franco Cappello: [www.linkedin.com/in/fjcappello]
- Facundo Cuffia: [https://www.linkedin.com/in/facundo-cuffia-9b480a247/]

---

## License

This project is developed as academic work for Universidad IES 21. Please contact the authors for licensing inquiries.

---

## Acknowledgments

This thesis was successfully defended on July 30, 2025, and approved with a perfect score of 10/10 by the examination tribunal. We extend our gratitude to:

- **Magister Fernando Frías** - Thesis Director and tribunal member, for his invaluable guidance, mentorship, and support throughout the development and defense of this project
- **Esteban López Belcoure** - Systems Analyst and tribunal member, for his expert evaluation and insightful feedback
- **Universidad IES 21** - For providing the academic infrastructure, resources, and environment necessary to develop this comprehensive thesis project
---

## Support & Documentation


For questions or issues, please open an issue on the GitHub repository.

---

**Project Status:** Completed & Approved (Thesis Defense: July 30, 2025)  
**Final Grade:** 10/10  
**Last Updated:** August 2026

---

*Este proyecto es el resultado del trabajo de tesis en Análisis de Sistemas y Desarrollo de Software en la Universidad IES 21.*
