package com.outdidev.ev_app;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.startup.Initializer;
import java.util.Collections;
import java.util.List;
import android.util.Log;

/**
 * Initializer for suppressing Flogger logging warnings.
 * This class provides a simpler approach that doesn't require the Flogger library directly.
 */
public class FloggerInitializer implements Initializer<Void> {
    private static final String TAG = "FloggerInitializer";

    @NonNull
    @Override
    public Void create(@NonNull Context context) {
        // Set system properties to suppress Flogger warnings
        try {
            // Set log level to WARNING to reduce noise
            System.setProperty(".level", "WARNING");
            
            // Disable Flogger logs by setting properties
            System.setProperty("flogger.logging_context", "NOOP");
            
            Log.i(TAG, "Flogger logging configured");
        } catch (Exception e) {
            Log.e(TAG, "Error configuring Flogger: " + e.getMessage());
        }
        
        return null;
    }

    @NonNull
    @Override
    public List<Class<? extends Initializer<?>>> dependencies() {
        return Collections.emptyList();
    }
}