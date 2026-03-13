package com.kd4.bpdiary.dto

import com.kd4.bpdiary.entity.MeasurementPosition
import com.kd4.bpdiary.entity.MeasurementTag
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import java.time.LocalDateTime

data class RecordRequest(
    @field:Min(1) @field:Max(500)
    val systolic: Int,
    @field:Min(1) @field:Max(500)
    val diastolic: Int,
    @field:Min(1) @field:Max(500)
    val pulse: Int,
    val tag: MeasurementTag? = null,
    val memo: String? = null,
    val measuredAt: LocalDateTime? = null,
    @field:Min(1) @field:Max(999)
    val weight: Int? = null,
    val measurementPosition: MeasurementPosition? = null,
)

data class RecordResponse(
    val id: Long,
    val systolic: Int,
    val diastolic: Int,
    val pulse: Int,
    val tag: MeasurementTag?,
    val memo: String?,
    val level: BpLevel,
    val measuredAt: LocalDateTime,
    val weight: Int?,
    val measurementPosition: MeasurementPosition?,
)

enum class BpLevel(val label: String, val color: String) {
    LOW("저혈압", "#3498DB"),
    NORMAL("정상", "#27AE60"),
    ELEVATED("주의", "#F39C12"),
    HIGH_1("고혈압 1단계", "#E67E22"),
    HIGH_2("고혈압 2단계", "#C0392B"),
}

data class StatsResponse(
    val records: List<RecordResponse>,
    val avgSystolic: Double,
    val avgDiastolic: Double,
    val avgPulse: Double,
    val maxSystolic: Int,
    val minSystolic: Int,
    val maxDiastolic: Int,
    val minDiastolic: Int,
    val maxPulse: Int,
    val minPulse: Int,
    val avgWeight: Double?,
    val maxWeight: Int?,
    val minWeight: Int?,
    val morningAvgSystolic: Double?,
    val eveningAvgSystolic: Double?,
    val morningAvgDiastolic: Double?,
    val eveningAvgDiastolic: Double?,
)

data class TodaySummaryResponse(
    val latestRecord: RecordResponse?,
    val todayRecordCount: Int,
    val weekRecords: List<RecordResponse>,
)

// 게스트 모드용
data class GuestRecordRequest(
    @field:jakarta.validation.Valid
    val records: List<RecordRequest>,
)

data class GuestStatsRequest(
    @field:jakarta.validation.Valid
    val records: List<RecordRequest>,
    val days: Int = 7,
)