package com.cubanbank.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.cubanbank.data.TransferDatabase
import com.cubanbank.data.TarjetaEntity
import com.cubanbank.data.MovimientoEntity
import com.cubanbank.repository.TransferRepository
import com.cubanbank.receiver.SmsContentObserver
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed interface ControlUiState {
    object Cargando : ControlUiState
    data class Exito(
        val tarjetas: List<TarjetaEntity>,
        val movimientos: List<MovimientoEntity>,
        val saldoTotalCUP: Double,
        val resumenFinanzas: ResumenFinanzas
    ) : ControlUiState
}

data class ResumenFinanzas(
    val totalIngresos: Double,
    val totalEgresos: Double,
    val totalGastos: Double,
    val totalRecargas: Double,
    val totalPagosEnZona: Double
)

class TransferViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: TransferRepository
    
    // Filtros dinámicos
    val busquedaTexto = MutableStateFlow("")
    val filtroBanco = MutableStateFlow("TODOS") // TODOS, BANDEC, BPA, Banco Metropolitano
    val filtroTipoOperacion = MutableStateFlow("TODAS") // TODAS, INGRESO, EGRESO, GASTO, RECARGA, PAGO ELECTRÓNICO
    val escaneandoMensajes = MutableStateFlow(false)

    init {
        val dao = TransferDatabase.getDatabase(application).transferDao()
        repository = TransferRepository(dao)
    }

    // Reactividad y rendimiento combinatorio impecable para 100,000+ registros
    val uiState: StateFlow<ControlUiState> = combine(
        repository.todasLasTarjetas,
        repository.todosLosMovimientos,
        busquedaTexto,
        filtroBanco,
        filtroTipoOperacion
    ) { tarjetas, movimientos, query, bancoStr, tipoStr ->

        var movFiltrados = movimientos

        // 1. Filtrar por tipo de banco
        if (bancoStr != "TODOS") {
            movFiltrados = movFiltrados.filter { 
                it.descripcion.contains(bancoStr, ignoreCase = true) 
            }
        }

        // 2. Filtrar por tipo de operación
        if (tipoStr != "TODAS") {
            movFiltrados = movFiltrados.filter { it.tipo == tipoStr }
        }

        // 3. Filtrar por consulta de búsqueda general
        if (query.isNotBlank()) {
            movFiltrados = movFiltrados.filter {
                it.descripcion.contains(query, ignoreCase = true) ||
                it.referencia.contains(query, ignoreCase = true) ||
                it.cuenta.contains(query)
            }
        }

        // Calcular estadisticas correspondientes
        val totalCUPSaldos = tarjetas.sumOf { it.saldoActual }
        val resumen = calcularEstadisticas(movimientos)

        ControlUiState.Exito(
            tarjetas = tarjetas,
            movimientos = movFiltrados,
            saldoTotalCUP = totalCUPSaldos,
            resumenFinanzas = resumen
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = ControlUiState.Cargando
    )

    private fun calcularEstadisticas(items: List<MovimientoEntity>): ResumenFinanzas {
        var ingresos = 0.0
        var egresos = 0.0
        var gastos = 0.0
        var recargas = 0.0
        var ez = 0.0

        for (item in items) {
            when (item.tipo) {
                "INGRESO" -> ingresos += item.monto
                "EGRESO" -> egresos += item.monto
                "GASTO" -> gastos += item.monto
                "GASTO RECARGA" -> recargas += item.monto
                "PAGO ELECTRÓNICO" -> ez += item.monto
            }
        }

        return ResumenFinanzas(
            totalIngresos = ingresos,
            totalEgresos = egresos,
            totalGastos = gastos,
            totalRecargas = recargas,
            totalPagosEnZona = ez
        )
    }

    fun dispararEscaneoHistorico() {
        viewModelScope.launch {
            escaneandoMensajes.value = true
            try {
                SmsContentObserver.escanearMensajesHistoricos(getApplication())
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                escaneandoMensajes.value = false
            }
        }
    }
}