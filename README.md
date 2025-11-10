# Ecommerce - Full Stack Application

Một ứng dụng ecommerce hiện đại được xây dựng với Next.js 15, TypeScript và các công nghệ tiên tiến nhất mang đến trải nghiệm mượt mà và thú vị. Ứng dụng cho phép người dùng đăng nhập, xem và tìm kiếm sản phẩm , thêm sản phẩm vào giỏ hàng, thanh toán.

## 🚀 Live Demo

**URL:** [https://ecommerce-hieutran.vercel.app/](https://ecommerce-hieutran.vercel.app/)

## 🛠️ Công nghệ sử dụng

### Frontend

- **Next.js 15** cho file-system conventions (layout.ts, page.ts, Route Groups, route.ts, public,...)
- **TypeScript** cho type safety
- **React 19** với Hooks (useEffect,useState,useCallback,...)
- **Tailwind V4** cho styling
- **Shadcn** cho components ui (button,input,dialog,...)
- **React Hook Form** với Yup validation
- **SWR** cho data fetching và caching
- **Zustand** cho global state management
- **Lucide React** cho icons

### Backend & API

- **DummyJSON API** cho dữ liệu giả lập
- **Next.js API Routes** cho authentication
- **JWT** cho session management
- **CryptoJS** cho encryption

### Development Tools

- **ESLint** và **Prettier** cho code quality
- **Husky** và **lint-staged** cho git hooks
- **TypeScript** cho static type checking

## 📋 Yêu cầu hệ thống

- Node.js 18+
- pnpm (khuyến nghị) hoặc npm/yarn

## 🚀 Cách chạy project

### 1. Clone repository

```bash
git clone https://github.com/Hieu4896/Ecommerce.git
cd ecommerce
```

### 2. Cài đặt dependencies

```bash
pnpm install
```

### 3. Biến môi trường

Tạo file `.env` với các biến sau:

```
NEXT_PUBLIC_STORAGE_KEY=pawsy-ecommerce-secret-key-2024
DUMMYJSON_API_URL=https://dummyjson.com
```

### 4. Khởi động development server

```bash
pnpm dev
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000)

### 5. Build cho production

```bash
pnpm build
pnpm start
```

## 📁 Cấu trúc thư mục

```
ecommerce/
├── app/                          # Next.js App Router
│   ├── (authenticated)/           # Routes yêu cầu authentication
│   │   ├── cart/                # Trang giỏ hàng
│   │   ├── checkout/             # Trang thanh toán
│   │   └── products/            # Trang danh sách sản phẩm
│   ├── (public)/                # Routes công khai
│   │   ├── login/               # Trang đăng nhập
│   │   └── page.tsx             # Homepage
│   ├── api/                     # API Routes
│   │   └── auth/                # Authentication endpoints
│   ├── globals.css              # Global styles
│   └── layout.tsx              # Root layout
├── docs/                       # Documentation
├── public/                     # Static assets
├── src/
│   ├── components/              # React components
│   │   ├── auth/               # Authentication components
│   │   ├── cart/               # Cart components
│   │   ├── checkout/           # Checkout components
│   │   ├── form/               # Form components
│   │   ├── layout/             # Layout components
│   │   ├── product/            # Product components
│   │   ├── schema/             # Validation schemas
│   │   └── ui/                 # UI components
│   ├── config/                 # Configuration files
│   ├── constants/              # Application constants
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   ├── providers/              # React providers
│   ├── services/               # API services
│   ├── store/                  # Zustand stores
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions
├── .gitignore
├── .eslintrc.json
├── next.config.js
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## 🔐 Tính năng bảo mật

### Secure Storage System

- **Encryption:** Mọi dữ liệu trong localStorage được mã hóa với AES
- **Checksum validation:** Kiểm tra tính toàn vẹn dữ liệu
- **Timestamp validation:** Tự động xóa dữ liệu hết hạn (24 giờ)
- **Cross-tab protection:** Phát hiện và ngăn chặn thay đổi từ tab khác
- **XSS protection:** Tự động xóa dữ liệu khi phát hiện tấn công

### Authentication & Authorization

- **JWT tokens:** Access và refresh tokens với expiration
- **Middleware protection:** Bảo vệ routes yêu cầu authentication
- **Token refresh:** Tự động làm mới token khi hết hạn
- **Secure cookies:** HttpOnly cookies cho token storage

## 🛒 Tính năng chính

### 1. Authentication System

- Login với username/password
- Session management với JWT
- Auto-redirect dựa trên authentication status
- Logout với cleanup toàn bộ dữ liệu

### 2. Product Management

- Infinite scroll (20 items/load)
- Real-time search functionality
- Product filtering và sorting
- Responsive grid layout
- Loading skeletons cho better UX

### 3. Shopping Cart

- Add/remove products với quantity adjustment
- Real-time cart updates
- Persistent cart across sessions
- Cart validation với authentication check
- Empty cart state với CTA

### 4. Checkout Process

- Multi-step form với validation
- Multiple payment methods (Card, Bank, COD)
- Address management
- Order summary với cost breakdown
- Order confirmation với tracking

## 🎯 Thách thức và giải pháp

### 1. DummyJSON API Limitations

**Thách thức:** API không có real endpoints cho orders và không persist data thực tế

**Giải pháp:**

- Simulation của checkout process
- Local state management cho orders
- Mock API responses cho realistic UX
- Client-side validation với error handling

### 2. Security Implementation

**Thách thức:** Bảo vệ localStorage khỏi XSS attacks trong môi trường client-side

**Giải pháp:**

- Custom encryption system với CryptoJS
- Multi-layer validation (format, checksum, timestamp)
- Cross-tab synchronization với storage events
- Automatic cleanup mechanisms

### 3. State Management Complexity

**Thách thức:** Quản lý state phức tạp giữa authentication, cart, và checkout

**Giải pháp:**

- Zustand với persist middleware
- Modular store architecture
- Secure storage integration
- Optimistic updates với rollback

### 4. Performance Optimization

**Thách thức:** Infinite scroll với large datasets và real-time updates

**Giải pháp:**

- SWR cho efficient data fetching
- Virtual scrolling considerations
- Debounced search functionality
- Component memoization và lazy loading

### 5. Form Validation UX

**Thách thức:** Complex validation logic cho multi-step checkout

**Giải pháp:**

- React Hook Form với Yup schemas
- Conditional validation dựa trên payment method
- Real-time error display

## 🔧 Development Commands

```bash
# Development
pnpm dev              # Start development server với Turbopack
pnpm build            # Build cho production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm format           # Format code với Prettier

# Git Hooks
pnpm prepare          # Setup Husky hooks
```

## 🚀 Deployment

### Vercel Configuration

- **Build Command:** `pnpm build`
- **Output Directory:** `.next`
- **Node Version:** 18.x
- **Environment Variables:** `NEXT_PUBLIC_STORAGE_KEY , DUMMYJSON_API_URL`

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For questions or support, please contact:

- Email: hieutran4896@gmail.com
- Phone: 0903350269
- GitHub Issues: [Repository Issues](https://github.com/Hieu4896/Ecommerce/issues)

---

**Built with Next.js, TypeScript and lots of ☕️**
