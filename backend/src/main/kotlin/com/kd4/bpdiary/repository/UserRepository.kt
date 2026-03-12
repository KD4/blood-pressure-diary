package com.kd4.bpdiary.repository

import com.kd4.bpdiary.entity.AuthProvider
import com.kd4.bpdiary.entity.User
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface UserRepository : JpaRepository<User, Long> {
    fun findBySessionToken(sessionToken: String): User?
    fun findByEmail(email: String): User?
    fun findByProviderAndProviderUserId(provider: AuthProvider, providerUserId: String): User?
    fun findByNotificationEnabledTrueAndMorningNotificationHour(hour: Int): List<User>
    fun findByNotificationEnabledTrueAndEveningNotificationHour(hour: Int): List<User>

    @Query(
        """
        SELECT u FROM User u
        WHERE u.notificationEnabled = true
          AND u.morningNotificationHour = :hour
          AND u.provider = 'TOSS'
          AND u.providerUserId IS NOT NULL
          AND u.id > :lastId
        ORDER BY u.id
        """
    )
    fun findMorningNotificationChunk(hour: Int, lastId: Long, pageable: Pageable): List<User>

    @Query(
        """
        SELECT u FROM User u
        WHERE u.notificationEnabled = true
          AND u.eveningNotificationHour = :hour
          AND u.provider = 'TOSS'
          AND u.providerUserId IS NOT NULL
          AND u.id > :lastId
        ORDER BY u.id
        """
    )
    fun findEveningNotificationChunk(hour: Int, lastId: Long, pageable: Pageable): List<User>
}