# UniAds - Higher Education Discovery Platform

UniAds is a comprehensive platform connecting students with higher education opportunities in Sri Lanka. It features a modern React frontend and a robust Laravel backend, fully containerized with Docker.

## 📂 Project Structure
- `/Frontend`: React (Vite) application.
- `/Backend`: Laravel (PHP) REST API.
- `/docker-compose.yml`: Local development and production orchestration.

## 🚀 Quick Start (Docker)

1. **Clone the Repo**:
   ```bash
   git clone <repository-url>
   cd UniAds-F_B
   ```

2. **Environment Setup**:
   - Copy `.env.example` to `.env` in both `/Frontend` and `/Backend`.
   - Update `Backend/.env` with your database and mail credentials.

3. **Launch with Docker**:
   ```bash
   docker-compose up -d --build
   ```

4. **Initialize Backend**:
   ```bash
   docker-compose exec backend-app php artisan migrate
   docker-compose exec backend-app php artisan storage:link
   ```

## 🛠 Features
- **AI Career Advisor**: Personalized career roadmaps based on student profile.
- **Analytics Dashboard**: Comprehensive reporting for institutions with PDF exports.
- **Advanced Filtering**: Search courses by category, location, and more.
- **Real-time Notifications**: Engagement alerts for institutes.

## 📖 Documentation
- [Production Deployment Guide](file:///C:/Users/isuru/.gemini/antigravity/brain/53be4a67-317b-4d7e-b71c-be91c890283c/production_guide.md)
- [Backend API Reference](file:///d:/UniAds-F_B/Backend/README.md)
- [Frontend Developer Guide](file:///d:/UniAds-F_B/Frontend/README.md)

## ⚖️ License
This project is developed for academic and professional purposes.
