import React, { useState } from "react";
import { androidCodebase } from "../androidCodebase";
import { Folder, File, Copy, Check, FileCode, AppWindow, Database, Cpu, Settings } from "lucide-react";

export function CodeExplorer() {
  const [selectedFile, setSelectedFile] = useState(androidCodebase[2]); // Default on TransferEntity.kt
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    { key: "all", label: "Todos los archivos" },
    { key: "room", label: "Modelos Room DB", icon: <Database className="w-3.5 h-3.5" /> },
    { key: "ui", label: "Vistas y Activities", icon: <AppWindow className="w-3.5 h-3.5" /> },
    { key: "receiver", label: "BroadcastReceiver", icon: <Cpu className="w-3.5 h-3.5" /> },
    { key: "mvvm", label: "Capa Repositorio/MVVM", icon: <FileCode className="w-3.5 h-3.5" /> },
    { key: "config", label: "Configuraciones Gradle/Regex", icon: <Settings className="w-3.5 h-3.5" /> }
  ];

  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFiles = activeCategory === "all" 
    ? androidCodebase 
    : androidCodebase.filter(f => f.category === activeCategory);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* File Navigation sidebar */}
      <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[650px]">
        <h3 className="text-sm font-semibold text-slate-205 mb-3 flex items-center gap-2 px-1">
          <Folder className="w-4 h-4 text-amber-500" />
          Proyectos Android (Archivos de Código)
        </h3>

        {/* Category Filters pills */}
        <div className="flex flex-wrap gap-1 mb-4 border-b border-slate-800 pb-3">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                activeCategory === cat.key 
                  ? "bg-indigo-600 text-white" 
                  : "bg-slate-950 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* File item list */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {filteredFiles.map((file) => (
            <button
              key={file.path}
              onClick={() => {
                setSelectedFile(file);
                setCopied(false);
              }}
              className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer ${
                selectedFile.path === file.path 
                  ? "bg-indigo-950/40 border border-indigo-800/40 text-indigo-300"
                  : "bg-transparent border border-transparent hover:bg-slate-950 text-slate-400 hover:text-slate-200"
              }`}
            >
              <File className={`w-4 h-4 shrink-0 mt-0.5 ${
                file.path.endsWith(".kts") ? "text-amber-500" :
                file.path.endsWith(".xml") ? "text-teal-500" : "text-blue-400"
              }`} />
              <div className="min-w-0">
                <span className="font-bold text-xs block truncate">{file.name}</span>
                <span className="text-[10px] text-slate-500 font-mono block truncate mt-0.5">{file.path}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Code Display Area */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[650px] overflow-hidden">
        
        {/* Code Header with Details */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-start">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-indigo-400 uppercase tracking-widest font-bold">
                {selectedFile.language.toUpperCase()} FILE
              </span>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded-full font-semibold">
                {selectedFile.category.toUpperCase()}
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-200 truncate mt-1">{selectedFile.name}</h4>
            <span className="text-slate-500 text-[11px] font-mono block mt-0.5 truncate">{selectedFile.path}</span>
          </div>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 text-xs px-3.5 py-1.5 rounded-xl border font-semibold transition-all active:scale-95 cursor-pointer ${
              copied 
                ? "bg-emerald-950 text-emerald-300 border-emerald-800" 
                : "bg-indigo-600 text-white hover:bg-indigo-500 border-indigo-500"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copiado
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copiar Código
              </>
            )}
          </button>
        </div>

        {/* Small feature description */}
        <div className="bg-slate-950/80 px-6 py-2.5 border-b border-slate-850 text-xs text-slate-400 italic">
          <span className="font-bold text-slate-300 not-italic">Propósito:</span> {selectedFile.description}
        </div>

        {/* Actual source code container using native formatting & aesthetics */}
        <div className="flex-1 overflow-auto bg-slate-950 p-6 font-mono text-xs text-slate-350 leading-relaxed scrollbar-thin select-text">
          <pre className="relative selection:bg-indigo-500/20 whitespace-pre">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
