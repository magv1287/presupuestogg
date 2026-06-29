# 🚀 Guía de Configuración Rápida - Presupuesto GonGar

## Paso 1: Configurar Firebase (15 minutos)

### 1.1 Crear Proyecto Firebase
1. Ve a https://console.firebase.google.com
2. Click en "Add project" / "Agregar proyecto"
3. Nombre: **Presupuesto GonGar**
4. Desactiva Google Analytics (opcional)
5. Click "Create project"

### 1.2 Habilitar Google Authentication
1. En el menú lateral, ve a **Build** > **Authentication**
2. Click "Get started"
3. En la pestaña "Sign-in method", click en **Google**
4. Activa el toggle "Enable"
5. Selecciona un email de soporte (tu email)
6. Click "Save"

### 1.3 Crear Base de Datos Firestore
1. En el menú lateral, ve a **Build** > **Firestore Database**
2. Click "Create database"
3. Selecciona **Production mode**
4. Elige una ubicación (ej: us-central)
5. Click "Enable"

### 1.4 Obtener Credenciales
1. Ve a **Project Settings** (ícono de engranaje arriba a la izquierda)
2. En la pestaña "General", baja hasta "Your apps"
3. Click en el ícono **</>** (Web)
4. Nombre de la app: **Presupuesto GonGar Web**
5. NO marques "Firebase Hosting"
6. Click "Register app"
7. **COPIA** las credenciales que aparecen (las necesitarás en el siguiente paso)

---

## Paso 2: Configurar Variables de Entorno (5 minutos)

1. Abre el archivo `.env.local` en el proyecto
2. Reemplaza los valores vacíos con las credenciales de Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=presupuesto-gongar.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=presupuesto-gongar
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=presupuesto-gongar.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

3. Obtén tu API Key de Gemini:
   - Ve a https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copia la key y pégala en:

```env
GEMINI_API_KEY=AIza...
```

---

## Paso 3: Desplegar Reglas de Firestore (5 minutos)

### Opción A: Desde la Consola de Firebase (Más fácil)
1. Ve a **Firestore Database** en Firebase Console
2. Click en la pestaña **Rules**
3. Copia y pega el contenido del archivo `firestore.rules` del proyecto
4. Click "Publish"

### Opción B: Desde la Terminal (Recomendado)
```bash
# Instalar Firebase CLI (solo la primera vez)
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar proyecto (en la carpeta presupuesto-gongar)
firebase init firestore
# Selecciona el proyecto que creaste
# Acepta los archivos por defecto

# Desplegar reglas
firebase deploy --only firestore:rules
```

---

## Paso 4: Ejecutar el Proyecto (2 minutos)

```bash
# En la carpeta presupuesto-gongar
npm run dev
```

Abre http://localhost:3000

---

## Paso 5: Primer Login (2 minutos)

1. Click en "Iniciar sesión con Google"
2. Selecciona tu cuenta (gcgv25@gmail.com o magv.1287@gmail.com)
3. Autoriza la aplicación
4. Deberías ver el dashboard

---

## Paso 6: Configurar Perfil (2 minutos)

1. Click en "Configuración"
2. Completa:
   - Nombre
   - Ingresos mensuales estimados
   - Cuentas de ahorro (separadas por comas)
3. Click "Guardar Cambios"

---

## ✅ ¡Listo! Ahora puedes:

1. **Cargar Transacciones**: Sube archivos CSV de tus bancos
2. **Comparar Meses**: Selecciona meses y analiza con IA
3. **Ver Análisis**: Obtén recomendaciones de Gemini

---

## 🚨 Solución de Problemas

### Error: "Acceso denegado"
- Verifica que estés usando gcgv25@gmail.com o magv.1287@gmail.com
- Revisa que las reglas de Firestore estén desplegadas

### Error: "Firebase not configured"
- Verifica que el archivo `.env.local` tenga todas las variables
- Reinicia el servidor de desarrollo (`npm run dev`)

### Error: "Gemini API error"
- Verifica que tu API Key de Gemini sea válida
- Asegúrate de que la variable `GEMINI_API_KEY` esté en `.env.local`

---

## 📞 Soporte

Si tienes problemas, revisa:
1. La consola del navegador (F12)
2. La terminal donde corre `npm run dev`
3. Los logs de Firebase Console

---

**Tiempo total estimado: ~30 minutos**
