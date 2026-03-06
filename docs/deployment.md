# Deployment Guide

## Prerequisites

- Docker 20.10+
- Docker Compose 2+
- server access
- configured environment variables

## Required Environment Variables

```env
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-host
NEXT_PUBLIC_BACKEND_URL=https://your-backend-host
NEXT_PUBLIC_PIXABAY_API_KEY=your_pixabay_key
```

## Local Docker Workflow

```bash
docker-compose build
docker-compose up -d
docker-compose logs -f frontend
docker-compose ps
```

## Production Notes

- the Docker image uses a multi-stage build from `Dockerfile`
- the frontend exposes port `3000`
- `/api/health` is available for container and reverse-proxy health checks
- `next build` runs inside the builder stage, so production failures should be caught during image creation

## Common Commands

```bash
docker-compose down
docker-compose restart
docker-compose logs --tail=100 frontend
docker stats
```

## Reverse Proxy

Proxy traffic to `localhost:3000` from Caddy, Nginx, or your platform ingress. Preserve websocket headers if your deployment path depends on upgraded connections.
