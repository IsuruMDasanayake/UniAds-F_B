<!-- <p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p> -->

<p align="center">
  <img src="https://github.com/IsuruMDasanayake/UniAds/blob/production/public/images/logo.png?raw=true" width="400" alt="UniAds Logo" />
</p>

<p align="center"><strong>Connecting Students with the Right Higher Education Opportunities</strong></p>

---

## 📘 About UniAds

**UniAds** is a centralized digital platform designed to modernize how higher education opportunities are discovered and promoted in Sri Lanka. The platform connects **students, parents, and higher education institutions** by providing verified academic information, structured course discovery, and direct communication tools.

UniAds enables students to make informed academic decisions while helping institutions increase visibility, engagement, and outreach through a single, reliable digital platform.

---

## 🌍 Vision

To become Sri Lanka’s most trusted and innovative digital platform for discovering, comparing, and connecting with higher education opportunities.

---

## 🎯 Mission

To provide a transparent, user-friendly, and data-driven platform that empowers students to make confident educational choices while enabling institutions to effectively promote their academic offerings using modern digital tools.

---

## 🚀 Key Features

### 👨‍🎓 For Students

* Browse verified higher education institutions
* Discover degree, diploma, and master’s programs
* Advanced course filtering (location, duration, format)
* Dedicated course pages with detailed information
* Apply for courses directly through the platform
* View upcoming events and institutional updates

### 🏫 For Institutions

* Dedicated institution profiles and dashboards
* Post and promote courses and academic updates
* Manage course listings and events
* Communicate directly with prospective students
* Analytics dashboard (Premium feature)
* Subscription-based premium features

### 🛠 Platform Features

* Centralized search across institutions, courses, and posts
* Secure authentication and role-based access
* Admin dashboard for platform management
* Scalable architecture built with Laravel

---

## 🧱 Tech Stack

* **Backend:** Laravel (PHP)
* **Frontend:** Blade / HTML / CSS / JavaScript
* **Database:** MySQL
* **Authentication:** Laravel Auth
* **Payments:** Stripe (Subscriptions)
* **Containerization:** Docker

---

## 🔀 Branching Strategy

The repository follows a clean and professional Git workflow:

* **`production`** → Stable, production-ready code (default branch)
* **`development`** → Active development and feature integration

All development work is pushed to the `development` branch and merged into `production` via Pull Requests.

---

## ⚙️ System Setup

You can run UniAds using **standard Laravel setup** or **Docker**.

---

## 🖥️ Local Setup (Default Laravel)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/IsuruMDasanayake/UniAds.git
cd UniAds
```

### 2️⃣ Install Dependencies

```bash
composer install
npm install
```

### 3️⃣ Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
```

Update `.env` with your database credentials:

```env
DB_DATABASE=uniads
DB_USERNAME=root
DB_PASSWORD=
```

### 4️⃣ Run Migrations

```bash
php artisan migrate
```

### 5️⃣ Start the Development Server

```bash
php artisan serve
```

Application will be available at:

```
http://127.0.0.1:8000
```

---

## 🐳 Docker Setup

### 1️⃣ Prerequisites

* Docker
* Docker Compose

### 2️⃣ Build and Run Containers

```bash
docker-compose build
docker-compose up -d
```

### 3️⃣ Install Laravel Dependencies (inside container)

```bash
docker-compose exec app composer install
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan migrate
```

Application will be available at:

```
http://localhost
```

---

## 🔐 Security

If you discover any security vulnerabilities, please report them responsibly. Do not disclose them publicly.

---

## 🤝 Contributing

Contributions are welcome. Please follow the repository branching strategy and submit Pull Requests to the `development` branch.

---

## 📄 License

This project is open-sourced and developed for educational and academic purposes.

---

## ✨ UniAds

> *Find the Education That Fits You.*

> *Reach the Right Students, Faster.*

