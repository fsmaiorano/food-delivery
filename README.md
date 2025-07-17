# Food Delivery Microservices Application

A comprehensive food delivery application built using .NET 9 microservices architecture with Clean Architecture principles, CQRS pattern, and Event-Driven Architecture.

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
