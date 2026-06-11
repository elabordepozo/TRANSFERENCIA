export interface SimulatedCard {
  id: string;
  bank: string;
  accountNumber: string; // original or masked
  lastFourDigits: string;
  balance: number;
  lastUpdated: string;
}

export type OperationType = "INGRESO" | "EGRESO" | "GASTO" | "GASTO RECARGA" | "PAGO ELECTRÓNICO" | "CONSULTA SALDO";

export interface SimulatedTransaction {
  id: string;
  timestamp: string;
  type: OperationType;
  amount: number;
  currency: string;
  balanceAfter: number; // Saldo posterior / restante
  description: string;
  reference: string;
  account: string; // card associated with the transaction (last digits)
  body: string; // Original SMS text
  bank: string; // Source/Emitter eg. "BANDEC"
}

export interface SmsPattern {
  id: string;
  bankName: string;
  regexPattern: string; // JavaScript / Kotlin compatible regex string
  sampleSms: string;
  amountGroup: number; // Capture group index for amount
  currencyGroup: number; // Capture group index for currency
  type: OperationType;
  accountGroup: number; // Capture group index for account/card
  refGroup: number; // Capture group index for reference
  balanceGroup?: number; // Capture group index for remaining balance
}

export interface AndroidFile {
  path: string;
  name: string;
  language: string;
  category: "room" | "ui" | "receiver" | "mvvm" | "config";
  description: string;
  content: string;
}
