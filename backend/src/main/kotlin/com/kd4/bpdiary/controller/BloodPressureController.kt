package com.kd4.bpdiary.controller

import com.kd4.bpdiary.dto.*
import com.kd4.bpdiary.service.BloodPressureService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/bp")
class BloodPressureController(
    private val bloodPressureService: BloodPressureService,
) {

    @PostMapping("/records")
    fun addRecord(
        @RequestBody request: RecordRequest,
        httpRequest: HttpServletRequest,
    ): ResponseEntity<RecordResponse> {
        val userId = httpRequest.getAttribute("userId") as Long
        val result = bloodPressureService.addRecord(userId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(result)
    }

    @GetMapping("/today")
    fun getTodaySummary(httpRequest: HttpServletRequest): ResponseEntity<TodaySummaryResponse> {
        val userId = httpRequest.getAttribute("userId") as Long
        return ResponseEntity.ok(bloodPressureService.getTodaySummary(userId))
    }

    @GetMapping("/stats")
    fun getStats(
        @RequestParam(defaultValue = "7") days: Int,
        httpRequest: HttpServletRequest,
    ): ResponseEntity<StatsResponse> {
        val userId = httpRequest.getAttribute("userId") as Long
        return ResponseEntity.ok(bloodPressureService.getStats(userId, days))
    }

    @GetMapping("/records")
    fun getRecords(
        @RequestParam(defaultValue = "30") days: Int,
        httpRequest: HttpServletRequest,
    ): ResponseEntity<List<RecordResponse>> {
        val userId = httpRequest.getAttribute("userId") as Long
        return ResponseEntity.ok(bloodPressureService.getRecords(userId, days))
    }

    @DeleteMapping("/records/{id}")
    fun deleteRecord(
        @PathVariable id: Long,
        httpRequest: HttpServletRequest,
    ): ResponseEntity<Void> {
        val userId = httpRequest.getAttribute("userId") as Long
        bloodPressureService.deleteRecord(userId, id)
        return ResponseEntity.noContent().build()
    }
}