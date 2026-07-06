# PC Store Catalog API 🚀

API RESTful desarrollada con **NestJS** para la gestión de un catálogo de hardware y e-commerce. Este proyecto es el resultado del **Proyecto Integrador de Programación 3**, demostrando la implementación de arquitecturas escalables, bases de datos híbridas y buenas prácticas de desarrollo.

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** NestJS (Node.js / TypeScript)
- **Base de Datos Relacional:** PostgreSQL (Gestionado con TypeORM)
- **Base de Datos NoSQL:** MongoDB (Gestionado con Mongoose)
- **Autenticación:** JSON Web Tokens (JWT) y Passport
- **Documentación:** Swagger / OpenAPI
- **Testing:** Postman (Pruebas E2E) y k6 (Pruebas de estrés)
- **Contenedores:** Docker & Docker Compose

---

## 🏗️ Arquitectura de Datos (Enfoque Híbrido)

El proyecto utiliza un enfoque políglota para maximizar el rendimiento según el dominio de datos:

1. **PostgreSQL (Estructurado y Transaccional):**
   - Usuarios y Roles (`users`)
   - Catálogo de Productos (`products`)
   - Categorías y Marcas (`categories`, `brands`)
   - Órdenes y Detalles de Órdenes (`orders`, `order_items`)
   - Carrito de compras (`cart`, `cart_items`)

2. **MongoDB (Documental y Escalable):**
   - Reseñas de Productos (`reviews`)
   - Ideal para almacenar calificaciones, comentarios extensos y metadatos flexibles sin esquemas rígidos.

---

## 🚀 Guía de Instalación y Ejecución

### 1. Requisitos Previos
- Node.js (v18+)
- Docker y Docker Compose
- Postman (opcional para pruebas)

### 2. Levantar las Bases de Datos
El proyecto incluye un archivo `docker-compose.yml` preconfigurado.
```bash
# Levanta los contenedores de PostgreSQL y MongoDB en segundo plano
docker compose up -d
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.template`:
```env
# Servidor
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=admin
DB_NAME=pcstore

# MongoDB
MONGO_URI=mongodb://root:example@localhost:27017/pcstore?authSource=admin

# JWT
JWT_SECRET=super-secret-key-2026
```

### 4. Instalar Dependencias
```bash
npm install
```

### 5. Iniciar la Aplicación
```bash
# Modo desarrollo con recarga automática
npm run start:dev
```

---

## 🔐 Ejemplos de Autenticación

**1. Registro de Usuario:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "Password123!", "firstName": "Test", "lastName": "User"}'
```

**2. Inicio de Sesión:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "Password123!"}'
# Retorna: { "token": "ey..." }
```

**3. Usar el Token (Petición Autenticada):**
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer ey..."
```

---

## 📚 Documentación Interactiva (Swagger)

La API cuenta con documentación autogenerada y visual interactiva.
Una vez que el servidor esté corriendo, abre tu navegador en:
👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

Desde Swagger puedes probar todos los endpoints y ver la estructura exacta de las peticiones (DTOs) y respuestas. Las rutas protegidas requieren autenticación con Token JWT.

---

## ✅ Pruebas Unitarias

El proyecto incluye pruebas unitarias con **Jest** y **@nestjs/testing** para los servicios, controladores
y el módulo de autenticación. No se usa base de datos real: los repositorios de TypeORM y los modelos de
Mongoose se simulan con mocks (`jest.fn()`).

```bash
# Instalar dependencias
npm install

# Ejecutar todas las pruebas unitarias
npm test

# Ejecutar las pruebas y generar el reporte de cobertura
npm run test:cov
```

El reporte de cobertura se genera en la carpeta `/coverage`. Para verlo de forma visual, abre
`coverage/lcov-report/index.html` en tu navegador.

> Si `npm test` falla con `Module ts-jest in the transform option was not found`, borra `node_modules`
> y `package-lock.json` y vuelve a correr `npm install` (suele deberse a versiones de `jest-*` desincronizadas).

Cada módulo (`auth`, `products`, `categories`, `orders`, `cart`, `brands`, `reviews`, `users`) tiene sus
archivos `*.spec.ts` junto al código fuente correspondiente, cubriendo operaciones CRUD, manejo de errores
(`NotFoundException`, `BadRequestException`, `ConflictException`, `UnauthorizedException`) y, en el caso de
`auth`, el registro, inicio de sesión y generación/validación de JWT.

## 🧪 Pruebas Manuales y Colecciones

En la carpeta `/test` encontrarás los recursos necesarios para validar la API:

- **Postman:** Importa el archivo `test/postman/pc_store_collection.json` en Postman. Incluye el flujo completo (Registro -> Login -> Crear Categoría -> Crear Producto -> Añadir al Carrito -> Finalizar Compra).
- **Pruebas de Estrés (k6):** Ejecuta `test/stress/k6_stress_test.js` para simular tráfico de múltiples usuarios concurrentes validando los SLA de la aplicación.

---

## 👥 Resumen de Endpoints

| Módulo | Método | Ruta | Descripción | Auth | Rol |
|--------|--------|------|-------------|------|-----|
| **Auth** | POST | `/auth/register` | Registro de usuario | No | Público |
| **Auth** | POST | `/auth/login` | Inicio de sesión | No | Público |
| **Users** | GET | `/users` | Listar usuarios | Sí | Admin |
| **Brands** | GET | `/brands` | Listar marcas | No | Público |
| **Brands** | POST | `/brands` | Crear marca | Sí | Admin |
| **Categories**| GET | `/categories` | Listar categorías | No | Público |
| **Categories**| POST | `/categories` | Crear categoría | Sí | Admin |
| **Products** | GET | `/products` | Listar productos | No | Público |
| **Products** | POST | `/products` | Crear producto | Sí | Admin |
| **Cart** | GET | `/cart` | Ver carrito activo | Sí | Client/Admin |
| **Cart** | POST | `/cart/items` | Añadir al carrito | Sí | Client/Admin |
| **Orders** | POST | `/orders` | Crear orden (Checkout) | Sí | Client/Admin |
| **Reviews**| POST | `/review-details` | Reseña extendida (MongoDB) | Sí | Client |

*(Para ver todos los detalles, DTOs y códigos de error, consulta la documentación viva en Swagger).*
