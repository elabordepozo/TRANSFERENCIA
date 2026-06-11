# Control de Transferencias Bancarias Cubanas (Android Native + Web Sandbox)

Este repositorio contiene un proyecto dual diseñado para automatizar y administrar de forma totalmente segura y local las transferencias bancarias en Cuba mediante el escaneo e intercepción inteligente de mensajes SMS de **BANDEC, BPA, Banco Metropolitano**, y pasarelas oficiales como **Transfermóvil** y **EnZona**.

## 🌟 Componentes del Repositorio

El repositorio está estructurado en dos partes esenciales para su desarrollo, pruebas y despliegue:

1. **📱 Simulador Web & Analizador (Directorio Actual: React + Vite + TypeScript + Tailwind)**
   * Simulador visual interactivo de un dispositivo Android de diseño moderno cubano.
   * Caja de arena (sandbox) para pruebas de expresiones regulares (Regex) de Cuba en vivo.
   * Guías y previsualizador del código de programación completo para Android nativo.

2. **🤖 App Android Nativa (Directorio `src/androidCodebase.ts` y pestaña 'Fuente Kotlin Completo')**
   * Desarrollo listo para Android Studio usando **Kotlin, Jetpack Compose, Arquitectura MVVM, Room DB nativa y Coroutines asíncronas**.
   * Monitoreo en segundo plano mediante `BroadcastReceiver` sincronizado de forma transparente.
   * Almacenamiento e indexación local SQLite optimizado en Room para soportar más de 100,000 transacciones simultáneas de forma ultra fluida.

---

## 🚀 1. Ejecutar e Iniciar el Simulador Web de Pruebas (React + Vite)

Este es el sandbox web que sirve para emular el flujo, probar las regex y visualizar las vistas de Jetpack Compose antes de pasarlas a producción.

### Requisitos previos
* [Node.js](https://nodejs.org/) (versión 18 o superior)
* Administrador de paquetes `npm` (incluido con Node.js)

### Instrucciones de compilación local

1. **Clonar e ingresar al repositorio:**
   ```bash
   git clone <url-de-tu-repositorio-en-github>
   cd <nombre-del-repositorio>
   ```

2. **Instalar todas las dependencias necesarias:**
   ```bash
   npm install
   ```

3. **Arrancar el servidor de desarrollo local:**
   ```bash
   npm run dev
   ```
   * Abre tu navegador preferido en: [http://localhost:3000](http://localhost:3000)

4. **Compilar el proyecto para Producción (Despliegue estático en GitHub Pages, Vercel, Netlify):**
   ```bash
   npm run build
   ```
   * Generará los archivos finales de forma compactada y optimizada en la carpeta `/dist`.

---

## 📱 2. Compilar la App Nativa en Android Studio (Kotlin + Room + Jetpack Compose)

Para compilar la aplicación móvil nativa que correrá directamente en dispositivos Android reales y procesará los SMS en Cuba, sigue las siguientes instrucciones:

### Configurar el Proyecto

1. **Crear el proyecto en Android Studio:**
   * Selecciona **New Project** > **Empty Activity** (con Jetpack Compose integrado por defecto).
   * Configura las propiedades iniciales:
     * **Name:** `Control de Transferencias Bancarias`
     * **Package Name:** `com.cubanbank.controltransferencias`
     * **Language:** `Kotlin`
     * **Minimum SDK:** `26 (Android 8.0 Oreo)` o superior para soporte completo de notificaciones y permisos modernos.
     * **Build Configuration Language:** `Kotlin DSL (build.gradle.kts)`

2. **Configurar dependencias en `app/build.gradle.kts`:**
   Asegúrate de agregar las dependencias de **Room SQLite**, Jetpack Compose, y Coroutines necesarias. Puedes encontrar el archivo gradle entero de configuración en el explorador de código interactivo (`src/androidCodebase.ts` bajo la ruta `app/build.gradle.kts`).

3. **Modificar el archivo `app/src/main/AndroidManifest.xml`:**
   Declara los permisos específicos para poder leer los SMS de la SIM y recibir los nuevos eventos entrantes:
   ```xml
   <!-- Permisos de SMS requeridos para rastreo offline en Cuba -->
   <uses-permission android:name="android.permission.READ_SMS" />
   <uses-permission android:name="android.permission.RECEIVE_SMS" />
   <uses-permission android:name="android.permission.READ_PHONE_STATE" />

   <!-- Registro de receptor en segundo plano -->
   <receiver
       android:name=".receiver.SmsReceiver"
       android:enabled="true"
       android:exported="true"
       android:permission="android.permission.BROADCAST_SMS">
       <intent-filter android:priority="999">
           <action android:name="android.provider.Telephony.SMS_RECEIVED" />
       </intent-filter>
   </receiver>
   ```

### Estructura del Código Kotlin

Puedes ver el código detallado dentro de la pestaña **Fuente Kotlin Completo** en el emulador de arriba. Copia cada archivo en su ruta homóloga respectiva en tu directorio de Android Studio:

* **SmsReceiver.kt:** Intercepta en el aire el SMS de `Transfermovil` o `EnZona` para procesar créditos y débitos al instante.
* **SmsParser.kt:** Clase inteligente con expresiones regulares (Regex) optimizadas para analizar ingresos, egresos, transferencias por número de transacción, recargas y consultas de saldo.
* **TarjetaEntity.kt & MovimientoEntity.kt:** Entidades de base de datos local seguras.
* **AppDatabase.kt & TarjetaDao.kt & MovimientoDao.kt:** Configuración del motor SQL Room para consultas super rápidas.
* **SmsViewModel.kt:** Puente MVVM que gestiona flujos asíncronos mediante `StateFlow` y carga los SMS históricos del teléfono usando `ContentResolver`.
* **MainActivity.kt & ComposeUI:** Componentes interactivos que dibujan la hermosa interfaz para ver saldos unificados, transferencias, y filtros por tarjetas bancarias.

---

## 🔒 Privacidad y Seguridad Local Garantizada

Tanto el código de la App nativa como el emulador Web siguen estrictas normas de seguridad bancaria adaptadas a las condiciones locales de Cuba:

* **100% Offline-First:** Toda transacción y parseo se procesa directo en la CPU del teléfono.
* **Sin conexión externa:** No requiere internet ni servidores cloud centrales para analizar, sincronizar, ni registrar datos de saldos móviles.
* **Enmascaramiento inmediato:** La parte sensible de los números de tarjetas se oculta, guardando únicamente los últimos 4 dígitos.
* **Cumplimiento Bancario:** El software jamás solicitará claves de tarjetas de coordenadas multibanca, contraseñas del módulo de seguridad de Transfermóvil, ni códigos PIN o contraseñas OTP recibidos por SMS. Su función es estrictamente de lectura y conciliación pasiva.

---

## 🛠️ Scripts Útiles para el Simulador

En el directorio del simulador web puedes usar:
* `npm run dev` - Abre el servidor interactivo local de desarrollo rápido.
* `npm run build` - Genera una versión lista para producción optimizada en la carpeta `/dist`.
* `npm run lint` - Evalúa problemas de sintaxis o de formato en el código de React/TS.
* `npm run preview` - Previsualiza localmente el build compilado del directorio `/dist`.
