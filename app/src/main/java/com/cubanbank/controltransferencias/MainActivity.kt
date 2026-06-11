package com.cubanbank.controltransferencias

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.core.content.ContextCompat
import com.cubanbank.ui.TransferViewModel
import com.cubanbank.ui.ControlTransferenciasUi

class MainActivity : ComponentActivity() {

    private val viewModel: TransferViewModel by viewModels()

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val readSmsGranted = permissions[Manifest.permission.READ_SMS] ?: false
        if (readSmsGranted) {
            Toast.makeText(this, "Permiso de SMS concedido. Iniciando escaneo.", Toast.LENGTH_SHORT).show()
            viewModel.dispararEscaneoHistorico()
        } else {
            Toast.makeText(this, "Permiso de SMS rechazado. La app funcionará de forma manual.", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Comprobar y solicitar permisos al arrancar la aplicación
        verificarYPedirPermisos()

        setContent {
            MaterialTheme {
                Surface(color = MaterialTheme.colorScheme.background) {
                    ControlTransferenciasUi(viewModel = viewModel)
                }
            }
        }
    }

    private fun verificarYPedirPermisos() {
        val permissionsNeeded = mutableListOf<String>()
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.READ_SMS)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.RECEIVE_SMS)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.READ_PHONE_STATE)
        }

        if (permissionsNeeded.isNotEmpty()) {
            requestPermissionLauncher.launch(permissionsNeeded.toTypedArray())
        } else {
            // Ya se tienen los permisos, escanear historial en segundo plano
            viewModel.dispararEscaneoHistorico()
        }
    }
}