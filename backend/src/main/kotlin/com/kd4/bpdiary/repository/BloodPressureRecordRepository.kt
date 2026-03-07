package com.kd4.bpdiary.repository

import com.kd4.bpdiary.entity.BloodPressureRecord
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime

interface BloodPressureRecordRepository : JpaRepository<BloodPressureRecord, Long> {
    fun findByUserIdAndMeasuredAtBetweenOrderByMeasuredAtDesc(
        userId: Long,
        start: LocalDateTime,
        end: LocalDateTime,
    ): List<BloodPressureRecord>

    fun findByUserIdOrderByMeasuredAtDesc(userId: Long): List<BloodPressureRecord>

    fun findTop1ByUserIdOrderByMeasuredAtDesc(userId: Long): BloodPressureRecord?
}