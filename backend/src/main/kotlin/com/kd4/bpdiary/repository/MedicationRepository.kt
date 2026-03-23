package com.kd4.bpdiary.repository

import com.kd4.bpdiary.entity.Medication
import org.springframework.data.jpa.repository.JpaRepository

interface MedicationRepository : JpaRepository<Medication, Long> {
    fun findByUserIdOrderByCreatedAtAsc(userId: Long): List<Medication>
    fun findByIdAndUserId(id: Long, userId: Long): Medication?

    fun deleteByUserId(userId: Long)
}