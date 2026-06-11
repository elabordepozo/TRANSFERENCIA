package com.cubanbank.receiver

import android.content.Context
import android.net.Uri
import android.provider.Telephony
import android.util.Log
import com.cubanbank.data.TransferDatabase
import com.cubanbank.parser.SmsParser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object SmsContentObserver {

    private const val TAG = "SmsContentObserver"

    /**
     * Escanea exhaustivamente todos los SMS de la bandeja de entrada nativa buscando coincidencias.
     * Diseñado para ejecutarse de forma segura en hilos asíncronos en segundo plano (Coroutines).
     */
    suspend fun escanearMensajesHistoricos(context: Context): Int = withContext(Dispatchers.IO) {
        var coincidentes = 0
        val contentResolver = context.contentResolver
        val uri = Uri.parse("content://sms/inbox")
        
        // Filtrar remitentes comunes para no retrasar la lectura
        val proyeccion = arrayOf(
            Telephony.Sms._ID,
            Telephony.Sms.ADDRESS,
            Telephony.Sms.BODY,
            Telephony.Sms.DATE
        )

        val cursor = contentResolver.query(
            uri,
            proyeccion,
            null,
            null,
            "date DESC"
        )

        cursor?.use {
            val addressIndex = it.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)
            val bodyIndex = it.getColumnIndexOrThrow(Telephony.Sms.BODY)
            val dateIndex = it.getColumnIndexOrThrow(Telephony.Sms.DATE)

            val db = TransferDatabase.getDatabase(context)
            val dao = db.transferDao()

            while (it.moveToNext()) {
                val address = it.getString(addressIndex) ?: "Desconocido"
                val body = it.getString(bodyIndex) ?: ""
                val date = it.getLong(dateIndex)

                // Comprobar si corresponde a transacciones financieras válidas de Cuba
                if (esRemitenteBancarioValidor(address, body)) {
                    val result = SmsParser.parse(address, body, date)
                    if (result != null) {
                        try {
                            dao.registrarMovimientoActualizandoTarjeta(result.movimiento, result.banco)
                            coincidentes++
                        } catch (e: Exception) {
                            Log.e(TAG, "Duplicado o falla al guardar: ${e.message}")
                        }
                    }
                }
            }
        }
        return@withContext coincidentes
    }

    private fun esRemitenteBancarioValidor(address: String, body: String): Boolean {
        val addr = address.uppercase()
        val text = body.uppercase()
        return addr.contains("BANDEC") || 
               addr.contains("BPA") || 
               addr.contains("METROPOLITANO") || 
               addr.contains("TRANSFERMOVIL") || 
               addr.contains("PAGOXMOVIL") || 
               addr.contains("ENZONA") ||
               text.contains("BANDEC") ||
               text.contains("TRANSFERMÓVIL") ||
               text.contains("ENZONA")
    }
}