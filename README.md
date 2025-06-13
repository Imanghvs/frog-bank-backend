# 🐸 Frog Bank Backend

A modern and modular banking backend built with **NestJS**, **TypeORM**, and **PostgreSQL**.

## 🛠 Setup

### 1. Clone & Install

```bash
git clone https://github.com/Imanghvs/frog-bank-backend.git
cd frog-bank-backend
npm install
```

### 2. Environmental Variables

There is a file named `.env.example` in the root of the project.
You can make your `.env` file similarly.

### 3. Database

Login in your PostgreSQL database, create a user with a password,
and grant the user all the necessary privileges. Example:

```sql
CREATE DATABASE frogbank;
GRANT ALL PRIVILEGES ON DATABASE frogbank TO froguser;
```

Run the migrations:

```bash
npm run migration:run
```

### 4. Start the app

```bash
npm run start:dev
```

## Automated Tests

```bash
npm run test       # Unit tests
npm run test:e2e   # End-to-end tests
```
