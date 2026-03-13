package com.kd4.bpdiary.controller

import com.kd4.bpdiary.dto.*
import com.kd4.bpdiary.service.BloodPressureService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/guest")
class GuestController(
    private val bloodPressureService: BloodPressureService,
) {

    @PostMapping("/stats")
    fun getGuestStats(@Valid @RequestBody request: GuestStatsRequest): ResponseEntity<StatsResponse> {
        val result = bloodPressureService.calculateGuestStats(request.records)
        return ResponseEntity.ok(result)
    }
}