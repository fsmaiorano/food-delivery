# Food Delivery Microservices Application

A full-featured food delivery system built with .NET 9 using a microservices architecture, Clean Architecture principles, the CQRS pattern, and Event-Driven Architecture. It includes dedicated services for catalog, basket, ordering, discounts, and authentication, leveraging technologies like PostgreSQL, Redis, RabbitMQ, MinIO, Keycloak, and Angular. 

## 🏗️ Architecture Overview

This application follows a microservices architecture pattern with the following services:

- **Catalog Service**: Manages food products and categories
- **Basket Service**: Handles shopping cart functionality
- **Ordering Service**: Processes orders and order management
- **Discount Service**: Manages discount coupons via gRPC
- **Gateway API**: API Gateway for routing and authentication

## 🛠️ Technology Stack

- **.NET 9**: Core framework
- **PostgreSQL**: Database for Catalog, Basket, and Keycloak
- **SQL Server**: Database for Ordering service
- **Redis**: Distributed caching
- **RabbitMQ**: Message broker for event-driven communication
- **MinIO**: Object storage for image management
- **Keycloak**: Identity and access management
- **Docker & Docker Compose**: Containerization
- **Angular**: Frontend web application

## 📦 MinIO Object Storage

MinIO is used as the object storage solution for managing product images in the food delivery application.

### Configuration

**Docker Compose Setup:**
```yaml
minio:
  image: minio/minio:latest
  container_name: minio
  environment:
    - MINIO_ROOT_USER=admin
    - MINIO_ROOT_PASSWORD=admin123
    - MINIO_DEFAULT_BUCKETS=food-delivery-catalog
  ports:
    - "9000:9000"    # MinIO API
    - "9001:9001"    # MinIO Console
  command: server /data --console-address ":9001"
  volumes:
    - minio_data:/data
```

### Features

- **Image Upload**: Automatically uploads product images from external URLs
- **Presigned URLs**: Generates temporary URLs for secure image access (1-hour expiry)
- **Image Download**: Provides download links with proper content disposition
- **Image Deletion**: Removes images when products are deleted
- **Bucket Management**: Automatically creates the `food-delivery` bucket if it doesn't exist

### Usage in Catalog Service

The MinIO integration is primarily used in the Catalog service for:

1. **Product Creation**: Images are uploaded to MinIO when creating new products
2. **Product Retrieval**: Presigned URLs are generated when fetching products
3. **Product Updates**: Old images are replaced with new ones
4. **Product Deletion**: Associated images are removed from storage

### Access Points

- **MinIO API**: `http://localhost:9000`
- **MinIO Console**: `http://localhost:9001` (admin/admin123)
- **Default Bucket**: `food-delivery`

### BuildingBlocks.Storage

The project includes a custom storage building block (`BuildingBlocks.Storage`) that provides:

```csharp
// Upload image from URL
var (objectName, objectUrl) = await MinioBucket.SendImageAsync(imageUrl);

// Get presigned URL for viewing
var viewUrl = await MinioBucket.GetImageAsync(imageName);

// Get download URL
var downloadUrl = await MinioBucket.GetImageToDownload(imageName);

// Delete image
await MinioBucket.DeleteImageAsync(imageName);
```

## 🌐 Nginx Reverse Proxy

The application uses Nginx as a reverse proxy to serve the Angular frontend and route API requests to the appropriate backend services.

### Configuration

**Docker Setup:**
The webapp service runs in a Docker container using Nginx to serve the Angular application and proxy API requests:

```yaml
webapp:
  image: webapp
  build:
    context: .
    dockerfile: UserInterfaces/WebApplication/Dockerfile
  container_name: webapp
  environment:
    - NODE_ENV=production
  ports:
    - "4001:80"
  volumes:
    - ./UserInterfaces/WebApplication/nginx.conf:/etc/nginx/conf.d/default.conf
```

### Features

**Static File Serving:**
- Serves the compiled Angular application from `/usr/share/nginx/html`
- Implements Single Page Application (SPA) routing with fallback to `index.html`
- Optimized caching for static assets (JS, CSS, images) with 1-year expiry

**API Proxying:**
- **`/api/*`**: Proxies to Gateway API (`gatewayapi:8080`)
- **`/auth/*`**: Proxies to Keycloak authentication (`keycloak:8080`)

**Security & Performance:**
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Gzip compression for text-based assets
- Request buffering optimization for better performance
- Health check endpoint at `/health`

**Error Handling:**
- Minimized log noise with critical-level error logging only
- Suppressed SSL handshake failure logs
- Proper HTTP headers for proxied requests

### Access Points

- **Web Application**: `http://localhost:4001`
- **API Gateway (via proxy)**: `http://localhost:4001/api/`
- **Keycloak (via proxy)**: `http://localhost:4001/auth/`
- **Health Check**: `http://localhost:4001/health`

### Multi-Stage Docker Build

The Dockerfile uses a multi-stage build process:

1. **Build Stage**: Uses Node.js 20 Alpine to compile the Angular application
2. **Runtime Stage**: Uses Nginx Alpine to serve the compiled application
3. **Custom Configuration**: Mounts the custom `nginx.conf` for optimized routing and proxying

## 🚀 Getting Started

### Prerequisites

- Docker Desktop
- .NET 9 SDK
- Node.js (for Angular frontend)

### Running the Application

1. **Clone the repository**
```bash
git clone <repository-url>
cd FoodDelivery
```

2. **Start all services with Docker Compose**
```bash
cd src
docker-compose up -d
```

3. **Access the services**
   - **Web Application**: `http://localhost:4001`
   - **Gateway API**: `http://localhost:6004`
   - **Catalog API**: `http://localhost:6000`
   - **Basket API**: `http://localhost:6001`
   - **Discount gRPC**: `http://localhost:6002`
   - **Ordering API**: `http://localhost:6003`
   - **Keycloak**: `http://localhost:6005`
   - **MinIO Console**: `http://localhost:9001`
   - **RabbitMQ Management**: `http://localhost:15672`

### Service Ports

| Service | HTTP Port | HTTPS Port | Database Port |
|---------|-----------|------------|---------------|
| Web Application (Nginx) | 4001 | - | - |
| Catalog API | 6000 | 6060 | 5432 |
| Basket API | 6001 | 6061 | 5433 |
| Discount gRPC | 6002 | 6062 | - |
| Ordering API | 6003 | 6063 | 1433 |
| Gateway API | 6004 | 6064 | - |
| Keycloak | 6005 | - | 5434 |
| MinIO API | 9000 | - | - |
| MinIO Console | 9001 | - | - |
| Redis | 6379 | - | - |
| RabbitMQ | 5672 | - | - |
| RabbitMQ Management | 15672 | - | - |

## 🔐 Default Credentials

- **MinIO**: admin / admin123
- **Keycloak**: admin / admin
- **RabbitMQ**: guest / guest
- **Databases**: postgres / postgres (PostgreSQL), sa / Password123 (SQL Server)

## 📁 Project Structure

```
src/
├── BuildingBlocks/           # Shared libraries
│   ├── BuildingBlocks/       # Common utilities and exceptions
│   ├── BuildingBlocks.Mediator/  # MediatR configuration
│   ├── BuildingBlocks.Messaging/ # Event handling
│   └── BuildingBlocks.Storage/   # MinIO storage abstraction
├── Services/                 # Microservices
│   ├── Catalog/             # Product catalog management
│   ├── Basket/              # Shopping cart functionality
│   ├── Discount/            # Discount and coupon service
│   └── Ordering/            # Order processing
├── Gateways/
│   └── GatewayApi/          # API Gateway
├── UserInterfaces/
│   └── WebApplication/      # Angular frontend
└── docker-compose.yml       # Container orchestration
```

## 🧪 Testing

The project includes API testing collections in the `docs/bruno/` directory for testing all endpoints across different services.

## 📝 Documentation

- **Port Mapping**: See `docs/port-mapping.md` for detailed port configurations
- **API Collections**: Bruno API testing collections available in `docs/bruno/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
