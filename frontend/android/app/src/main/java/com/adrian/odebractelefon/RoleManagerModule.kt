package com.adrian.odebractelefon

import android.app.role.RoleManager
import android.content.Context
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class RoleManagerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "RoleManagerModule"

    @ReactMethod
    fun requestCallScreeningRole(promise: Promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            promise.reject("UNSUPPORTED", "Wymaga Androida 10 (API 29) lub nowszego")
            return
        }

        val roleManager =
            reactApplicationContext.getSystemService(Context.ROLE_SERVICE) as RoleManager

        if (!roleManager.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING)) {
            promise.reject("NOT_AVAILABLE", "Ta rola nie jest dostepna na tym urzadzeniu")
            return
        }

        if (roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
            promise.resolve("ALREADY_GRANTED")
            return
        }

        val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)
        val activity = currentActivity

        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Brak aktywnej activity do wyswietlenia okienka")
            return
        }

        activity.startActivityForResult(intent, 4321)
        promise.resolve("REQUESTED")
    }

    @ReactMethod
    fun isCallScreeningRoleGranted(promise: Promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            promise.resolve(false)
            return
        }
        val roleManager =
            reactApplicationContext.getSystemService(Context.ROLE_SERVICE) as RoleManager
        promise.resolve(roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING))
    }
}
