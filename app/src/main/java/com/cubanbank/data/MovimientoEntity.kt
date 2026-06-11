package com.cubanbank.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Index

@Entity(
    tableName = "movimientos",
    indices = [
        Index(value = ["fecha"]),
        Index(value = ["cuenta"]),
        Index(value = ["referencia"], unique = true) // Evita duplicar un mismo SMS leído dos veces
    ]
)
data class MovimientoEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val fecha: Long,                 // Timestamp epoch msec
    val tipo: String,                // INGRESO, EGRESO, GASTO, GASTO RECARGA, PAGO ELECTRÓNICO, CONSULTA SALDO
    val monto: Double,
    val moneda: String,              // CUP, MLC
    val saldoPosterior: Double,      // Saldo restante informado tras la operación
    val descripcion: String,         // Cuerpo original de la operación o entidad
    val referencia: String,          // ID de operación única provisto por Transfermóvil/EnZona
    val cuenta: String               // Últimos 4 dígitos de la tarjeta asociada
)