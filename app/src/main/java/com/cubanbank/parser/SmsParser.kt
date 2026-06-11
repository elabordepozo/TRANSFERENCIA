package com.cubanbank.parser

import com.cubanbank.data.MovimientoEntity
import java.util.regex.Pattern

object SmsParser {

    // Estructuras de patrones Regex compiladas para mayor rendimiento en flujos masivos
    private val PATTERN_CONSULTA_SALDO = Pattern.compile(
        """La consulta de saldo fue completada.*?Cuenta;Saldo Disponible\s*(\d+);\s*CR\s*([\d.,]+)""",
        Pattern.CASE_INSENSITIVE or Pattern.DOTALL
    )

    private val PATTERN_TRANSF_ENVIADA = Pattern.compile(
        """La Transferencia fue completada.*?Beneficiario:\s*(\d+).*?Monto:\s*([\d.,]+)\s*([A-Z]{3}).*?Saldo restante:\s*CR\s*([\d.,]+)""",
        Pattern.CASE_INSENSITIVE or Pattern.DOTALL
    )

    private val PATTERN_TRANSF_RECIBIDA = Pattern.compile(
        """le ha realizado una transferencia\s*de\s*([\d.,]+)\s*([A-Z]{3})""",
        Pattern.CASE_INSENSITIVE
    )

    private val PATTERN_PAGO_COMPLETADO = Pattern.compile(
        """Pago completado.*?Entidad:\s*(.*?)\s*Importe pagado:\s*([\d.,]+)\s*([A-Z]{3}).*?Saldo disponible:\s*CR\s*([\d.,]+)""",
        Pattern.CASE_INSENSITIVE or Pattern.DOTALL
    )

    private val PATTERN_RECARGA_TELEF = Pattern.compile(
        """La recarga se realizo con exito.*?Monto Pagado:\s*([\d.,]+)\s*([A-Z]{3}).*?Saldo Restante:\s*CR\s*([\d.,]+)""",
        Pattern.CASE_INSENSITIVE or Pattern.DOTALL
    )

    private val PATTERN_ENZONA = Pattern.compile(
        """Operacion EnZona.*?Db\s*([\d.,]+)""",
        Pattern.CASE_INSENSITIVE or Pattern.DOTALL
    )

    /**
     * Parsea un texto SMS y devuelve una entidad MovimientoEntity si el formato coincide.
     */
    fun parse(sender: String, body: String, timestamp: Long): ParsedResult? {
        val normalizedBody = body.replace("\r\n", " ").replace("\n", " ").trim()
        val bank = determinarBanco(sender, normalizedBody)

        // 1. Consulta de saldo
        var matcher = PATTERN_CONSULTA_SALDO.matcher(normalizedBody)
        if (matcher.find()) {
            val cuenta = matcher.group(1) ?: "Desconocida"
            val saldo = cleanAmount(matcher.group(2) ?: "0")
            val ref = "CS-" + timestamp.toString().takeLast(6)
            return ParsedResult(
                movimiento = MovimientoEntity(
                    fecha = timestamp,
                    tipo = "CONSULTA SALDO",
                    monto = 0.0,
                    moneda = "CUP",
                    saldoPosterior = saldo,
                    descripcion = "Consulta de Saldo",
                    referencia = ref,
                    cuenta = cuenta
                ),
                banco = bank
            )
        }

        // 2. Transferencia Enviada (Gasto / Egreso)
        matcher = PATTERN_TRANSF_ENVIADA.matcher(normalizedBody)
        if (matcher.find()) {
            val beneficiario = matcher.group(1) ?: ""
            val monto = cleanAmount(matcher.group(2) ?: "0")
            val moneda = matcher.group(3) ?: "CUP"
            val saldoRestante = cleanAmount(matcher.group(4) ?: "0")
            val ref = "TR-" + timestamp.toString().takeLast(6)
            return ParsedResult(
                movimiento = MovimientoEntity(
                    fecha = timestamp,
                    tipo = "EGRESO",
                    monto = monto,
                    moneda = moneda,
                    saldoPosterior = saldoRestante,
                    descripcion = "Transferencia enviada a tarjeta $beneficiario",
                    referencia = ref,
                    cuenta = "Card-Asoc" // Se enlazará en Repository
                ),
                banco = bank
            )
        }

        // 3. Transferencia Recibida (Ingreso)
        matcher = PATTERN_TRANSF_RECIBIDA.matcher(normalizedBody)
        if (matcher.find()) {
            val monto = cleanAmount(matcher.group(1) ?: "0")
            val moneda = matcher.group(2) ?: "CUP"
            val ref = "REC-" + timestamp.toString().takeLast(6)
            return ParsedResult(
                movimiento = MovimientoEntity(
                    fecha = timestamp,
                    tipo = "INGRESO",
                    monto = monto,
                    moneda = moneda,
                    saldoPosterior = 0.0, // No informado en el texto directo
                    descripcion = "Transferencia recibida",
                    referencia = ref,
                    cuenta = "Card-Asoc" 
                ),
                banco = bank
            )
        }

        // 4. Pago completado (Servicios/Tiendas)
        matcher = PATTERN_PAGO_COMPLETADO.matcher(normalizedBody)
        if (matcher.find()) {
            val entidad = matcher.group(1) ?: "Servicios"
            val importe = cleanAmount(matcher.group(2) ?: "0")
            val moneda = matcher.group(3) ?: "CUP"
            val saldo = cleanAmount(matcher.group(4) ?: "0")
            val ref = "PG-" + timestamp.toString().takeLast(6)
            return ParsedResult(
                movimiento = MovimientoEntity(
                    fecha = timestamp,
                    tipo = "GASTO",
                    monto = importe,
                    moneda = moneda,
                    saldoPosterior = saldo,
                    descripcion = "Pago completado en $entidad",
                    referencia = ref,
                    cuenta = "Card-Asoc"
                ),
                banco = bank
            )
        }

        // 5. Recarga telefónica
        matcher = PATTERN_RECARGA_TELEF.matcher(normalizedBody)
        if (matcher.find()) {
            val monto = cleanAmount(matcher.group(1) ?: "0")
            val moneda = matcher.group(2) ?: "CUP"
            val saldo = cleanAmount(matcher.group(3) ?: "0")
            val ref = "REC-MOV-" + timestamp.toString().takeLast(6)
            return ParsedResult(
                movimiento = MovimientoEntity(
                    fecha = timestamp,
                    tipo = "GASTO RECARGA",
                    monto = monto,
                    moneda = moneda,
                    saldoPosterior = saldo,
                    descripcion = "Recarga de saldo telefónico",
                    referencia = ref,
                    cuenta = "Card-Asoc"
                ),
                banco = bank
            )
        }

        // 6. EnZona
        matcher = PATTERN_ENZONA.matcher(normalizedBody)
        if (matcher.find()) {
            val monto = cleanAmount(matcher.group(1) ?: "0")
            val ref = "EZ-" + timestamp.toString().takeLast(6)
            return ParsedResult(
                movimiento = MovimientoEntity(
                    fecha = timestamp,
                    tipo = "PAGO ELECTRÓNICO",
                    monto = monto,
                    moneda = "CUP",
                    saldoPosterior = 0.0,
                    descripcion = "Operación pasarela EnZona",
                    referencia = ref,
                    cuenta = "EnZona-Wallet"
                ),
                banco = "EnZona"
            )
        }

        return null
    }

    private fun determinarBanco(sender: String, body: String): String {
        val uppercaseSender = sender.uppercase()
        val uppercaseBody = body.uppercase()

        return when {
            uppercaseSender.contains("BANDEC") || uppercaseBody.contains("BANDEC") -> "BANDEC"
            uppercaseSender.contains("BPA") || uppercaseBody.contains("BPA") -> "BPA"
            uppercaseSender.contains("METROPOLITANO") || uppercaseSender.contains("BANMET") || uppercaseBody.contains("METROPOLITANO") -> "Banco Metropolitano"
            uppercaseSender.contains("ENZONA") -> "EnZona"
            else -> "Transfermóvil"
        }
    }

    private fun cleanAmount(amountStr: String): Double {
        return try {
            amountStr.replace(",", "").toDouble()
        } catch (e: Exception) {
            0.0
        }
    }
}

data class ParsedResult(
    val movimiento: MovimientoEntity,
    val banco: String
)