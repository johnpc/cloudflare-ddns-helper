# Cloudflare DDNS Helper

A lightweight Docker container that automatically updates Cloudflare DNS records with your current public IP address. Perfect for home labs, self-hosted services, or any scenario where you need dynamic DNS updating with Cloudflare.

This is useful if you have an ISP with a dynamic public IP address.

## Features

- 🔄 Automatically updates DNS records every 10 minutes
- 🔒 Secure authentication with Cloudflare API
- 🐳 Easy deployment with Docker
- ✨ Support for multiple DNS records
- 📝 Detailed logging
- 🚀 Lightweight and efficient

## Prerequisites

- Docker and Docker Compose installed on your system
- A Cloudflare account with your domain
- Cloudflare API key

## Quick Start

Create a `docker-compose.yml` file:

```yaml
version: '3'
services:
  ddns-updater:
    image: mrorbitman/cloudflare-ddns-helper:latest
    environment:
      - CLOUDFLARE_EMAIL=your-email@example.com
      - CLOUDFLARE_API_KEY=your-api-key
      - DOMAIN_NAME=yourdomain.com
      - RECORD_NAMES=subdomain1,subdomain2
    restart: unless-stopped
```

Then run

```bash
docker-compose up -d
```

## How It Works

1. The container runs a script every 10 minutes

1. It fetches your current public IP address

1. Checks your Cloudflare DNS records

1. Updates the records if your IP has changed

1. Logs the results

This way, your desired subdomain records will remain up to date with your host's public ip.
