# Smart Commerce

A microservice commerce starter with a React storefront, API gateway, five backend services, Docker Compose, and Kubernetes manifests.

## Run locally

```bash
cd backend
docker compose up --build
```

Open `http://localhost:5173`. The gateway is at `http://localhost:8081` and its health endpoint is `/health`.

To run without Docker, install dependencies in each service and in `frontend`, then start the services on ports 4001–4005, the gateway on 8080, and the frontend with `npm run dev`.

## API routes

| Route | Service |
| --- | --- |
| `/api/users` | User profiles |
| `/api/auth` | Registration and authentication |
| `/api/products` | Catalog and inventory |
| `/api/orders` | Order creation and history |
| `/api/payments` | Payment intents |
| `/api/notifications` | Notification events |

All services expose `/health`. Data is intentionally in memory for this starter and resets when containers restart.

## Authentication endpoints

All auth routes are available through the gateway at `/api/auth`:

| Method | Route | Body |
| --- | --- | --- |
| POST | `/api/auth/register` | `name`, `email`, `password` |
| POST | `/api/auth/login` | `email`, `password` |
| POST | `/api/auth/refresh-token` | `refreshToken` |
| POST | `/api/auth/logout` | `refreshToken` |
| POST | `/api/auth/forgot-password` | `email` |
| POST | `/api/auth/reset-password` | `token`, `password` |

For Kubernetes, create `auth-secrets.yaml` from `kubernetes/auth-secrets.example.yaml` with strong, distinct secrets before deploying.
