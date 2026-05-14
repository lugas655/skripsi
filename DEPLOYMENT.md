# VPS Deployment Guide

This project is containerized using Docker. Follow these steps to deploy the Backend and ML Service to your VPS.

## 1. Prerequisites
Ensure your VPS has Docker and Docker Compose installed.
- [Install Docker](https://docs.docker.com/engine/install/ubuntu/)
- [Install Docker Compose](https://docs.docker.com/compose/install/)

## 2. Setup on VPS

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd <repo-name>
   ```

2. **Configure Environment Variables**:
   Update the `docker-compose.yml` file or create a `.env` file in the root directory with your production secrets:
   - `MYSQL_ROOT_PASSWORD`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `DATABASE_URL` (should point to `db` service as configured in docker-compose)

3. **Build and Run**:
   Run the following command to start all services:
   ```bash
   docker compose up -d --build
   ```

## 3. Database Migration
After the containers are running, you need to push the Prisma schema to the database:
```bash
docker compose exec backend npx prisma db push
```

## 4. Monitoring & Logs
To check if everything is running correctly:
```bash
docker compose ps
```

To view logs:
```bash
docker compose logs -f
```

## 5. (Optional) Nginx Reverse Proxy
To enable HTTPS, it is recommended to use Nginx with Certbot.

Example Nginx config (`/etc/nginx/sites-available/default`):
```nginx
server {
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ml/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---
**Note**: Make sure ports 3000, 8000, and 3306 are either closed to the public (using a firewall like `ufw`) or properly secured, as Nginx will handle the public traffic.
