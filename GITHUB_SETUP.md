# 📦 Instrucciones para Conectar con GitHub

## Paso 1: Crear el Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: **presupuesto-gongar**
3. Descripción: "Sistema privado de presupuesto familiar con Next.js, Firebase y Gemini AI"
4. Selecciona **Private** (repositorio privado)
5. **NO** marques "Initialize this repository with a README"
6. Click en "Create repository"

## Paso 2: Conectar tu Repositorio Local

Copia y ejecuta estos comandos en tu terminal (reemplaza `TU_USUARIO` con tu usuario de GitHub):

```bash
cd presupuesto-gongar

# Añadir el repositorio remoto
git remote add origin https://github.com/TU_USUARIO/presupuesto-gongar.git

# Renombrar la rama a main (si es necesario)
git branch -M main

# Subir el código
git push -u origin main
```

### Ejemplo con tu usuario (magv1287):
```bash
git remote add origin https://github.com/magv1287/presupuesto-gongar.git
git branch -M main
git push -u origin main
```

## Paso 3: Verificar

1. Refresca la página de tu repositorio en GitHub
2. Deberías ver todos los archivos del proyecto

## 🚀 Siguiente: Deploy en Vercel

Una vez que el código esté en GitHub:

1. Ve a https://vercel.com
2. Click en "Add New..." > "Project"
3. Importa tu repositorio `presupuesto-gongar`
4. Configura las variables de entorno (copia desde `.env.local`):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_ALLOWED_EMAILS`
5. Click "Deploy"

¡Listo! Tu app estará en producción en ~2 minutos.
