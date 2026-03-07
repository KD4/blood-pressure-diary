package com.kd4.bpdiary.dto

data class NotificationSettingRequest(
    val enabled: Boolean,
    val morningHour: Int? = null,
    val eveningHour: Int? = null,
)

data class NotificationSettingResponse(
    val enabled: Boolean,
    val morningHour: Int?,
    val eveningHour: Int?,
)

data class MedicationRequest(
    val name: String,
    val dosageTime: Int? = null,
    val enabled: Boolean = true,
)

data class MedicationResponse(
    val id: Long,
    val name: String,
    val dosageTime: Int?,
    val enabled: Boolean,
)