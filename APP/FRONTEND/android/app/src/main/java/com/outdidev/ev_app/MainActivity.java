package com.outdidev.ev_app;

import android.os.Bundle;
import android.view.WindowManager;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import io.flutter.embedding.android.FlutterActivity;
import io.flutter.embedding.engine.FlutterEngine;
import io.flutter.plugins.GeneratedPluginRegistrant;

public class MainActivity extends FlutterActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        // Apply hardware acceleration flags to reduce frame rendering issues
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams layoutParams = new WindowManager.LayoutParams();
            layoutParams.layoutInDisplayCutoutMode = 
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(layoutParams);
        }
        
        // Set hardware acceleration explicitly
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        );
        
        super.onCreate(savedInstanceState);
    }

    @Override
    public void configureFlutterEngine(@NonNull FlutterEngine flutterEngine) {
        GeneratedPluginRegistrant.registerWith(flutterEngine);
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        // Reduce frame buffer queue size to minimize "Did not find frame" errors
        if (Build.VERSION.SDK_INT >= 31) { // Android 12 (S) or higher
            try {
                // Use reflection to avoid compile-time errors on older Android versions
                Class<?> surfaceClass = Class.forName("android.view.Surface");
                int compatibilityFlag = (int) surfaceClass.getField("FRAME_RATE_COMPATIBILITY_DEFAULT").get(null);
                
                getWindow().getClass()
                    .getMethod("setFrameRate", float.class, int.class)
                    .invoke(getWindow(), 60.0f, compatibilityFlag);
            } catch (Exception e) {
                // Silently ignore if the method is not available
            }
        }
    }
}