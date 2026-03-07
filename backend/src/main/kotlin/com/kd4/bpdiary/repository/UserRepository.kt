package com.kd4.bpdiary.repository

import com.kd4.bpdiary.entity.AuthProvider
import com.kd4.bpdiary.entity.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, Long> {
    fun findBySessionToken(sessionToken: String): User?
    fun findByEmail(email: String): User?
    fun findByProviderAndProviderUserId(provider: AuthProvider, providerUserId: String): User?
    fun findByNotificationEnabledTrueAndMorningNotificationHour(hour: Int): List<User>
    fun findByNotificationEnabledTrueAndEveningNotificationHour(hour: Int): List<User>
}