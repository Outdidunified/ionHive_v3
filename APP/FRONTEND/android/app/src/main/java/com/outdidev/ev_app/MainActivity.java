package com.outdidev.ev_app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.view.WindowManager;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import io.flutter.embedding.android.FlutterActivity;
import io.flutter.embedding.engine.FlutterEngine;
import io.flutter.plugin.common.MethodCall;
import io.flutter.plugin.common.MethodChannel;
import io.flutter.plugin.common.MethodChannel.MethodCallHandler;
import io.flutter.plugin.common.MethodChannel.Result;
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

    private static final String CHANNEL = "com.outdidev.ev_app/settings";
    
    @Override
    public void configureFlutterEngine(@NonNull FlutterEngine flutterEngine) {
        GeneratedPluginRegistrant.registerWith(flutterEngine);
        
        new MethodChannel(flutterEngine.getDartExecutor().getBinaryMessenger(), CHANNEL)
            .setMethodCallHandler(new MethodCallHandler() {
                @Override
                public void onMethodCall(@NonNull MethodCall call, @NonNull Result result) {
                    if (call.method.equals("openAppSettings")) {
                        boolean success = openAppSettings();
                        result.success(success);
                    } else {
                        result.notImplemented();
                    }
                }
            });
    }
    
    private boolean openAppSettings() {
        try {
            Intent intent = new Intent();
            intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            Uri uri = Uri.fromParts("package", getPackageName(), null);
            intent.setData(uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
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