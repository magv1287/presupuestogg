# 💰 GonGar - Presupuesto Familiar Inteligente

Sistema privado de presupuesto familiar con análisis de IA para Miguel y Gaby.

## 🎯 Features

### ✅ Autenticación Privada
- Google Sign-In con whitelist estricta (2 emails autorizados)
- Onboarding de 3 pasos (bienvenida, ingreso mensual, cuentas de ahorro)
- Fail-fast en login no autorizado

### 📊 Páginas Principales

#### 1. **Resumen** (`/dashboard/resumen`)
- 4 KPI cards (Ingresos, Gastos, Ahorro, Tasa de Ahorro)
- Comparación vs mes anterior con indicadores visuales
- Gráfica de tendencia mensual (Recharts Bar Chart)
- Gráfica de gastos por categoría (Recharts Donut Chart)
- Top 5 categorías con progress bars

#### 2. **Relación Mensual** (`/dashboard/relacion`)
- **GonGar Advisor**: Análisis IA destacado con score 0-100
- Insights personalizados con datos específicos
- Recomendaciones accionables
- Acordeón de categorías con transacciones
- Pills de categoría y badges de monto

#### 3. **Mi Cuenta** (`/dashboard/cuenta`)
- Perfil de usuario con avatar
- Edición inline de ingreso mensual
- Gestión de cuentas de ahorro (agregar/eliminar)
- Botón de cerrar sesión en danger zone

#### 4. **Subir CSVs** (`/dashboard/upload`)
- Upload múltiple de archivos CSV
- Auto-detección de formato (Apple Wallet, Capital One, Bank of America)
- Preview de transacciones antes de guardar
- Detección de duplicados

### 🏦 CSV Parsers

#### **Apple Card / Goldman Sachs HYSA**
- Columnas: Transaction Date, Clearing Date, Description, Merchant, Category, Type, Amount (USD)
- **Exclusión automática**: Pagos de tarjeta de crédito (Type=Credit + Category=Payment)

#### **Capital One (CC + Savings)**
- Columnas: Transaction Date, Posted Date, Card No., Description, Category, Debit, Credit
- **Exclusión automática**: "Payment Thank You", "Online Payment", "Autopay"

#### **Bank of America**
- Columnas: Date, Description, Amount, Running Bal.
- **Flagging**: Transferencias ("Transfer", "Online Banking Transfer", "Zelle") para revisión manual

### 🤖 GonGar Advisor (Gemini AI)

#### **API de Categorización** (`/api/categorize`)
- Modelo: `gemini-1.5-flash`
- Batch categorization de transacciones
- 13 categorías predefinidas
- Respuesta JSON estructurada

#### **API de Análisis** (`/api/analyze`)
- Modelo: `gemini-1.5-pro`
- **3-Layer Prompt System**:
  1. **System**: Personalidad del advisor (empático, directo, accionable)
  2. **Context**: Datos financieros + comparaciones
  3. **Task**: Estructura JSON con insights/recommendations/score
- Score basado en: tasa de ahorro (40%), balance categorías (30%), tendencias (30%)

### 🎨 Design System

#### **Paleta de Colores**
```css
--bg-primary: #0A0A0F      /* Fondo principal */
--bg-secondary: #111827    /* Cards */
--bg-tertiary: #1F2937     /* Inputs, borders */
--text-primary: #F9FAFB    /* Texto principal */
--text-secondary: #9CA3AF  /* Texto secundario */
--accent-green: #10B981    /* Success, positivo */
--accent-red: #EF4444      /* Error, negativo */
```

#### **Componentes UI**
- `AmountDisplay`: Badge monetario con colores positivo/negativo
- `KPICard`: Métrica con comparación vs periodo anterior
- `Pill`: Badge de categoría con colores predefinidos
- `ConfirmDialog`: Modal de confirmación con variantes
- `EmptyState`: Estado vacío con CTA opcional
- `CollapsibleSection`: Sección plegable animada

### 📁 Estructura del Proyecto

```
presupuesto-gongar/
├── app/
│   ├── login/page.tsx              # Google Sign-In
│   ├── onboarding/page.tsx         # 3-step onboarding
│   ├── dashboard/
│   │   ├── resumen/page.tsx        # KPIs + gráficas
│   │   ├── relacion/page.tsx       # Análisis IA + acordeón
│   │   ├── cuenta/page.tsx         # Perfil + settings
│   │   └── upload/page.tsx         # CSV upload
│   └── api/
│       ├── categorize/route.ts     # Gemini categorization
│       └── analyze/route.ts        # GonGar Advisor
├── components/
│   ├── ui/                         # 6 componentes base
│   ├── charts/                     # Recharts components
│   └── auth/                       # Auth provider + protected route
├── lib/
│   ├── csv-parsers/                # 3 bank parsers + detector
│   ├── firebase/                   # Auth + Firestore
│   ├── utils/                      # Categories, currency, dates
│   └── gemini.ts                   # Gemini AI client
└── types/
    ├── index.ts                    # Transaction, Analysis, etc.
    └── user.ts                     # User, UserProfile
```

## 🚀 Setup

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Crear `.env.local`:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Configurar Firebase
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Google Authentication
3. Crear base de datos Firestore
4. Desplegar reglas de seguridad:
```bash
firebase deploy --only firestore:rules
```

### 4. Ejecutar en Desarrollo
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 🔐 Seguridad

### Whitelist de Emails
Solo estos emails pueden acceder:
- `magv.1287@gmail.com`
- `gcgv25@gmail.com`

Para agregar más usuarios, editar `lib/firebase/auth.ts`:
```typescript
const AUTHORIZED_EMAILS = [
  'magv.1287@gmail.com',
  'gcgv25@gmail.com',
  // Agregar aquí
];
```

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📊 Firestore Schema

### Users Collection
```typescript
{
  uid: string;
  email: string;
  name: string;
  monthlyIncome: number;
  savingsAccounts: string[];
  onboardingCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Transactions Collection
```typescript
{
  userId: string;
  date: string;              // YYYY-MM-DD
  description: string;
  merchant: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  excluded: boolean;
  flagged: boolean;
  source: 'apple-wallet' | 'capital-one' | 'bank-of-america';
  createdAt: Timestamp;
}
```

## 🎯 Roadmap

### ✅ Completado
- [x] Autenticación con whitelist
- [x] Onboarding flow
- [x] CSV parsers (3 bancos)
- [x] Gemini APIs (categorize + analyze)
- [x] Páginas principales (Resumen, Relación, Cuenta)
- [x] Componentes UI base
- [x] Gráficas Recharts
- [x] Sidebar actualizado

### 🚧 Pendiente
- [ ] Integración completa Firestore (reemplazar mock data)
- [ ] Upload flow con drag & drop
- [ ] Detección de duplicados
- [ ] Llamadas reales a APIs de Gemini
- [ ] Mobile responsive (BottomNav)
- [ ] Testing end-to-end
- [ ] Deploy a Vercel

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (Google)
- **AI**: Google Gemini (Flash + Pro)
- **Charts**: Recharts
- **CSV Parsing**: PapaParse

## 📝 Notas

- **Mock Data**: Las páginas actualmente usan mock data. Reemplazar con queries de Firestore.
- **Gemini Integration**: APIs configuradas pero no conectadas a UI. Agregar llamadas en páginas.
- **Mobile**: Sidebar es desktop-only. Agregar BottomNav para mobile.
- **Duplicados**: Sistema de detección pendiente (comparar por date + amount + merchant).

## 👥 Autores

- **Miguel González** - magv.1287@gmail.com
- **Gaby Vitale** - gcgv25@gmail.com

---

**GonGar** - Presupuesto Familiar Inteligente 💚
