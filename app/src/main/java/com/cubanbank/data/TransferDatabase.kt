package com.cubanbank.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [TarjetaEntity::class, MovimientoEntity::class],
    version = 1,
    exportSchema = false
)
abstract class TransferDatabase : RoomDatabase() {

    abstract fun transferDao(): TransferDao

    companion object {
        @Volatile
        private var INSTANCE: TransferDatabase? = null

        fun getDatabase(context: Context): TransferDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    TransferDatabase::class.java,
                    "control_transferencias_db"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}