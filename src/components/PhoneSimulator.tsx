import React, { useState, useEffect } from "react";
import { SimulatedTransaction, SmsPattern, SimulatedCard, OperationType } from "../types";
import { 
  Smartphone, Inbox, Send, Search, Filter, Trash2, CreditCard,
  ArrowDownLeft, ArrowUpRight, Plus, CheckCircle, Database,
  Download, AlertCircle, RefreshCw, Eye, X, Copy, ChevronRight, Edit2, Settings, SmartphoneIcon, BarChart3, Receipt,
  LayoutDashboard, List, MessageSquare, ShoppingCart, Zap, ShieldAlert, Lock, FileSpreadsheet, FileText, CheckCircle2
} from "lucide-react";

// Initial Cuban Patterns aligned with Banco Metropolitano, BPA, BANDEC, EnZona and Transfermóvil
const CUBAN_PATTERNS: SmsPattern[] = [
  {
    id: "pat_bandec_saldo",
    bankName: "BANDEC (Consulta Saldo)",
    regexPattern: "La consulta de saldo fue completada.*?Cuenta;Saldo Disponible\\s*(\\d+);\\s*CR\\s*([\\d.,]+)",
    sampleSms: "Banco Bandec La consulta de saldo fue completada. Cuenta;Saldo Disponible 920406XXXXXX1513; CR 9876.84",
    amountGroup: 0,
    currencyGroup: 0,
    type: "CONSULTA SALDO",
    accountGroup: 1,
    refGroup: 0,
    balanceGroup: 2
  },
  {
    id: "pat_transf_enviada",
    bankName: "Transfermóvil (Transf. Enviada)",
    regexPattern: "La Transferencia fue completada.*?Beneficiario:\\s*(\\d+).*?Monto:\\s*([\\d.,]+)\\s*([A-Z]{3}).*?Saldo restante:\\s*CR\\s*([\\d.,]+)",
    sampleSms: "La Transferencia fue completada. Beneficiario: 9205XXXXXXXX8846 Monto: 2000.00 CUP Saldo restante: CR 3918.18 CUP",
    amountGroup: 2,
    currencyGroup: 3,
    type: "EGRESO",
    accountGroup: 1,
    refGroup: 0,
    balanceGroup: 4
  },
  {
    id: "pat_transf_recibida",
    bankName: "Transfermóvil (Transf. Recibida)",
    regexPattern: "le ha realizado una transferencia\\s*de\\s*([\\d.,]+)\\s*([A-Z]{3})",
    sampleSms: "El titular del telefono XXXXXXX le ha realizado una transferencia de 600.00 CUP",
    amountGroup: 1,
    currencyGroup: 2,
    type: "INGRESO",
    accountGroup: 0,
    refGroup: 0
  },
  {
    id: "pat_pago_completado",
    bankName: "Metropolitano (Pago Completado)",
    regexPattern: "Pago completado.*?Entidad:\\s*(.*?)\\s*Importe pagado:\\s*([\\d.,]+)\\s*([A-Z]{3}).*?Saldo disponible:\\s*CR\\s*([\\d.,]+)",
    sampleSms: "Pago completado. Entidad: Supermercado Importe pagado: 564.00 CUP Saldo disponible: CR 1496.84 CUP",
    amountGroup: 2,
    currencyGroup: 3,
    type: "GASTO",
    accountGroup: 0,
    refGroup: 0,
    balanceGroup: 4
  },
  {
    id: "pat_recarga_telef",
    bankName: "BPA (Recarga)",
    regexPattern: "La recarga se realizo con exito.*?Monto Pagado:\\s*([\\d.,]+)\\s*([A-Z]{3}).*?Saldo Restante:\\s*CR\\s*([\\d.,]+)",
    sampleSms: "La recarga se realizo con exito. Monto Pagado: 108.00 CUP Saldo Restante: CR 9660.84",
    amountGroup: 1,
    currencyGroup: 2,
    type: "GASTO RECARGA",
    accountGroup: 0,
    refGroup: 0,
    balanceGroup: 3
  },
  {
    id: "pat_enzona",
    bankName: "EnZona (Operación)",
    regexPattern: "Operacion EnZona.*?Db\\s*([\\d.,]+)",
    sampleSms: "Operacion EnZona Db 420.00",
    amountGroup: 1,
    currencyGroup: 0,
    type: "PAGO ELECTRÓNICO",
    accountGroup: 0,
    refGroup: 0
  }
];

const PRESET_SMS_CUBAN_TEMPLATES = [
  { 
    title: "Saldo BANDEC (****1513)", 
    sender: "PAGOxMOVIL",
    text: "Banco Bandec La consulta de saldo fue completada. Cuenta;Saldo Disponible 920406XXXXXX1513; CR 9876.84" 
  },
  { 
    title: "Trsf Enviada a ****8846", 
    sender: "Transfermovil",
    text: "La Transferencia fue completada. Beneficiario: 9205XXXXXXXX8846 Monto: 2000.00 CUP Saldo restante: CR 3918.18 CUP" 
  },
  { 
    title: "Trsf Recibida (600 CUP)", 
    sender: "Transfermovil",
    text: "El titular del telefono XXXXXXX le ha realizado una transferencia de 600.00 CUP" 
  },
  { 
    title: "Pago Supermercado (Banmet)", 
    sender: "BANMET",
    text: "Pago completado. Entidad: Supermercado Importe pagado: 564.00 CUP Saldo disponible: CR 1496.84 CUP" 
  },
  { 
    title: "Recarga ETCSA (BPA)", 
    sender: "BPA",
    text: "La recarga se realizo con exito. Monto Pagado: 108.00 CUP Saldo Restante: CR 9660.84" 
  },
  { 
    title: "Operación EnZona (420 CUP)", 
    sender: "EnZona",
    text: "Operacion EnZona Db 420.00" 
  }
];

export function PhoneSimulator() {
  const [transactions, setTransactions] = useState<SimulatedTransaction[]>([]);
  const [cards, setCards] = useState<SimulatedCard[]>([]);
  const [patterns, setPatterns] = useState<SmsPattern[]>([]);
  
  // Simulated Phone Screen navigation
  const [activeTab, setActiveTab] = useState<"dashboard" | "movimientos" | "sms">("dashboard");
  
  const [smsInput, setSmsInput] = useState("");
  const [senderInput, setSenderInput] = useState("Transfermovil");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Dashboard & Filter States
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | OperationType>("all");
  const [bankFilter, setBankFilter] = useState("all");
  const [selectedTx, setSelectedTx] = useState<SimulatedTransaction | null>(null);
  
  const [selectedCardFilter, setSelectedCardFilter] = useState<string>("all");
  const [statsPeriod, setStatsPeriod] = useState<"Este mes" | "3 meses" | "6 meses" | "Todo">("Este mes");
  const [dateFilterStart, setDateFilterStart] = useState("01 jun 2025");
  const [dateFilterEnd, setDateFilterEnd] = useState("11 jun 2025");
  const [exportCardFilter, setExportCardFilter] = useState("Todas");

  // Custom Pattern creator state
  const [isAddingPattern, setIsAddingPattern] = useState(false);
  const [newBank, setNewBank] = useState("");
  const [newRegex, setNewRegex] = useState("");
  const [newSample, setNewSample] = useState("");
  const [newAmountGroup, setNewAmountGroup] = useState(1);
  const [newAccountGroup, setNewAccountGroup] = useState(0);
  const [newRefGroup, setNewRefGroup] = useState(0);
  const [newType, setNewType] = useState<OperationType>("GASTO");

  // Load from localStorage on mount or seed Cuban values
  useEffect(() => {
    const savedTransactions = localStorage.getItem("cuban_bank_txs");
    const savedCards = localStorage.getItem("cuban_bank_cards");
    const savedPatterns = localStorage.getItem("cuban_bank_patterns");

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      const seedTxs: SimulatedTransaction[] = [
        {
          id: "tx_1",
          bank: "BANDEC",
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          body: "Banco Bandec La consulta de saldo fue completada. Cuenta;Saldo Disponible 920406XXXXXX1513; CR 9876.84",
          amount: 0.0,
          currency: "CUP",
          type: "CONSULTA SALDO",
          balanceAfter: 9876.84,
          description: "Consulta de Saldo",
          reference: "CS-103982",
          account: "1513"
        },
        {
          id: "tx_2",
          bank: "BANDEC",
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          body: "La Transferencia fue completada. Beneficiario: 9205XXXXXXXX8846 Monto: 2000.00 CUP Saldo restante: CR 3918.18 CUP",
          amount: 2000.00,
          currency: "CUP",
          type: "EGRESO",
          balanceAfter: 3918.18,
          description: "Transferencia enviada a beneficiario 9205XXXXXXXX8846",
          reference: "TR-554281",
          account: "8846"
        },
        {
          id: "tx_3",
          bank: "Banco Metropolitano",
          timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
          body: "Pago completado. Entidad: Supermercado Importe pagado: 564.00 CUP Saldo disponible: CR 1496.84 CUP",
          amount: 564.00,
          currency: "CUP",
          type: "GASTO",
          balanceAfter: 1496.84,
          description: "Pago completado en Supermercado",
          reference: "PG-209384",
          account: "1513"
        }
      ];
      setTransactions(seedTxs);
      localStorage.setItem("cuban_bank_txs", JSON.stringify(seedTxs));
    }

    if (savedCards) {
      setCards(JSON.parse(savedCards));
    } else {
      const seedCards: SimulatedCard[] = [
        {
          id: "card_1",
          bank: "BANDEC",
          accountNumber: "920406XXXXXX1513",
          lastFourDigits: "1513",
          balance: 9876.84,
          lastUpdated: new Date(Date.now() - 3600000 * 2).toLocaleString()
        },
        {
          id: "card_2",
          bank: "BANDEC",
          accountNumber: "9205XXXXXXXX8846",
          lastFourDigits: "8846",
          balance: 7940.00,
          lastUpdated: new Date(Date.now() - 3600000 * 24).toLocaleString()
        },
        {
          id: "card_3",
          bank: "BPA",
          accountNumber: "9206XXXXXXXX1662",
          lastFourDigits: "1662",
          balance: 5668.84,
          lastUpdated: new Date(Date.now() - 3600000 * 48).toLocaleString()
        }
      ];
      setCards(seedCards);
      localStorage.setItem("cuban_bank_cards", JSON.stringify(seedCards));
    }

    if (savedPatterns) {
      setPatterns(JSON.parse(savedPatterns));
    } else {
      setPatterns(CUBAN_PATTERNS);
      localStorage.setItem("cuban_bank_patterns", JSON.stringify(CUBAN_PATTERNS));
    }
  }, []);

  const saveTxs = (newTxs: SimulatedTransaction[]) => {
    setTransactions(newTxs);
    localStorage.setItem("cuban_bank_txs", JSON.stringify(newTxs));
  };

  const saveCards = (newCards: SimulatedCard[]) => {
    setCards(newCards);
    localStorage.setItem("cuban_bank_cards", JSON.stringify(newCards));
  };

  const savePatterns = (newPats: SmsPattern[]) => {
    setPatterns(newPats);
    localStorage.setItem("cuban_bank_patterns", JSON.stringify(newPats));
  };

  // Parsing and automatic card matching
  const parseSmsLocally = (body: string, sender: string): { tx: SimulatedTransaction; resolvedCard: SimulatedCard | null } | null => {
    const uppercaseSender = sender.toUpperCase();
    const uppercaseBody = body.toUpperCase();
    let detectedBank = "BANDEC";

    if (uppercaseSender.includes("BANDEC") || uppercaseBody.includes("BANDEC")) {
      detectedBank = "BANDEC";
    } else if (uppercaseSender.includes("BPA") || uppercaseBody.includes("BPA")) {
      detectedBank = "BPA";
    } else if (uppercaseSender.includes("METROPOLITANO") || uppercaseSender.includes("BANMET") || uppercaseBody.includes("METROPOLITANO")) {
      detectedBank = "Banco Metropolitano";
    } else if (uppercaseSender.includes("ENZONA") || uppercaseBody.includes("ENZONA")) {
      detectedBank = "EnZona";
    } else if (uppercaseSender.includes("PAGOxMOVIL") || uppercaseSender.includes("TRANSFER") || uppercaseBody.includes("TRANSFERM")) {
      detectedBank = "Transfermóvil";
    }

    for (const pat of patterns) {
      try {
        const regex = new RegExp(pat.regexPattern, "i");
        const match = body.match(regex);
        if (match) {
          // Extract amount
          let amount = 0;
          if (pat.amountGroup > 0) {
            const rawAmount = match[pat.amountGroup];
            amount = parseFloat(rawAmount?.replace(/,/g, "") || "0") || 0;
          }

          // Extract account reference
          let rawAccountInput = "";
          if (pat.accountGroup > 0) {
            rawAccountInput = match[pat.accountGroup] || "";
          }
          let lastFourDigits = rawAccountInput.slice(-4) || "1513"; // Default or matched

          // Fallback guess account based on typical tests if none matched
          if (!rawAccountInput) {
            if (body.includes("1513")) lastFourDigits = "1513";
            else if (body.includes("8846")) lastFourDigits = "8846";
            else if (body.includes("1662")) lastFourDigits = "1662";
          }

          // Extract balance after transaction
          let balanceAfter = 0;
          if (pat.balanceGroup && pat.balanceGroup > 0) {
            const rawBalance = match[pat.balanceGroup];
            balanceAfter = parseFloat(rawBalance?.replace(/,/g, "") || "0") || 0;
          }

          // Generate simulated details
          const timestamp = new Date().toISOString();
          const reference = `${pat.type.slice(0, 3)}-${Date.now().toString().slice(-6) || Math.floor(Math.random() * 900000 + 100000)}`;

          let description = "";
          switch(pat.type) {
            case "CONSULTA SALDO":
              description = "La consulta de saldo fue completada";
              break;
            case "EGRESO":
              description = `Transferencia enviada a beneficiario ${rawAccountInput || "destinatario"}`;
              break;
            case "INGRESO":
              description = `Transferencia recibida de fondos`;
              break;
            case "GASTO":
              description = `Pago completado. Entidad: Comercio / Supermercado`;
              break;
            case "GASTO RECARGA":
              description = `La recarga se realizo con exito`;
              break;
            case "PAGO ELECTRÓNICO":
              description = `Operacion EnZona Db`;
              break;
            default:
              description = `Operación procesada`;
          }

          const tx: SimulatedTransaction = {
            id: `tx_${Date.now()}`,
            timestamp,
            type: pat.type,
            amount,
            currency: body.includes("CUP") ? "CUP" : body.includes("MLC") ? "MLC" : "CUP",
            balanceAfter: balanceAfter || 0,
            description,
            reference,
            account: lastFourDigits,
            body,
            bank: detectedBank
          };

          // Find or automatically create card
          let resolvedCard: SimulatedCard | null = null;
          if (lastFourDigits && lastFourDigits !== "Asoc" && lastFourDigits !== "") {
            resolvedCard = {
              id: `card_${Date.now()}`,
              bank: detectedBank,
              accountNumber: rawAccountInput || `****${lastFourDigits}`,
              lastFourDigits,
              balance: balanceAfter || amount,
              lastUpdated: new Date().toLocaleString()
            };
          }

          return { tx, resolvedCard };
        }
      } catch (err) {
        console.error("Kuban pattern match error:", err);
      }
    }
    return null;
  };

  const triggerProcessSms = (textToProcess: string, senderName: string) => {
    if (!textToProcess.trim()) {
      setErrorMessage("Por favor ingresa un mensaje SMS para procesar.");
      return;
    }

    const parseResult = parseSmsLocally(textToProcess, senderName);
    if (parseResult) {
      const { tx, resolvedCard } = parseResult;
      
      const updatedTxs = [tx, ...transactions];
      saveTxs(updatedTxs);

      if (resolvedCard) {
        const existingCardIdx = cards.findIndex(c => c.lastFourDigits === resolvedCard.lastFourDigits);
        let updatedCards = [...cards];
        if (existingCardIdx !== -1) {
          updatedCards[existingCardIdx] = {
            ...updatedCards[existingCardIdx],
            balance: tx.balanceAfter > 0 ? tx.balanceAfter : updatedCards[existingCardIdx].balance + (tx.type === "INGRESO" ? tx.amount : -tx.amount),
            lastUpdated: new Date().toLocaleString()
          };
          setSuccessMessage(`¡SMS detectado! Se actualizó el saldo de tarjeta ****${resolvedCard.lastFourDigits} a ${updatedCards[existingCardIdx].balance.toFixed(2)} CUP`);
        } else {
          updatedCards = [resolvedCard, ...updatedCards];
          setSuccessMessage(`¡Nueva cuenta registrada! Tarjeta ****${resolvedCard.lastFourDigits} con saldo inicial: ${resolvedCard.balance.toFixed(2)} CUP`);
        }
        saveCards(updatedCards);
      } else {
        setSuccessMessage(`¡SMS detectado con éxito! Registrado movimiento de ${tx.bank} por ${tx.amount.toFixed(2)} CUP`);
      }

      setErrorMessage("");
      setSmsInput("");
    } else {
      setErrorMessage("El SMS no se pudo analizar. No coincide con ningún formato de los bancos cubanos activos.");
      setSuccessMessage("");
    }

    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 5000);
  };

  const clearAllTxs = () => {
    if (window.confirm("¿Seguro que quieres borrar la base de datos local (Simulación de Room)?")) {
      saveTxs([]);
      saveCards([]);
    }
  };

  const handleResetPatterns = () => {
    if (window.confirm("¿Restaurar patrones de expresiones regulares de Cuba por defecto?")) {
      savePatterns(CUBAN_PATTERNS);
    }
  };

  const handleAddCustomPattern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBank || !newRegex || !newSample) {
      alert("Por favor completa los campos.");
      return;
    }

    const testPat: SmsPattern = {
      id: "pat_" + Date.now(),
      bankName: `${newBank} (${newType})`,
      regexPattern: newRegex,
      sampleSms: newSample,
      amountGroup: Number(newAmountGroup),
      currencyGroup: 0,
      type: newType,
      accountGroup: Number(newAccountGroup),
      refGroup: Number(newRefGroup)
    };

    savePatterns([...patterns, testPat]);
    setIsAddingPattern(false);
    setNewBank("");
    setNewRegex("");
    setNewSample("");
  };

  // Filters logic for SMS / Movements
  const filteredTxs = transactions.filter(t => {
    const matchesSearch = t.bank.toLowerCase().includes(search.toLowerCase()) || 
                          t.body.toLowerCase().includes(search.toLowerCase()) ||
                          t.reference.includes(search);
    
    // Type Filter matching
    let matchesType = true;
    if (typeFilter !== "all" && typeFilter !== null) {
      if (typeFilter === "INGRESO") matchesType = (t.type === "INGRESO");
      else if (typeFilter === "EGRESO") matchesType = (t.type === "EGRESO");
      else if (typeFilter === "GASTO") matchesType = (t.type === "GASTO");
      else if (typeFilter === "GASTO RECARGA") matchesType = (t.type === "GASTO RECARGA");
      else if (typeFilter === "PAGO ELECTRÓNICO") matchesType = (t.type === "PAGO ELECTRÓNICO");
      else if (typeFilter === "CONSULTA SALDO") matchesType = (t.type === "CONSULTA SALDO");
    }

    // Card filter
    const matchesCard = selectedCardFilter === "all" || t.account === selectedCardFilter;
    
    return matchesSearch && matchesType && matchesCard;
  });

  const generateReport = () => {
    alert(`Generando reporte (${exportCardFilter}) para el período ${dateFilterStart} - ${dateFilterEnd}.\nSe exportará un lote de ${filteredTxs.length} movimientos de manera local protegida.`);
  };

  const simulateExport = (format: "csv" | "excel" | "pdf") => {
    if (filteredTxs.length === 0) {
      alert("No hay movimientos para exportar.");
      return;
    }

    const headers = ["ID", "Banco", "Operacion_Tipo", "Monto", "Saldo_Posterior", "Cuenta_Tarjeta", "Referencia", "Original_SMS"];
    const rows = filteredTxs.map(t => [
      t.id, t.bank, t.type, t.amount, t.balanceAfter, t.account, t.reference, `"${t.body}"`
    ]);

    const content = format === "csv" 
    ? [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    : JSON.stringify(filteredTxs, null, 2);

    const dataUri = `data:text/plain;charset=utf-8,` + encodeURIComponent(content);
    const link = document.createElement("a");
    link.href = dataUri;
    link.download = `transfer_control_export.${format === "csv" ? "csv" : format === "excel" ? "xlsx" : "pdf"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cumulative Stats
  const totalCUPAvailable = cards.reduce((acc, c) => acc + c.balance, 0);
  const totalReceived = transactions.filter(t => t.type === "INGRESO").reduce((acc, t) => acc + t.amount, 0);
  const totalSent = transactions.filter(t => t.type === "EGRESO").reduce((acc, t) => acc + t.amount, 0);
  const totalSpent = transactions.filter(t => t.type === "GASTO").reduce((acc, t) => acc + t.amount, 0);
  const totalRecargas = transactions.filter(t => t.type === "GASTO RECARGA").reduce((acc, t) => acc + t.amount, 0);
  const totalEnZona = transactions.filter(t => t.type === "PAGO ELECTRÓNICO").reduce((acc, t) => acc + t.amount, 0);

  // Dynamic Progress Bars calculation
  const totalOutSpending = totalSpent + totalSent + totalRecargas + totalEnZona || 1;
  const spentPct = Math.min(100, Math.round((totalSpent / totalOutSpending) * 100));
  const sentPct = Math.min(100, Math.round((totalSent / totalOutSpending) * 100));
  const recPct = Math.min(100, Math.round((totalRecargas / totalOutSpending) * 100));
  const enZonaPct = Math.min(100, Math.round((totalEnZona / totalOutSpending) * 100));

  // Totals by Bank
  const bandecTotal = cards.filter(c => c.bank.toUpperCase() === "BANDEC").reduce((acc, c) => acc + c.balance, 0);
  const bpaTotal = cards.filter(c => c.bank.toUpperCase() === "BPA").reduce((acc, c) => acc + c.balance, 0);
  const banmetTotal = cards.filter(c => c.bank.toLowerCase().includes("metropol") || c.bank.toLowerCase().includes("banmet")).reduce((acc, c) => acc + c.balance, 0);

  const bandecCardsCount = cards.filter(c => c.bank.toUpperCase() === "BANDEC").length;
  const bpaCardsCount = cards.filter(c => c.bank.toUpperCase() === "BPA").length;
  const banmetCardsCount = cards.filter(c => c.bank.toLowerCase().includes("metropol") || c.bank.toLowerCase().includes("banmet")).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT COLUMN: Controls, Injectors, Patterns */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* SMS Broadcast simulator box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2 font-sans">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            Emulador de Redirección SMS 🇨🇺
          </h3>
          <p className="text-slate-400 text-xs mb-4 leading-relaxed font-sans">
            Inserta o selecciona un SMS de prueba. Se analizarán con las expresiones regulares cargadas para actualizar los saldos e indexar las cuentas de BANDEC, BPA o Metropolitano.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 text-[11px] font-semibold mb-1 font-sans">Remitente SMS</label>
                <input 
                  type="text" 
                  value={senderInput}
                  onChange={(e) => setSenderInput(e.target.value)}
                  placeholder="Ej. PAGOxMOVIL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div className="flex flex-col justify-end text-[10px] text-slate-500 font-mono">
                <span className="font-bold">Emisores:</span>
                <span>PAGOxMOVIL, BANDEC, BPA, BANMET, EnZona</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-[11px] font-semibold mb-1 font-sans">Texto del SMS del Banco</label>
              <textarea 
                value={smsInput}
                onChange={(e) => setSmsInput(e.target.value)}
                placeholder="Pega el mensaje o presiona un botón para rellenar..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Quick Template Picker */}
            <div>
              <span className="block text-slate-400 text-[10.5px] mb-2 font-bold uppercase tracking-wider font-sans">Presionar para Autocompletar:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_SMS_CUBAN_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                       setSmsInput(tmpl.text);
                       setSenderInput(tmpl.sender);
                    }}
                    className="bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-slate-100 font-mono text-[9.5px] p-2 rounded-lg border border-slate-850 active:scale-95 transition-all text-left truncate cursor-pointer"
                  >
                    🇨🇺 {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => triggerProcessSms(smsInput, senderInput)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 active:scale-98 transition-transform cursor-pointer"
            >
              <Inbox className="w-4 h-4" />
              Procesar y guardar SMS en Room
            </button>

            {successMessage && (
              <div className="flex items-start gap-2 bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl animate-fade-in text-emerald-300 text-xs font-sans">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-2 bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl animate-fade-in text-rose-300 text-xs font-sans">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Regular expressions view */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wide font-sans">
              <Settings className="w-4 h-4 text-emerald-400" />
              Patrones Regex de Cuba Activos
            </h3>
            <button
              onClick={() => setIsAddingPattern(!isAddingPattern)}
              className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Añadir
            </button>
          </div>

          {isAddingPattern && (
            <form onSubmit={handleAddCustomPattern} className="bg-slate-950 p-4 rounded-xl border border-slate-850 mb-4 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="font-bold text-slate-300 font-sans">Agregar Expresión Regular</span>
                <button type="button" onClick={() => setIsAddingPattern(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Banco o Plataforma</label>
                <input 
                  type="text" 
                  placeholder="BANDEC, BPA, Banmet..."
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  className="w-full bg-slate-905 border border-slate-800 rounded p-1.5 text-slate-100 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Tipo de Movimiento</label>
                <select 
                  value={newType} 
                  onChange={(e) => setNewType(e.target.value as OperationType)}
                  className="w-full bg-slate-905 border border-slate-800 rounded p-1.5 text-slate-100 text-xs"
                >
                  <option value="INGRESO">INGRESO (Entrada)</option>
                  <option value="EGRESO">EGRESO (Salida)</option>
                  <option value="GASTO">GASTO (Monto pagado)</option>
                  <option value="GASTO RECARGA">GASTO RECARGA</option>
                  <option value="PAGO ELECTRÓNICO">PAGO ELECTRÓNICO (EnZona)</option>
                  <option value="CONSULTA SALDO">CONSULTA SALDO</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Expresión Regular Java/Kotlin</label>
                <input 
                  type="text" 
                  value={newRegex}
                  onChange={(e) => setNewRegex(e.target.value)}
                  placeholder="La Transferencia fue completada.*"
                  className="w-full bg-slate-905 border border-slate-800 rounded p-1.5 text-slate-100 font-mono text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Grupo Monto</label>
                  <input 
                    type="number" 
                    value={newAmountGroup}
                    onChange={(e) => setNewAmountGroup(Number(e.target.value))}
                    className="w-full bg-slate-905 border border-slate-800 rounded p-1 text-slate-100 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Grupo Tarjeta</label>
                  <input 
                    type="number" 
                    value={newAccountGroup}
                    onChange={(e) => setNewAccountGroup(Number(e.target.value))}
                    className="w-full bg-slate-905 border border-slate-800 rounded p-1 text-slate-100 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">SMS Ejemplo</label>
                <input 
                  type="text" 
                  value={newSample}
                  onChange={(e) => setNewSample(e.target.value)}
                  className="w-full bg-slate-905 border border-slate-800 rounded p-1.5 text-slate-100 text-xs"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-2.5 rounded-lg text-white font-bold cursor-pointer text-xs">
                Guardar Patrón en Lector
              </button>
            </form>
          )}

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {patterns.map((pat) => (
              <div 
                key={pat.id} 
                className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex flex-col gap-1 text-xs text-slate-350"
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {pat.bankName}
                  </span>
                  <span className="text-[9px] bg-slate-900 text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase border border-slate-800 font-sans">
                    {pat.type}
                  </span>
                </div>
                <div className="text-[10px] font-mono bg-slate-900 p-1.5 rounded text-slate-400 break-all">
                  {pat.regexPattern}
                </div>
                <div className="text-[9.5px] text-slate-500 italic">
                  Ej: {pat.sampleSms}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-850 flex justify-between">
            <button
              onClick={handleResetPatterns}
              className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1.5 transition-colors font-semibold cursor-pointer font-sans"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restablecer Valores Cuba
            </button>
            <button
               onClick={clearAllTxs}
               className="text-rose-455 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors font-semibold cursor-pointer font-sans"
            >
               <Trash2 className="w-3.5 h-3.5" /> Vaciar Sim
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Pixel-Perfect User Mockup Phone */}
      <div className="lg:col-span-7 flex justify-center">
        
        {/* Virtual Phone Scaffold Wrapper */}
        <div className="phone">
          
          {/* Status Bar */}
          <div className="status-bar">
            <span>9:41</span>
            <div className="flex gap-1.5 items-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.284 16.284A3 3 0 0 0 12 17a3 3 0 0 0 3.716-1.144m-7.432 0a6 6 0 0 1 7.432 0m-7.432 0a9 9 0 0 1 9.878-1.884"></path>
              </svg>
              <span className="font-mono text-[9px] font-bold">4G</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 10h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1v-4zm-14-1h12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z"></path>
              </svg>
            </div>
          </div>

          {/* Navigation Tab Bar exactly matching the requested mockup */}
          <div className="phone-nav select-none">
            <button 
              className={activeTab === "dashboard" ? "active" : ""} 
              onClick={() => { setActiveTab("dashboard"); setSelectedCardFilter("all"); }}
            >
              <LayoutDashboard className="w-[18px] h-[18px]" />
              Inicio
            </button>
            <button 
              className={activeTab === "movimientos" ? "active" : ""} 
              onClick={() => setActiveTab("movimientos")}
            >
              <List className="w-[18px] h-[18px]" />
              Movimientos
            </button>
            <button 
              className={activeTab === "sms" ? "active" : ""} 
              onClick={() => setActiveTab("sms")}
            >
              <MessageSquare className="w-[18px] h-[18px]" />
              SMS
            </button>
          </div>

          {/* ==================== 1. DASHBOARD SCREEN ==================== */}
          <div className={`screen ${activeTab === "dashboard" ? "active" : ""}`}>
            <div className="sync-bar">
              <RefreshCw className="lucide-icon text-[#1D9E75]" />
              <span>Sincronizado hace 2 min · {transactions.length} SMS analizados</span>
            </div>

            <div className="total-card">
              <div className="label">Total disponible</div>
              <div className="amount">CUP {totalCUPAvailable.toLocaleString("es-CU", { minimumFractionDigits: 2 })}</div>
              <div className="sub">{cards.length} tarjetas · Actualizado hoy 9:39</div>
            </div>

            <div className="section-title">Mis tarjetas ({cards.length})</div>
            
            <div className="flex flex-col gap-3 px-3 mb-4 select-none">
              {/* Reset/All Cards Filter Option */}
              <div 
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  selectedCardFilter === "all" 
                    ? "bg-[#0b1b16] border-[#1D9E75] shadow-[#1D9E75]/10" 
                    : "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md"
                }`}
                onClick={() => setSelectedCardFilter("all")}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-center">
                      <Database className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">TODAS LAS CUENTAS</span>
                      <span className="text-[10px] text-slate-400">Total acumulado de fondos</span>
                    </div>
                  </div>
                  {selectedCardFilter === "all" && (
                    <span className="text-[9px] bg-emerald-900/40 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                      Filtro Activo
                    </span>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-end">
                  <div>
                    <span className="text-[9.5px] text-slate-500 block uppercase tracking-wider font-bold font-sans">Saldo Consolidado</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      CUP {totalCUPAvailable.toLocaleString("es-CU", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 font-mono">
                    <span>{transactions.length} operaciones</span>
                  </div>
                </div>
              </div>

              {cards.map((card) => {
                const cardTxs = transactions.filter(t => t.account === card.lastFourDigits);
                const cardIngresos = cardTxs.filter(t => t.type === "INGRESO").reduce((sum, t) => sum + t.amount, 0);
                const cardGastos = cardTxs.filter(t => t.type !== "INGRESO" && t.type !== "CONSULTA SALDO").reduce((sum, t) => sum + t.amount, 0);
                
                // Bank-specific styles matching Cuban institutions
                const isBandec = card.bank.toUpperCase().includes("BANDEC");
                const isBpa = card.bank.toUpperCase().includes("BPA");
                const isMetropolitana = card.bank.toLowerCase().includes("metropol") || card.bank.toLowerCase().includes("banmet");
                
                let circleLogo = "M";
                let bankBgGlow = "bg-emerald-500/5";

                if (isBandec) {
                  circleLogo = "BD";
                  bankBgGlow = "bg-blue-500/5";
                } else if (isBpa) {
                  circleLogo = "BP";
                  bankBgGlow = "bg-amber-500/5";
                } else if (isMetropolitana) {
                  circleLogo = "BM";
                  bankBgGlow = "bg-teal-500/5";
                }

                return (
                  <div 
                    key={card.id}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      selectedCardFilter === card.lastFourDigits 
                        ? "bg-slate-900 border-[#1D9E75] shadow-[#1D9E75]/10" 
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md"
                    }`}
                    onClick={() => setSelectedCardFilter(card.lastFourDigits)}
                  >
                    {/* Atmospheric bank glow effects */}
                    <div className={`absolute top-0 right-0 w-28 h-28 ${bankBgGlow} rounded-full blur-2xl`} />
                    
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isBandec ? "bg-blue-900/40 text-blue-400 border border-blue-800/20" : 
                          isBpa ? "bg-amber-900/40 text-amber-400 border border-amber-800/20" : 
                          "bg-emerald-900/40 text-[#1D9E75] border border-emerald-800/20"
                        }`}>
                          {circleLogo}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block uppercase tracking-wide">{card.bank}</span>
                          <span className="text-[9.5px] text-slate-400 flex items-center gap-1 font-mono">
                            <CreditCard className="w-2.5 h-2.5" />
                            {card.accountNumber || `9200 •••• •••• ${card.lastFourDigits}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {selectedCardFilter === card.lastFourDigits && (
                          <span className="text-[9px] bg-emerald-900/40 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-800">
                            Filtrado
                          </span>
                        )}
                        <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${
                          isBandec ? "bg-blue-950 text-blue-300 border border-blue-900/30" :
                          isBpa ? "bg-amber-950 text-amber-300 border border-amber-900/30" :
                          "bg-emerald-950 text-emerald-300 border border-emerald-900/30"
                        }`}>
                          • ACTIVA
                        </span>
                      </div>
                    </div>

                    {/* Sim ATM Chip visual decoration block */}
                    <div className="my-2 flex items-center justify-between">
                      <div className="w-7 h-5 rounded bg-gradient-to-br from-amber-400/80 to-amber-600/90 shadow-inner flex flex-col justify-between p-1 opacity-75">
                        <div className="h-[1px] bg-amber-800/20" />
                        <div className="h-[1.5px] bg-amber-800/20" />
                        <div className="h-[1px] bg-amber-800/20" />
                      </div>
                      <div className="text-right text-[10px] text-slate-500 font-mono">
                        CUP
                      </div>
                    </div>

                    {/* Card Funds Balance display */}
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-lg font-black text-white font-mono">
                        CUP {card.balance.toLocaleString("es-CU", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Extended stats & metadata gathered from SMS registry */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[10px]">
                      <div className="text-slate-400 font-sans">
                        <span className="block text-[8.5px] text-slate-500 uppercase font-semibold">Ingresos registrados</span>
                        <span className="text-[#1D9E75] font-black font-mono">+{cardIngresos.toFixed(2)} CUP</span>
                      </div>
                      <div className="text-right text-slate-400 font-sans">
                        <span className="block text-[8.5px] text-slate-500 uppercase font-semibold">Gastos / Transferencias</span>
                        <span className="text-rose-400 font-black font-mono">-{cardGastos.toFixed(2)} CUP</span>
                      </div>
                    </div>

                    {/* Footer bar showing update time info */}
                    <div className="mt-2 text-[9px] text-slate-500 flex justify-between items-center bg-slate-950/20 px-2 py-1.5 rounded-lg border border-slate-800/30">
                      <span>{cardTxs.length} operaciones registradas</span>
                      <span className="text-slate-500 truncate">Sinc: {card.lastUpdated}</span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* ==================== 2. MOVIMIENTOS SCREEN ==================== */}
          <div className={`screen ${activeTab === "movimientos" ? "active" : ""}`}>
            <div className="header">
              <h2>Movimientos</h2>
              <p>Historial completo · todas las tarjetas</p>
            </div>

            <div className="p-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar banco, ref o SMS..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-250 placeholder-slate-500 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Filter Pill List exactly like user layout */}
            <div className="filter-bar text-xs">
              <button 
                className={`filter-btn ${typeFilter === "all" ? "active" : ""}`} 
                onClick={() => setTypeFilter("all")}
              >
                Todos
              </button>
              <button 
                className={`filter-btn ${typeFilter === "INGRESO" ? "active" : ""}`} 
                onClick={() => setTypeFilter("INGRESO")}
              >
                Ingresos
              </button>
              <button 
                className={`filter-btn ${typeFilter === "EGRESO" ? "active" : ""}`} 
                onClick={() => setTypeFilter("EGRESO")}
              >
                Egresos
              </button>
              <button 
                className={`filter-btn ${typeFilter === "GASTO" ? "active" : ""}`} 
                onClick={() => setTypeFilter("GASTO")}
              >
                Pagos
              </button>
              <button 
                className={`filter-btn ${typeFilter === "GASTO RECARGA" ? "active" : ""}`} 
                onClick={() => setTypeFilter("GASTO RECARGA")}
              >
                Recargas
              </button>
              <button 
                className={`filter-btn ${typeFilter === "PAGO ELECTRÓNICO" ? "active" : ""}`} 
                onClick={() => setTypeFilter("PAGO ELECTRÓNICO")}
              >
                EnZona
              </button>
            </div>

            {/* Dynamic Movement Items List */}
            <div className="mt-2">
              {filteredTxs.map((t) => {
                let iconEl;
                let iconClass = "in";
                let amtClass = "pos";
                let sign = "+";

                if (t.type === "INGRESO") {
                  iconEl = <ArrowDownLeft className="w-4 h-4" />;
                  iconClass = "in";
                  amtClass = "pos";
                  sign = "+";
                } else if (t.type === "EGRESO") {
                  iconEl = <ArrowUpRight className="w-4 h-4" />;
                  iconClass = "out";
                  amtClass = "neg";
                  sign = "−";
                } else if (t.type === "GASTO") {
                  iconEl = <ShoppingCart className="w-4 h-4" />;
                  iconClass = "pay";
                  amtClass = "neg";
                  sign = "−";
                } else if (t.type === "GASTO RECARGA") {
                  iconEl = <Smartphone className="w-4 h-4" />;
                  iconClass = "rec";
                  amtClass = "neg";
                  sign = "−";
                } else if (t.type === "PAGO ELECTRÓNICO") {
                  iconEl = <Zap className="w-4 h-4" />;
                  iconClass = "pay";
                  amtClass = "neg";
                  sign = "−";
                } else {
                  iconEl = <Database className="w-4 h-4" />;
                  iconClass = "in";
                  amtClass = "pos";
                  sign = "";
                }

                return (
                  <div key={t.id} className="mov-item" onClick={() => setSelectedTx(t)}>
                    <div className={`mov-icon ${iconClass}`}>{iconEl}</div>
                    <div className="mov-info">
                      <div className="desc">{t.description}</div>
                      <div className="date">Hoy · {t.bank} ****{t.account}</div>
                    </div>
                    <div className="mov-amount">
                      <div className={`val ${amtClass}`}>
                        {sign}{t.amount.toFixed(2)}
                      </div>
                      <div className="bal">Saldo: {t.balanceAfter > 0 ? t.balanceAfter.toFixed(2) : "CUP"}</div>
                    </div>
                  </div>
                );
              })}

              {filteredTxs.length === 0 && (
                <div className="p-12 text-center text-slate-500 text-xs">
                  Sin movimientos registrados para el filtro seleccionado.
                </div>
              )}
            </div>
          </div>

          {/* ==================== 3. SMS SCREEN ==================== */}
          <div className={`screen ${activeTab === "sms" ? "active" : ""}`}>
            <div className="header">
              <h2>SMS bancarios</h2>
              <p>Mensajes analizados automáticamente</p>
            </div>

            <div className="perm-banner">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="ptext">
                Permiso READ_SMS concedido. Los mensajes se leen localmente, nunca se envían a servidores externos.
              </div>
            </div>

            <div className="space-y-0.1">
              {transactions.map((t) => (
                <div key={t.id} className="sms-item">
                  <div className="sms-from">
                    {t.bank.toUpperCase()}{" "}
                    <span className="badge">{t.type}</span>
                  </div>
                  <div className="sms-text">
                    {t.body}
                  </div>
                  <div className="sms-parsed">
                    <span className="pill type">{t.type}</span>
                    <span className="pill amount">{t.amount > 0 ? `${t.amount.toFixed(2)} CUP` : "SALDO"}</span>
                    <span className="pill account">****{t.account}</span>
                  </div>
                </div>
              ))}

              {transactions.length === 0 && (
                <div className="p-16 text-center text-slate-500 text-xs space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
                  <p>Inyecta un SMS en el panel izquierdo para verlo analizado aquí.</p>
                </div>
              )}
            </div>
          </div>



          {/* Android Navigation bar mock */}
          <div className="bg-black py-2.5 flex justify-around items-center border-t border-slate-900 select-none shrink-0">
            <div className="w-8 h-1 bg-slate-700 rounded-full" />
            <div className="w-3 h-3 border-2 border-slate-700 rounded-sm" />
            <div className="w-3 h-3 border-2 border-slate-700 rounded-full" />
          </div>

        </div>
      </div>

      {/* ==================== TRANSACTION DETAIL MODAL ==================== */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl overflow-hidden p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="text-slate-150 font-bold text-sm mb-2">Auditoría SMS Detallado</h4>
            <span className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase bg-slate-950 px-2.5 py-1 rounded-md border border-slate-850">
              Operación ID: {selectedTx.reference}
            </span>

            <div className="mt-5 space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">Banco / Pasarela</span>
                  <span className="font-bold text-slate-200">{selectedTx.bank}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">Importe</span>
                  <span className={`font-black text-sm font-mono ${selectedTx.type === "INGRESO" ? "text-emerald-400" : "text-rose-455"}`}>
                    {selectedTx.type === "INGRESO" ? "+" : "-"}{selectedTx.amount.toFixed(2)} CUP
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">Clasificación</span>
                  <span className="font-bold text-slate-300">{selectedTx.type}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">Tarjeta / Cuenta</span>
                  <span className="font-bold font-mono text-slate-300">{selectedTx.account !== "Asoc" ? `****${selectedTx.account}` : "No provista"}</span>
                </div>
              </div>

              {selectedTx.balanceAfter > 0 && (
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">Saldo Resultante Informado</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedTx.balanceAfter.toFixed(2)} CUP</span>
                </div>
              )}

              <div>
                <span className="text-[10px] text-slate-400 mb-1.5 block font-bold uppercase font-sans">Texto SMS original registrado:</span>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 font-mono text-xs text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
                  {selectedTx.body}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Cerrar Auditoría local
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
