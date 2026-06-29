# Presupuesto GonGar

Sistema privado de presupuesto familiar y análisis de gastos con Next.js, Firebase y Gemini AI.

## 🚀 Características

- **Autenticación Restringida**: Solo usuarios autorizados (gcgv25@gmail.com y magv.1287@gmail.com) pueden acceder
- **Carga de Transacciones**: Sube archivos CSV de Apple Wallet, Capital One y Bank of America
- **Análisis con IA**: Compara gastos mensuales y obtén recomendaciones de Gemini AI
- **Gestión de Perfil**: Configura ingresos mensuales y cuentas de ahorro

## 📋 Requisitos Previos

1. Node.js 18+ instalado
2. Cuenta de Firebase con proyecto creado
3. API Key de Google Gemini

## 🔧 Configuración

### 1. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto llamado "Presupuesto GonGar"
3. Habilita **Authentication** > **Google Sign-in**
4. Crea una base de datos **Firestore** (modo producción)
5. Obtén las credenciales del proyecto:
   - Ve a Project Settings > General
   - En "Your apps", crea una Web App
   - Copia las credenciales de configuración

### 2. Configurar Variables de Entorno

Edita el archivo `.env.local` y completa las variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Gemini AI
GEMINI_API_KEY=tu_gemini_api_key

# Allowed Emails (ya configurado)
NEXT_PUBLIC_ALLOWED_EMAILS=gcgv25@gmail.com,magv.1287@gmail.com
```

### 3. Desplegar Reglas de Firestore

1. Instala Firebase CLI: `npm install -g firebase-tools`
2. Inicia sesión: `firebase login`
3. Inicializa el proyecto: `firebase init firestore`
4. Despliega las reglas: `firebase deploy --only firestore:rules`

### 4. Instalar Dependencias

```bash
cd presupuesto-gongar
npm install
```

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy en Vercel

1. Sube el proyecto a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Configura las variables de entorno en Vercel (las mismas del `.env.local`)
4. Despliega

## 📁 Estructura del Proyecto

```
presupuesto-gongar/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── upload-transactions/  # Endpoint para subir CSV
│   │   └── gemini-analysis/      # Endpoint para análisis IA
│   ├── dashboard/                # Páginas del dashboard
│   │   ├── upload/               # Carga de archivos
│   │   ├── compare/              # Comparador mensual
│   │   └── settings/             # Configuración de perfil
│   ├── layout.tsx                # Layout raíz
│   └── page.tsx                  # Página de login
├── components/
│   └── auth/                     # Componentes de autenticación
├── lib/
│   ├── firebase/                 # Configuración Firebase
│   ├── parsers/                  # Parsers CSV por banco
│   └── gemini.ts                 # Cliente Gemini API
├── types/                        # TypeScript types
├── firestore.rules               # Reglas de seguridad
└── .env.local                    # Variables de entorno
```

## 🔒 Seguridad

- Autenticación con Google OAuth
- Validación de emails en cliente y servidor
- Reglas de Firestore que restringen acceso a emails autorizados
- Variables de entorno para credenciales sensibles

## 📊 Formatos CSV Soportados

### Apple Wallet (Goldman Sachs)
Columnas: Transaction Date, Clearing Date, Description, Merchant, Category, Type, Amount (USD)

### Capital One
Columnas: Transaction Date, Posted Date, Card No., Description, Category, Debit, Credit

### Bank of America
Columnas: Date, Description, Amount, Running Bal.

## 🤖 Análisis con IA

El sistema utiliza Gemini AI para:
- Identificar áreas de recorte de gastos
- Sugerir aumentos de presupuesto necesarios
- Recomendar estrategias de inversión basadas en excedentes

## 📝 Notas

- Los archivos CSV se procesan en el cliente antes de enviarse al servidor
- Las transacciones duplicadas se detectan mediante hash único
- El análisis de IA requiere al menos un mes de datos

## 👥 Usuarios Autorizados

- gcgv25@gmail.com (Grecia)
- magv.1287@gmail.com (Miguel)

---

Desarrollado con ❤️ para la familia GonGar
