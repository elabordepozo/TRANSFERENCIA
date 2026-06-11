package com.cubanbank.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Index

@Entity(
    tableName = "tarjetas",
    indices = [Index(value = ["numeroCuenta"], unique = true)]
)
data class TarjetaEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val banco: String,               // BPA, BANDEC, Banco Metropolitano
    val numeroCuenta: String,        // Cuenta completa o enmascarada
    val ultimosDigitos: String,      // Últimos 4 dígitos para visualización (ej: "1513")
    val saldoActual: Double,         // Monto disponible actual en CUP o MLC
    val fechaActualizacion: Long     // Timestamp de la última operación procesada
)