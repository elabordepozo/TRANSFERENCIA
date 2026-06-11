package com.cubanbank.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.SmsMessage
import android.util.Log
import com.cubanbank.data.TransferDatabase
import com.cubanbank.parser.SmsParser
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class SmsReceiver : BroadcastReceiver() {

    private val TAG = "SmsReceiver"
    private val scope = CoroutineScope(Dispatchers.IO)

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "android.provider.Telephony.SMS_RECEIVED") {
            val bundle = intent.extras
            if (bundle != null) {
                try {
                    val pdus = bundle["pdus"] as Array<*>
                    val format = bundle.getString("format")
                    
                    for (i in pdus.indices) {
                        val message = SmsMessage.createFromPdu(pdus[i] as ByteArray, format)
                        val sender = message.originatingAddress ?: "Desconocido"
                        val body = message.messageBody ?: ""
                        val timestamp = message.timestampMillis

                        Log.d(TAG, "Nuevo SMS entrante capturado de $sender")
                        
                        // Procesar de manera asíncrona en segundo plano sin interrumpir la UI principal
                        processIncomingSms(context, sender, body, timestamp)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error procesando el SMS en vivo: ${e.message}")
                }
            }
        }
    }

    private fun processIncomingSms(context: Context, sender: String, body: String, timestamp: Long) {
        scope.launch {
            val result = SmsParser.parse(sender, body, timestamp)
            if (result != null) {
                val db = TransferDatabase.getDatabase(context)
                db.transferDao().registrarMovimientoActualizandoTarjeta(result.movimiento, result.banco)
                Log.d(TAG, "Movimiento bancario registrado localmente e insertado en Room.")
            }
        }
    }
}