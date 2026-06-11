import React, { useState } from "react";
import { PhoneSimulator } from "./components/PhoneSimulator";
import { CodeExplorer } from "./components/CodeExplorer";
import { RegexSandbox } from "./components/RegexSandbox";
import { 
  Smartphone, Code, TestTube, BookOpen, AlertCircle, 
  ShieldAlert, Database, Laptop, Info, ArrowRight, CheckCircle2, Cpu
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"simulator" | "code" | "sandbox" | "guide">("simulator");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* HEADER SECTION with visual badges */}
      <header className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1 px-2.5 rounded-md text-[10px] font-bold tracking-widest bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 font-mono uppercase">
                EMULADOR EN VIVO & VISOR ANDROID 🇨🇺
              </span>
              <span className="p-1 px-2 rounded-md text-[10px] font-bold bg-indigo-950/40 text-indigo-400 border border-indigo-900/60 font-mono">
                ROOM DB + JETPACK COMPOSE
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2">
              Control Transferencias Bancarias
            </h1>
            <p className="text-xs text-slate-450 mt-1 leading-relaxed max-w-2xl">
              Monitoreo automático y procesamiento offline de SMS de bancos cubanos (**BANDEC, BPA, Banco Metropolitano**) y pasarelas de pago (**Transfermóvil, EnZona**) con registro y conciliación de saldos automático.
            </p>
          </div>

          {/* Quick status information boxes */}
          <div className="flex gap-4 items-center shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-500 uppercase block font-bold font-mono">Seguridad Bancaria</span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 justify-end">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Sin Servidor / Local
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-850 hidden sm:block" />
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block font-bold font-mono">Rendimiento</span>
              <span className="text-xs text-indigo-300 font-semibold font-mono">&gt;100k SMS Compilables</span>
            </div>
          </div>
        </div>
      </header>

      {/* PERSISTENT SECURITY WARNING / CORE DIRECTIVE */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950/30 to-slate-950 border-b border-emerald-900/40 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3 text-xs text-emerald-300">
          <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="leading-normal">
            <strong>Declaración de Privacidad Local Custodiada:</strong> De acuerdo con los estrictos requerimientos bancarios de Cuba, toda la información se almacena de manera exclusiva de forma local empleando la API Room SQLite interna del dispositivo. **No se envían datos a servidores externos, ni se almacenan contraseñas, PINs o códigos OTP de un solo uso.**
          </span>
        </div>
      </div>

      {/* CORE LAYOUT WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {/* TABS CONTROLLERS BOARD */}
        <div className="flex space-x-1.5 bg-slate-900/60 p-1 rounded-2xl border border-slate-800 mb-8 max-w-full overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab("simulator")}
            style={{ contentVisibility: "auto" }}
            className={`px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "simulator"
                ? "bg-emerald-600 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            📱 Sandbox de Operaciones SMS
          </button>

          <button
            onClick={() => setActiveTab("code")}
            style={{ contentVisibility: "auto" }}
            className={`px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "code"
                ? "bg-emerald-600 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code className="w-4 h-4" />
            📂 Fuente Kotlin Completo
          </button>

          <button
            onClick={() => setActiveTab("sandbox")}
            style={{ contentVisibility: "auto" }}
            className={`px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "sandbox"
                ? "bg-emerald-600 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TestTube className="w-4 h-4" />
            🧪 Laboratorio Regex Cuba
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            style={{ contentVisibility: "auto" }}
            className={`px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "guide"
                ? "bg-emerald-600 text-white shadow-lg"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            📘 Manual de Compilación
          </button>
        </div>

        {/* TABS CONTAINER PANELS */}
        <div>
          {activeTab === "simulator" && (
            <div className="animate-fade-in font-sans">
              <PhoneSimulator />
            </div>
          )}

          {activeTab === "code" && (
            <div className="animate-fade-in">
              <CodeExplorer />
            </div>
          )}

          {activeTab === "sandbox" && (
            <div className="animate-fade-in font-sans">
              <RegexSandbox />
            </div>
          )}

          {activeTab === "guide" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in font-sans">
              
              {/* Build Instructions Guide */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6.5 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Laptop className="w-5 h-5 text-emerald-400" />
                    Guía de Compilación en Android Studio
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Instrucciones claras para importar, compilar y ejecutar **Control Transferencias Bancarias** en tu dispositivo.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-805/50 flex items-center justify-center font-bold text-xs text-emerald-300 shrink-0">
                      1
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-200">Crear Proyecto Jetpack Compose</h4>
                      <p className="text-xs text-slate-450 leading-relaxed">
                        Abre Android Studio, selecciona <strong>New Project</strong> y elige <strong>Empty Activity</strong>. Configura las siguientes variables importantes:
                      </p>
                      <ul className="text-xs text-emerald-350 list-disc list-inside space-y-1 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                        <li>Package Name: com.cubanbank.controltransferencias</li>
                        <li>Language: Kotlin</li>
                        <li>Minimum SDK: 26 (Android 8.0)</li>
                        <li>Build Configuration Language: Kotlin DSL (build.gradle.kts)</li>
                      </ul>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-805/50 flex items-center justify-center font-bold text-xs text-emerald-300 shrink-0">
                      2
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-200">Configurar Tablas local en Room (Tarjetas y Movimientos)</h4>
                      <p className="text-xs text-slate-450 leading-relaxed">
                        Copia las entidades `TarjetaEntity.kt` y `MovimientoEntity.kt` en tu paquete de persistencia de datos. Están optimizadas con índices de base de datos en Room para permitir una paginación e indexación de más de 100,000 SMS simultáneos sin causar bloqueos o congelamiento en los fotogramas de la interfaz visual.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-805/50 flex items-center justify-center font-bold text-xs text-emerald-300 shrink-0">
                      3
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-200">Definir Permisos Críticos en AndroidManifest.xml</h4>
                      <p className="text-xs text-slate-450 leading-relaxed">
                        Asegúrate de agregar los permisos oficiales para poder recuperar mensajes históricos e interceptar los nuevos que ingresen de forma espontánea:
                      </p>
                      <pre className="text-[10px] text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-900 overflow-x-auto">
{`<!-- Permisos de Sms cubanos -->
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.RECEIVE_SMS" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />`}
                      </pre>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-805/50 flex items-center justify-center font-bold text-xs text-emerald-300 shrink-0">
                      4
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-200">Implementar BroadcastReceiver de SMS</h4>
                      <p className="text-xs text-slate-450 leading-relaxed">
                        El `SmsReceiver.kt` atrapará los eventos de mensajería entrantes (inclusive estando la aplicación cerrada), recuperará los datos numéricos mediante `SmsParser` asíncronamente (utilizando el hilo `Dispatchers.IO` para protección de rendimiento), y actualizará el saldo correspondiente de forma totalmente transparente.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Side constraints and architecture highlights */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Architecture block */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    Monitoreo en 2do Plano
                  </h3>
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="font-bold text-emerald-350 block mb-1">ContentResolver Escaneo:</span>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        Utiliza el cursor nativo de Android apuntando a <code>content://sms/inbox</code> para mapear históricamente y sincronizar la base de datos de una sola vez al iniciar la aplicación.
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-350 block mb-1">Criptografía y Enmascarado:</span>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        Se realiza un enmascarado inmediato en memoria volátil de modo que nunca se guarden datos crudos ni de números de cuentas completos excepto los últimos 4 dígitos.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compliance info */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-400" />
                    Soporte Cuba Completo
                  </h3>
                  <p className="text-xs text-slate-450 leading-relaxed">
                    Nuestros patrones regex cubren consultas de saldos, transferencias emitidas, pasarelas móviles, recargas electrónicas de saldo móvil o transacciones mediante EnZona de forma precisa.
                  </p>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER METADATA */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-550">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>Control Transferencias Bancarias Cubanas Companion Sandbox Tools</span>
          <span className="font-mono text-[10.5px] text-slate-600">Local Time: 2026-06-11T09:25:00Z</span>
        </div>
      </footer>

    </div>
  );
}
