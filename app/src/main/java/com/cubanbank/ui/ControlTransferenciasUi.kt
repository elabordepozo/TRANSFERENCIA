package com.cubanbank.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.Alignment
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Color
import com.cubanbank.data.TarjetaEntity
import com.cubanbank.data.MovimientoEntity

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ControlTransferenciasUi(viewModel: TransferViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val isScanning by viewModel.escaneandoMensajes.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Transferencias Cuba") },
                actions = {
                    if (isScanning) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary)
                    } else {
                        IconButton(onClick = { viewModel.dispararEscaneoHistorico() }) {
                            Text("Sinc")
                        }
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            when (val state = uiState) {
                is ControlUiState.Cargando -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
                is ControlUiState.Exito -> {
                    DashboardScreen(
                        tarjetas = state.tarjetas,
                        movimientos = state.movimientos,
                        saldoTotal = state.saldoTotalCUP,
                        resumen = state.resumenFinanzas
                    )
                }
            }
        }
    }
}

@Composable
fun DashboardScreen(
    tarjetas: List<TarjetaEntity>,
    movimientos: List<MovimientoEntity>,
    saldoTotal: Double,
    resumen: ResumenFinanzas
) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        // Resumen General
        Card(
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Total Disponible (CUP)", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "$saldoTotal CUP",
                    style = MaterialTheme.typography.headlineLarge,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }

        // Tarjetas
        Text(text = "Tarjetas Detectadas", style = MaterialTheme.typography.titleMedium)
        LazyColumn(
            modifier = Modifier.height(150.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(tarjetas) { tarjeta ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.spaceBetween
                    ) {
                        Column {
                            Text(text = "Banco: ${tarjeta.banco}", style = MaterialTheme.typography.bodyMedium)
                            Text(text = "**** ${tarjeta.ultimosDigitos}", style = MaterialTheme.typography.bodySmall)
                        }
                        Text(text = "${tarjeta.saldoActual} CUP", style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
        }

        // Movimientos
        Text(text = "Historial de Operaciones", style = MaterialTheme.typography.titleMedium)
        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(movimientos) { mov ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(horizontalArrangement = Arrangement.spaceBetween, modifier = Modifier.fillMaxWidth()) {
                            Text(text = mov.tipo, color = if (mov.tipo == "INGRESO") Color.Green else Color.Red)
                            Text(text = "${mov.monto} CUP", style = MaterialTheme.typography.titleSmall)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = mov.descripcion, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}
