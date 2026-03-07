package com.kd4.bpdiary.scheduler

import com.kd4.bpdiary.entity.AuthProvider
import com.kd4.bpdiary.repository.UserRepository
import com.kd4.bpdiary.service.TossMessageService
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.ZoneId
import java.time.ZonedDateTime

@Component
class NotificationScheduler(
    private val userRepository: UserRepository,
    private val tossMessageService: TossMessageService?,
) {

    @Scheduled(cron = "0 0 * * * *")
    fun sendMeasurementReminder() {
        if (tossMessageService == null) return

        val kstHour = ZonedDateTime.now(ZoneId.of("Asia/Seoul")).hour

        // 아침 알림
        val morningUsers = userRepository.findByNotificationEnabledTrueAndMorningNotificationHour(kstHour)
        // 저녁 알림
        val eveningUsers = userRepository.findByNotificationEnabledTrueAndEveningNotificationHour(kstHour)

        val allUsers = (morningUsers + eveningUsers).distinctBy { it.id }

        allUsers
            .filter { it.provider == AuthProvider.TOSS && it.providerUserId != null }
            .forEach { user ->
                tossMessageService.sendMessage(user.providerUserId!!)
            }
    }
}