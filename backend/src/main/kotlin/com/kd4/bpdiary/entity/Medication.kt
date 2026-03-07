package com.kd4.bpdiary.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "medications",
    indexes = [
        Index(name = "idx_med_user", columnList = "userId"),
    ]
)
class Medication(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val userId: Long,

    @Column(nullable = false)
    var name: String,              // 약 이름

    var dosageTime: Int? = null,   // 복용 시간 (0~23)

    var enabled: Boolean = true,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
)