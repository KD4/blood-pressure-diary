package com.kd4.bpdiary.entity

import jakarta.persistence.*
import java.time.LocalDateTime

enum class MeasurementTag {
    AFTER_EXERCISE,   // 운동 후
    AFTER_MEAL,       // 식후
    NERVOUS,          // 긴장
    AFTER_DRINKING,   // 음주 후
    MORNING,          // 아침
    EVENING,          // 저녁
    OTHER             // 기타
}

@Entity
@Table(
    name = "blood_pressure_records",
    indexes = [
        Index(name = "idx_bp_user_measured", columnList = "userId, measuredAt"),
    ]
)
class BloodPressureRecord(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val userId: Long,

    @Column(nullable = false)
    val systolic: Int,        // 수축기 혈압

    @Column(nullable = false)
    val diastolic: Int,       // 이완기 혈압

    @Column(nullable = false)
    val pulse: Int,           // 맥박

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    val tag: MeasurementTag? = null,

    val memo: String? = null,

    @Column(nullable = false)
    val measuredAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
)