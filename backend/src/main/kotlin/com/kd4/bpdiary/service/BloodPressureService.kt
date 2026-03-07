package com.kd4.bpdiary.service

import com.kd4.bpdiary.dto.*
import com.kd4.bpdiary.entity.BloodPressureRecord
import com.kd4.bpdiary.entity.MeasurementPosition
import com.kd4.bpdiary.entity.MeasurementTag
import com.kd4.bpdiary.repository.BloodPressureRecordRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

@Service
class BloodPressureService(
    private val recordRepository: BloodPressureRecordRepository,
) {

    fun addRecord(userId: Long, request: RecordRequest): RecordResponse {
        val record = recordRepository.save(
            BloodPressureRecord(
                userId = userId,
                systolic = request.systolic,
                diastolic = request.diastolic,
                pulse = request.pulse,
                tag = request.tag,
                memo = request.memo,
                weight = request.weight,
                measurementPosition = request.measurementPosition,
                measuredAt = request.measuredAt ?: LocalDateTime.now(),
            )
        )
        return record.toResponse()
    }

    fun getRecords(userId: Long, days: Int): List<RecordResponse> {
        val end = LocalDate.now().atTime(LocalTime.MAX)
        val start = LocalDate.now().minusDays(days.toLong() - 1).atStartOfDay()
        return recordRepository.findByUserIdAndMeasuredAtBetweenOrderByMeasuredAtDesc(userId, start, end)
            .map { it.toResponse() }
    }

    fun getTodaySummary(userId: Long): TodaySummaryResponse {
        val today = LocalDate.now()
        val todayStart = today.atStartOfDay()
        val todayEnd = today.atTime(LocalTime.MAX)

        val todayRecords = recordRepository.findByUserIdAndMeasuredAtBetweenOrderByMeasuredAtDesc(
            userId, todayStart, todayEnd
        )

        val weekStart = today.minusDays(6).atStartOfDay()
        val weekRecords = recordRepository.findByUserIdAndMeasuredAtBetweenOrderByMeasuredAtDesc(
            userId, weekStart, todayEnd
        )

        return TodaySummaryResponse(
            latestRecord = todayRecords.firstOrNull()?.toResponse(),
            todayRecordCount = todayRecords.size,
            weekRecords = weekRecords.map { it.toResponse() },
        )
    }

    fun getStats(userId: Long, days: Int): StatsResponse {
        val end = LocalDate.now().atTime(LocalTime.MAX)
        val start = LocalDate.now().minusDays(days.toLong() - 1).atStartOfDay()

        val records = recordRepository.findByUserIdAndMeasuredAtBetweenOrderByMeasuredAtDesc(
            userId, start, end
        )

        return buildStatsResponse(records)
    }

    fun deleteRecord(userId: Long, recordId: Long) {
        val record = recordRepository.findById(recordId)
            .orElseThrow { RuntimeException("기록을 찾을 수 없습니다.") }
        if (record.userId != userId) {
            throw RuntimeException("삭제 권한이 없습니다.")
        }
        recordRepository.delete(record)
    }

    // 게스트용 통계 계산
    fun calculateGuestStats(records: List<RecordRequest>): StatsResponse {
        val mapped = records.mapIndexed { index, r ->
            BloodPressureRecord(
                id = index.toLong(),
                userId = 0,
                systolic = r.systolic,
                diastolic = r.diastolic,
                pulse = r.pulse,
                tag = r.tag,
                weight = r.weight,
                measurementPosition = r.measurementPosition,
                measuredAt = r.measuredAt ?: LocalDateTime.now(),
            )
        }
        return buildStatsResponse(mapped)
    }

    private fun buildStatsResponse(records: List<BloodPressureRecord>): StatsResponse {
        if (records.isEmpty()) {
            return StatsResponse(
                records = emptyList(),
                avgSystolic = 0.0, avgDiastolic = 0.0, avgPulse = 0.0,
                maxSystolic = 0, minSystolic = 0, maxDiastolic = 0, minDiastolic = 0,
                maxPulse = 0, minPulse = 0,
                avgWeight = null, maxWeight = null, minWeight = null,
                morningAvgSystolic = null, eveningAvgSystolic = null,
                morningAvgDiastolic = null, eveningAvgDiastolic = null,
            )
        }

        val morningRecords = records.filter {
            it.tag == MeasurementTag.MORNING || it.measuredAt.hour in 5..11
        }
        val eveningRecords = records.filter {
            it.tag == MeasurementTag.EVENING || it.measuredAt.hour in 17..23
        }

        val weightRecords = records.filter { it.weight != null }

        return StatsResponse(
            records = records.map { it.toResponse() },
            avgSystolic = records.map { it.systolic }.average(),
            avgDiastolic = records.map { it.diastolic }.average(),
            avgPulse = records.map { it.pulse }.average(),
            maxSystolic = records.maxOf { it.systolic },
            minSystolic = records.minOf { it.systolic },
            maxDiastolic = records.maxOf { it.diastolic },
            minDiastolic = records.minOf { it.diastolic },
            maxPulse = records.maxOf { it.pulse },
            minPulse = records.minOf { it.pulse },
            avgWeight = weightRecords.takeIf { it.isNotEmpty() }?.map { it.weight!! }?.average(),
            maxWeight = weightRecords.takeIf { it.isNotEmpty() }?.maxOf { it.weight!! },
            minWeight = weightRecords.takeIf { it.isNotEmpty() }?.minOf { it.weight!! },
            morningAvgSystolic = morningRecords.takeIf { it.isNotEmpty() }?.map { it.systolic }?.average(),
            eveningAvgSystolic = eveningRecords.takeIf { it.isNotEmpty() }?.map { it.systolic }?.average(),
            morningAvgDiastolic = morningRecords.takeIf { it.isNotEmpty() }?.map { it.diastolic }?.average(),
            eveningAvgDiastolic = eveningRecords.takeIf { it.isNotEmpty() }?.map { it.diastolic }?.average(),
        )
    }

    companion object {
        fun classifyBpLevel(systolic: Int, diastolic: Int): BpLevel = when {
            systolic < 90 || diastolic < 60 -> BpLevel.LOW
            systolic >= 160 || diastolic >= 100 -> BpLevel.HIGH_2
            systolic >= 140 || diastolic >= 90 -> BpLevel.HIGH_1
            systolic >= 120 || diastolic >= 80 -> BpLevel.ELEVATED
            else -> BpLevel.NORMAL
        }
    }
}

fun BloodPressureRecord.toResponse() = RecordResponse(
    id = id,
    systolic = systolic,
    diastolic = diastolic,
    pulse = pulse,
    tag = tag,
    memo = memo,
    level = BloodPressureService.classifyBpLevel(systolic, diastolic),
    measuredAt = measuredAt,
    weight = weight,
    measurementPosition = measurementPosition,
)