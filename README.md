# ATC Africa Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11+-red.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://typescriptlang.org/)

## 🚀 Overview

The official backend API for the ATC Africa website, designed to manage event lifecycle, user interactions, and dynamic content for the ATC Africa platform. Built with scalability and maintainability in mind.

## ✨ Features

- **Event Management**: Complete CRUD operations with status tracking (Draft, Pending, Approved, Concluded)
- **Event Lifecycle Automation**: Automated transitions and reminders
- **Role-Based Access Control**: Secure endpoints based on user roles (Organizer, Community Manager, Admin)
- **Speaker & Sponsor Management**: Comprehensive management system
- **Media Gallery**: Event highlights and social media mentions
- **Email Notifications**: Automated email system using Brevo
- **File Storage**: S3-compatible storage for images and videos

## 🛠 Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Supabase Auth
- **Email Service**: Brevo
- **Storage**: iDrive E2 (S3-compatible)
- **Cache**: Redis with BullMQ
- **Testing**: Jest

## 📋 Prerequisites

- Node.js (v18 or higher)
- pnpm (Package manager)
- PostgreSQL (v15 or higher)
- Redis (for caching)
- Git

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd atc-africa-backend-replica
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Environment Setup
```bash
cp .env-example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/atc_africa_db"
DIRECT_URL="postgresql://username:password@localhost:5432/atc_africa_db"

# Server
PORT=3001
NODE_ENV=development

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
ADMIN_TOKEN="your-admin-token"

# Email (Brevo)
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="noreply@atcafrica.live"

# Redis
REDIS_URL="redis://localhost:6379"

# Storage (S3-compatible)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_PUBLIC_BUCKET_NAME="your-bucket"
```

### 4. Database Setup
```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database (optional)
pnpm db:seed
```

### 5. Start the application
```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start:prod
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

Once running, visit `http://localhost:3001/api` for Swagger documentation.

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov

# Watch mode
pnpm test:watch
```

## 📁 Project Structure

```
src/
├── common/           # Shared utilities, decorators, guards
├── modules/          # Feature modules
│   ├── auth/         # Authentication module
│   ├── event/        # Event management
│   ├── user/         # User management
│   └── sponsor/      # Sponsor management
├── prisma/           # Database service
├── utils/            # Utilities (config, cache, storage)
└── main.ts           # Application entry point

prisma/
├── migrations/       # Database migrations
├── seed/            # Database seeders
└── schema.prisma    # Database schema

test/                # E2E tests
view/emails/         # Email templates
```

## 🔧 Available Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm lint             # Lint code
pnpm format           # Format code
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run database migrations
pnpm db:reset         # Reset database
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed database
```

## 🌍 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `DIRECT_URL` | Direct database connection | ✅ |
| `PORT` | Server port | ✅ |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `ADMIN_TOKEN` | Admin authentication token | ✅ |
| `BREVO_API_KEY` | Brevo email service API key | ✅ |
| `BREVO_SENDER_EMAIL` | Email sender address | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `AWS_ACCESS_KEY_ID` | S3 access key | ✅ |
| `AWS_SECRET_ACCESS_KEY` | S3 secret key | ✅ |

## 🚀 Deployment

### Docker (Recommended)
```bash
# Build image
docker build -t atc-africa-api .

# Run container
docker run -p 3001:3001 --env-file .env atc-africa-api
```

### AWS EC2
1. Set up EC2 instance with Node.js and PostgreSQL
2. Clone repository and install dependencies
3. Configure environment variables
4. Set up reverse proxy (nginx)
5. Use PM2 for process management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure code passes linting and formatting

## 📝 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh token

### Events
- `GET /event` - List events
- `POST /event` - Create event
- `GET /event/:id` - Get event details
- `PATCH /event/:id` - Update event
- `DELETE /event/:id` - Delete event

### Users
- `GET /user` - List users
- `GET /user/:id` - Get user details
- `PATCH /user/:id` - Update user

### Sponsors
- `GET /sponsor` - List sponsors
- `POST /sponsor` - Create sponsor
- `PATCH /sponsor/:id` - Update sponsor

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet security headers

## 📊 Monitoring

- Application logs
- Database query monitoring
- Redis cache metrics
- Email delivery tracking

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL service
sudo service postgresql status

# Verify connection string
psql "postgresql://username:password@localhost:5432/database"
```

**Redis Connection Error**
```bash
# Check Redis service
redis-cli ping
```

**Migration Issues**
```bash
# Reset database
pnpm db:reset

# Generate fresh migration
pnpm db:migrate
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team**: ATC Africa Tech Team
- **Maintainer**: [Your Name]

## 🙏 Acknowledgments

- NestJS community for the amazing framework
- Prisma team for the excellent ORM
- ATC Africa community for continuous support

## 📞 Support

For support, email support@atcafrica.live or create an issue in this repository.

---

**Made with ❤️ by ATC Africa**