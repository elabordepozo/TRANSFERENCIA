package com.cubanbank.repository

import com.cubanbank.data.TransferDao
import com.cubanbank.data.TarjetaEntity
import com.cubanbank.data.MovimientoEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

class TransferRepository(private val dao: TransferDao) {

    // Flujos reactivos de datos
    val todosLosMovimientos: Flow<List<MovimientoEntity>> = dao.getAllMovimientos()
    val todasLasTarjetas: Flow<List<TarjetaEntity>> = dao.getAllTarjetas()

    fun obtenerMovimientosPorTipo(tipo: String): Flow<List<MovimientoEntity>> {
        return dao.getMovimientosByTipo(tipo)
    }

    fun obtenerMovimientosPorTarjeta(cuenta: String): Flow<List<MovimientoEntity>> {
        return dao.getMovimientosByTarjeta(cuenta)
    }

    suspend fun agregarMovimientoManualmente(mov: MovimientoEntity, banco: String) = withContext(Dispatchers.IO) {
        dao.registrarMovimientoActualizandoTarjeta(mov, banco)
    }

    suspend fun registrarTarjetaManual(tarjeta: TarjetaEntity) = withContext(Dispatchers.IO) {
        dao.insertOrUpdateTarjeta(tarjeta)
    }
}