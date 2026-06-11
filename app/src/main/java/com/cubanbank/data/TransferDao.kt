package com.cubanbank.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow

@Dao
interface TransferDao {

    // Movimientos
    @Query("SELECT * FROM movimientos ORDER BY fecha DESC")
    fun getAllMovimientos(): Flow<List<MovimientoEntity>>

    @Query("SELECT * FROM movimientos WHERE tipo = :tipoFilter ORDER BY fecha DESC")
    fun getMovimientosByTipo(tipoFilter: String): Flow<List<MovimientoEntity>>

    @Query("SELECT * FROM movimientos WHERE cuenta = :ultimosDigitos ORDER BY fecha DESC")
    fun getMovimientosByTarjeta(ultimosDigitos: String): Flow<List<MovimientoEntity>>

    @Insert(onConflict = OnConflictStrategy.IGNORE) // Si la referencia ya existe, ignoramos para evitar duplicados
    suspend fun insertMovimiento(movimiento: MovimientoEntity): Long

    // Tarjetas
    @Query("SELECT * FROM tarjetas ORDER BY fechaActualizacion DESC")
    fun getAllTarjetas(): Flow<List<TarjetaEntity>>

    @Query("SELECT * FROM tarjetas WHERE numeroCuenta = :accountNum LIMIT 1")
    suspend fun getTarjetaByCuenta(accountNum: String): TarjetaEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateTarjeta(tarjeta: TarjetaEntity): Long

    @Query("UPDATE tarjetas SET saldoActual = :nuevoSaldo, fechaActualizacion = :timestamp WHERE numeroCuenta = :accountNum")
    suspend fun updateTarjetaSaldo(accountNum: String, nuevoSaldo: Double, timestamp: Long)

    @Transaction
    suspend fun registrarMovimientoActualizandoTarjeta(mov: MovimientoEntity, banco: String) {
        // Ejecución atómica para asegurar consistencia
        val insertedId = insertMovimiento(mov)
        if (insertedId != -1L) {
            val tarjetaExistente = getTarjetaByCuenta(mov.cuenta)
            if (tarjetaExistente != null) {
                // Actualizar saldo de tarjeta existente si viene con saldo posterior válido
                if (mov.saldoPosterior > 0.0) {
                    updateTarjetaSaldo(mov.cuenta, mov.saldoPosterior, mov.fecha)
                }
            } else {
                // Registrar tarjeta automáticamente
                val nuevaTarjeta = TarjetaEntity(
                    banco = banco,
                    numeroCuenta = mov.cuenta,
                    ultimosDigitos = if (mov.cuenta.length > 4) mov.cuenta.takeLast(4) else mov.cuenta,
                    saldoActual = if (mov.saldoPosterior > 0.0) mov.saldoPosterior else mov.monto,
                    fechaActualizacion = mov.fecha
                )
                insertOrUpdateTarjeta(nuevaTarjeta)
            }
        }
    }
}