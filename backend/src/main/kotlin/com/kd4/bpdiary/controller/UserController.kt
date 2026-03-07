package com.kd4.bpdiary.controller

import com.kd4.bpdiary.dto.*
import com.kd4.bpdiary.service.UserService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService,
) {

    // 알림 설정
    @GetMapping("/notification")
    fun getNotification(httpRequest: HttpServletRequest): ResponseEntity<NotificationSettingResponse> {
        val userId = httpRequest.getAttribute("userId") as Long
        return ResponseEntity.ok(userService.getNotificationSetting(userId))
    }

    @PutMapping("/notification")
    fun updateNotification(
        @RequestBody request: NotificationSettingRequest,
        httpRequest: HttpServletRequest,
    ): ResponseEntity<NotificationSettingResponse> {
        val userId = httpRequest.getAttribute("userId") as Long
        return ResponseEntity.ok(userService.updateNotificationSetting(userId, request))
    }

    // 복약 관리
    @GetMapping("/medications")
    fun getMedications(httpRequest: HttpServletRequest): ResponseEntity<List<MedicationResponse>> {
        val userId = httpRequest.getAttribute("userId") as Long
        return ResponseEntity.ok(userService.getMedications(userId))
    }

    @PostMapping("/medications")
    fun addMedication(
        @RequestBody request: MedicationRequest,
        httpRequest: HttpServletRequest,
    ): ResponseEntity<MedicationResponse> {
        val userId = httpRequest.getAttribute("userId") as Long
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.addMedication(userId, request))
    }

    @PutMapping("/medications/{id}")
    fun updateMedication(
        @PathVariable id: Long,
        @RequestBody request: MedicationRequest,
        httpRequest: HttpServletRequest,
    ): ResponseEntity<MedicationResponse> {
        val userId = httpRequest.getAttribute("userId") as Long
        return ResponseEntity.ok(userService.updateMedication(userId, id, request))
    }

    @DeleteMapping("/medications/{id}")
    fun deleteMedication(
        @PathVariable id: Long,
        httpRequest: HttpServletRequest,
    ): ResponseEntity<Void> {
        val userId = httpRequest.getAttribute("userId") as Long
        userService.deleteMedication(userId, id)
        return ResponseEntity.noContent().build()
    }
}