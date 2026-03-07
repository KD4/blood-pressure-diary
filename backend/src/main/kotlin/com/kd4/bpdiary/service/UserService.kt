package com.kd4.bpdiary.service

import com.kd4.bpdiary.dto.*
import com.kd4.bpdiary.entity.Medication
import com.kd4.bpdiary.repository.MedicationRepository
import com.kd4.bpdiary.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository,
    private val medicationRepository: MedicationRepository,
) {

    fun getNotificationSetting(userId: Long): NotificationSettingResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { RuntimeException("사용자를 찾을 수 없습니다.") }
        return NotificationSettingResponse(
            enabled = user.notificationEnabled,
            morningHour = user.morningNotificationHour,
            eveningHour = user.eveningNotificationHour,
        )
    }

    fun updateNotificationSetting(userId: Long, request: NotificationSettingRequest): NotificationSettingResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { RuntimeException("사용자를 찾을 수 없습니다.") }
        user.notificationEnabled = request.enabled
        if (request.morningHour != null) user.morningNotificationHour = request.morningHour
        if (request.eveningHour != null) user.eveningNotificationHour = request.eveningHour
        userRepository.save(user)
        return NotificationSettingResponse(
            enabled = user.notificationEnabled,
            morningHour = user.morningNotificationHour,
            eveningHour = user.eveningNotificationHour,
        )
    }

    // 복약 관리
    fun getMedications(userId: Long): List<MedicationResponse> {
        return medicationRepository.findByUserIdOrderByCreatedAtAsc(userId).map { it.toResponse() }
    }

    fun addMedication(userId: Long, request: MedicationRequest): MedicationResponse {
        val medication = medicationRepository.save(
            Medication(
                userId = userId,
                name = request.name,
                dosageTime = request.dosageTime,
                enabled = request.enabled,
            )
        )
        return medication.toResponse()
    }

    fun updateMedication(userId: Long, medicationId: Long, request: MedicationRequest): MedicationResponse {
        val medication = medicationRepository.findByIdAndUserId(medicationId, userId)
            ?: throw RuntimeException("복약 정보를 찾을 수 없습니다.")
        medication.name = request.name
        medication.dosageTime = request.dosageTime
        medication.enabled = request.enabled
        medicationRepository.save(medication)
        return medication.toResponse()
    }

    fun deleteMedication(userId: Long, medicationId: Long) {
        val medication = medicationRepository.findByIdAndUserId(medicationId, userId)
            ?: throw RuntimeException("복약 정보를 찾을 수 없습니다.")
        medicationRepository.delete(medication)
    }
}

private fun Medication.toResponse() = MedicationResponse(
    id = id,
    name = name,
    dosageTime = dosageTime,
    enabled = enabled,
)