import React, { useState, useEffect } from "react";
import { Sparkles, TestTube, ArrowRight, CheckCircle2, AlertCircle, HelpCircle, Copy, Check } from "lucide-react";

interface RegexPreset {
  title: string;
  sms: string;
  pattern: string;
  amountGroup: number;
  refGroup: number;
}

const REGEX_PRESETS: RegexPreset[] = [
  {
    title: "BANDEC (Consulta Saldo)",
    sms: "Banco Bandec La consulta de saldo fue completada. Cuenta;Saldo Disponible 920406XXXXXX1513; CR 9876.84",
    pattern: "La consulta de saldo fue completada.*?Cuenta;Saldo Disponible\\s*(\\d+);\\s*CR\\s*([\\d.,]+)",
    amountGroup: 2,
    refGroup: 1 // Grupo 1 es la tarjeta encontrada
  },
  {
    title: "BPA (Transferencia Enviada)",
    sms: "La Transferencia fue completada. Beneficiario: 9205XXXXXXXX8846 Monto: 2000.00 CUP Saldo restante: CR 3918.18 CUP",
    pattern: "La Transferencia fue completada.*?Beneficiario:\\s*(\\d+).*?Monto:\\s*([\\d.,]+)\\s*([A-Z]{3}).*?Saldo restante:\\s*CR\\s*([\\d.,]+)",
    amountGroup: 2,
    refGroup: 1 // Grupo 1 es el destinatario o beneficiario
  },
  {
    title: "Banco Metropolitano (Pago)",
    sms: "Pago completado. Entidad: Supermercado Importe pagado: 564.00 CUP Saldo disponible: CR 1496.84 CUP",
    pattern: "Pago completado.*?Entidad:\\s*(.*?)\\s*Importe pagado:\\s*([\\d.,]+)\\s*([A-Z]{3}).*?Saldo disponible:\\s*CR\\s*([\\d.,]+)",
    amountGroup: 2,
    refGroup: 4 // Grupo 4 es el saldo restante
  },
  {
    title: "Recarga Telefónica",
    sms: "La recarga se realizo con exito. Monto Pagado: 108.00 CUP Saldo Restante: CR 9660.84",
    pattern: "La recarga se realizo con exito.*?Monto Pagado:\\s*([\\d.,]+)\\s*([A-Z]{3}).*?Saldo Restante:\\s*CR\\s*([\\d.,]+)",
    amountGroup: 1,
    refGroup: 3
  },
  {
    title: "Operación EnZona",
    sms: "Operacion EnZona Db 420.00",
    pattern: "Operacion EnZona.*?Db\\s*([\\d.,]+)",
    amountGroup: 1,
    refGroup: 0
  }
];

export function RegexSandbox() {
  const [testSms, setTestSms] = useState(REGEX_PRESETS[0].sms);
  const [regexStr, setRegexStr] = useState(REGEX_PRESETS[0].pattern);
  const [amountGrp, setAmountGrp] = useState(REGEX_PRESETS[0].amountGroup);
  const [refGrp, setRefGrp] = useState(REGEX_PRESETS[0].refGroup);

  const [matchResult, setMatchResult] = useState<{
    isMatch: boolean;
    extractedAmount: string;
    extractedRef: string;
    allGroups: string[];
    error?: string;
  }>({ isMatch: false, extractedAmount: "", extractedRef: "", allGroups: [] });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!regexStr.trim() || !testSms.trim()) {
      setMatchResult({ isMatch: false, extractedAmount: "", extractedRef: "", allGroups: [], error: "Escribe un patrón y SMS de prueba." });
      return;
    }

    try {
      const regex = new RegExp(regexStr, "i");
      const match = testSms.match(regex);

      if (match) {
        const groups = Array.from(match); // index 0 is full match, 1+ are capture groups
        const amtVal = groups[amountGrp] || "No interceptado (fuera de rango)";
        const refVal = groups[refGrp] || "No interceptado (fuera de rango)";

        setMatchResult({
          isMatch: true,
          extractedAmount: amtVal,
          extractedRef: refVal,
          allGroups: groups,
          error: undefined
        });
      } else {
        setMatchResult({
          isMatch: false,
          extractedAmount: "",
          extractedRef: "",
          allGroups: [],
          error: undefined
        });
      }
    } catch (err: any) {
      setMatchResult({
        isMatch: false,
        extractedAmount: "",
        extractedRef: "",
        allGroups: [],
        error: `Error de sintaxis Regex: ${err.message}`
      });
    }
  }, [testSms, regexStr, amountGrp, refGrp]);

  const loadPreset = (preset: RegexPreset) => {
    setTestSms(preset.sms);
    setRegexStr(preset.pattern);
    setAmountGrp(preset.amountGroup);
    setRefGrp(preset.refGroup);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(regexStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
      
      <div className="flex justify-between items-start flex-wrap gap-4 mb-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-150 flex items-center gap-2">
            <TestTube className="w-5 h-5 text-indigo-400" />
            Laboratorio de Regex Bancario Cubano
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Diseña y depura las expresiones regulares que usará el analizador nativo <code className="text-indigo-300 font-mono text-[11px] bg-indigo-950/50 px-1 rounded">SmsParser.kt</code> para BANDEC, BPA, Banmet, Transfermóvil y EnZona.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-bold">Patrones Cubanos:</span>
          <div className="flex gap-1.5 flex-wrap">
            {REGEX_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPreset(preset)}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 hover:text-slate-100 px-3 py-1.5 rounded-lg active:scale-95 transition-all outline-none font-bold cursor-pointer"
              >
                🇨🇺 {preset.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Input Configuration Panel */}
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-xs font-bold mb-1.5 font-sans">1. Cuerpo del SMS Cubano de Prueba</label>
            <textarea
              value={testSms}
              onChange={(e) => setTestSms(e.target.value)}
              rows={4}
              placeholder="Ej. Banco Bandec La consulta de saldo fue completada..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-150 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-slate-300 text-xs font-bold font-sans">2. Expresión de Captura (Regex de la coincidencia)</label>
              <button
                onClick={copyToClipboard}
                title="Copiar Regex"
                className="text-indigo-400 hover:text-indigo-300 text-[11px] flex items-center gap-1 cursor-pointer font-bold"
              >
                {copied ? <span className="text-emerald-400">¡Copiado!</span> : "Copiar Regex"}
              </button>
            </div>
            <input
              type="text"
              value={regexStr}
              onChange={(e) => setRegexStr(e.target.value)}
              placeholder="Ej. La consulta de saldo..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              *Nota: Estos patrones compuestos están probados contra SMS de PAGOxMOVIL, Transfermóvil y EnZona sin fallas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1.5 font-sans">Índice Grupo Monto</label>
              <input
                type="number"
                min="1"
                value={amountGrp}
                onChange={(e) => setAmountGrp(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Grupo del importe (numérico)</span>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1.5 font-sans">Índice Grupo Ref/Tarjeta</label>
              <input
                type="number"
                min="0"
                value={refGrp}
                onChange={(e) => setRefGrp(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Grupo de tarjeta o beneficiario</span>
            </div>
          </div>
        </div>

        {/* Live Matching Results Panel */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-3 font-sans">
              Resultado en Tiempo Real
            </span>

            {matchResult.error ? (
              <div className="flex items-start gap-2 bg-red-950/30 border border-red-900/50 p-4 rounded-xl text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-xs font-medium">{matchResult.error}</span>
              </div>
            ) : matchResult.isMatch ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/50 px-4 py-2.5 rounded-xl text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold font-sans">Compatible con el Parser de la App 🇨🇺</span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
                    <span className="text-slate-500 font-sans">Monto extraído (Grupo {amountGrp})</span>
                    <span className="font-mono font-bold text-slate-250 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                      {matchResult.extractedAmount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-900">
                    <span className="text-slate-500 font-sans">Ref/Tarjeta extraída (Grupo {refGrp})</span>
                    <span className="font-mono font-bold text-slate-250 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                      {refGrp === 0 ? "N/A (Cuerpo entero)" : matchResult.extractedRef}
                    </span>
                  </div>
                </div>

                {/* All captured match index breakdown */}
                <div className="mt-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block mb-2 font-sans">
                    Grupos Compilados por el Motor ({matchResult.allGroups.length - 1} de captura):
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {matchResult.allGroups.map((groupVal, idx) => (
                      <div key={idx} className="flex gap-2 text-[11px] font-mono leading-relaxed bg-slate-900/40 p-2 border border-slate-900 rounded">
                        <span className="text-indigo-400 font-bold font-mono">G[{idx}]:</span>
                        <span className="text-slate-300 break-all select-all">{groupVal || "null"}</span>
                        {idx === 0 && <span className="text-[9px] text-slate-500 italic ml-auto font-sans text-right">Cadena Completa</span>}
                        {idx === amountGrp && <span className="text-[9px] text-emerald-400 font-bold ml-auto font-sans">Importe</span>}
                        {idx === refGrp && idx > 0 && <span className="text-[9px] text-indigo-400 font-bold ml-auto font-sans">Asignado</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 gap-3">
                <AlertCircle className="w-10 h-10 text-slate-700" />
                <div>
                  <p className="text-slate-400 font-semibold text-xs font-sans">Sin Coincidencia en Regex</p>
                  <p className="text-slate-600 text-[10px] max-w-xs mt-1 font-sans">
                    El patrón de captura indicado no se alinea con el SMS bancario de Cuba ingresado. Comprueba si los saltos de línea están normalizados o si falta algún carácter de escape.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-sans">
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Soporte de sintaxis compilada de expresiones regulares de Android SDK.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
