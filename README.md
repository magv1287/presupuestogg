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

**GonGar** - Presupuesto Familiar Inteligente 💚
