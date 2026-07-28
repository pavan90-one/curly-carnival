# Smart Commerce

Smart Commerce is a containerized microservice starter for an online store. It includes a React storefront, an API gateway, and independent auth, user, product, order, payment, and notification services.

## Architecture

```text
Browser -> Frontend (React/Nginx) -> API Gateway -> Auth | User | Product | Order | Payment | Notification services
```

The frontend communicates only with the API gateway. The gateway routes requests under `/api/<service>` to the appropriate service.

## Service source layout

Every service now follows the same source layout as the user service:

```text
src/
  app.js             # Express application and middleware
  index.js           # service startup only
  config/            # port and environment configuration
  controllers/       # HTTP request/response handling
  routes/            # endpoint declarations
  repositories/      # persistence or in-memory data access
  models/            # domain object factories
  schema/            # request validation rules
```

The product, order, payment, and notification repositories remain in memory; their data is intentionally reset when the service restarts. The user service continues to use MongoDB.

## Start all services

Prerequisite: Docker Desktop is running.

```powershell
cd D:\july24\curly-carnival\backend
docker compose up --build -d
```

Commands for daily use:

```powershell
docker compose ps           # running containers and ports
docker compose logs -f      # follow all logs
docker compose up --build -d # rebuild after source changes
docker compose down         # stop the stack
```

## Services and URLs

| Service | Purpose | Direct health URL | Gateway route |
| --- | --- | --- | --- |
| Frontend | React shopping experience | http://localhost:5173 | — |
| API gateway | CORS, logging, request routing | http://localhost:8081/health | http://localhost:8081/api |
| Auth | Registration, login, JWT, password reset | http://localhost:4006/health | `/api/auth` |
| User | User profiles | http://localhost:4001/health | `/api/users` |
| Product | Catalog and inventory | http://localhost:4002/health | `/api/products` |
| Order | Order creation and history | http://localhost:4003/health | `/api/orders` |
| Payment | Payment simulation | http://localhost:4004/health | `/api/payments` |
| Notification | Notification queue simulation | http://localhost:4005/health | `/api/notifications` |

The gateway is exposed at port `8081` because host port `8080` was already in use. It still uses port `8080` internally in Docker.

The user service persists profiles in the included MongoDB container. For direct local runs, copy `backend/services/user-service/.env.example` to `.env` and set `DATABASE_URL` (or the compatible `MONGO_URI`) to a valid MongoDB connection string.

## Authentication API

Base URL: `http://localhost:8081/api/auth`

| Method | Route | Required body | Description |
| --- | --- | --- | --- |
| POST | `/register` | `name`, `email`, `password` | Creates a user and returns a token pair. |
| POST | `/login` | `email`, `password` | Returns the user and a token pair. |
| POST | `/refresh-token` | `refreshToken` | Rotates refresh token and returns new tokens. |
| POST | `/logout` | `refreshToken` | Invalidates the refresh token. |
| POST | `/forgot-password` | `email` | Starts a password reset request. |
| POST | `/reset-password` | `token`, `password` | Changes password and revokes refresh tokens. |

Example registration:

```powershell
$body = @{ name = 'Jane Doe'; email = 'jane@example.com'; password = 'a-secure-password' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:8081/api/auth/register -ContentType 'application/json' -Body $body
```

Security behavior:

- Passwords are hashed with `bcryptjs`; plaintext passwords are not stored.
- Access JWTs expire after 15 minutes.
- Refresh JWTs expire after 7 days and are rotated on refresh.
- Reset tokens expire after 15 minutes.
- Configure strong `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` values before production.

## Commerce API

| Service | Method | Gateway endpoint | Details |
| --- | --- | --- | --- |
| Products | GET | `/api/products` | Optional query: `q` |
| Products | GET | `/api/products/:id` | Find one product |
| Products | POST | `/api/products` | Create a product |
| Users | GET | `/api/users` | List users |
| Users | GET | `/api/users/:id` | Find one user |
| Users | POST | `/api/users` | Create user profile |
| Orders | GET | `/api/orders` | Optional query: `userId` |
| Orders | POST | `/api/orders` | Requires `userId` and `items[]` |
| Payments | GET/POST | `/api/payments` | POST requires `orderId`, `amount` |
| Notifications | GET/POST | `/api/notifications` | Create or list notifications |

Order body example:

```json
{
  "userId": "usr_demo",
  "items": [
    { "id": "prd_aurora", "name": "Aurora Headphones", "price": 129.99, "quantity": 1 }
  ]
}
```

Send it to `POST http://localhost:8081/api/orders`.

## Run without Docker

Start each service in its own terminal after `npm install`. Ports are auth `4006`, user `4001`, product `4002`, order `4003`, payment `4004`, notification `4005`, gateway `8080`, and frontend `5173`.

```powershell
cd backend\services\auth-service; npm install; npm start
cd backend\api-gateway; npm install; npm start
cd frontend; npm install; npm run dev
```

Repeat the first command pattern for every other service directory. When running the frontend outside Docker, set `VITE_API_URL=http://localhost:8080/api` so it reaches the local gateway.

## Kubernetes

Manifests are organized by component in subdirectories under [backend/kubernetes](backend/kubernetes). Build and publish images using the tags in the manifests, then apply all manifests recursively:

```powershell
kubectl apply -R -f backend/kubernetes/
```

Or apply individually by directory:

```powershell
kubectl apply -f backend/kubernetes/namespace/
kubectl apply -f backend/kubernetes/mongodb/
kubectl apply -f backend/kubernetes/rabbitmq/
kubectl apply -f backend/kubernetes/redis/
kubectl apply -f backend/kubernetes/auth-service/
kubectl apply -f backend/kubernetes/user-service/
kubectl apply -f backend/kubernetes/product-service/
kubectl apply -f backend/kubernetes/order-service/
kubectl apply -f backend/kubernetes/payment-service/
kubectl apply -f backend/kubernetes/notification-service/
kubectl apply -f backend/kubernetes/api-gateway/
kubectl apply -f backend/kubernetes/frontend/
kubectl apply -f backend/kubernetes/ingress/
```

## Important development limitations

- Data, token allowlists, orders, and notifications are in memory and disappear when containers restart.
- Payment always simulates a successful transaction; it has no payment-provider integration.
- Notifications are queued in memory and do not send email, SMS, or push messages.
- Before production, add persistent databases, migrations, request validation, automated tests, rate limiting, HTTPS, centralized logs, traces, and a real secret manager.
