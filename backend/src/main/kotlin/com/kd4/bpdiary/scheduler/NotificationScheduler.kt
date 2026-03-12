package com.kd4.bpdiary.scheduler

import com.kd4.bpdiary.entity.User
import com.kd4.bpdiary.repository.UserRepository
import com.kd4.bpdiary.service.TossMessageService
import org.slf4j.LoggerFactory
import org.springframework.data.domain.PageRequest
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.ZoneId
import java.time.ZonedDateTime

@Component
class NotificationScheduler(
    private val userRepository: UserRepository,
    private val tossMessageService: TossMessageService?,
) {

    private val log = LoggerFactory.getLogger(NotificationScheduler::class.java)

    companion object {
        private const val CHUNK_SIZE = 500
    }

    @Scheduled(cron = "0 0 * * * *", zone = "Asia/Seoul")
    fun sendMeasurementReminder() {
        if (tossMessageService == null) {
            log.warn("[NotificationScheduler] TossMessageService is not available, skipping")
            return
        }

        val kstHour = ZonedDateTime.now(ZoneId.of("Asia/Seoul")).hour
        log.info("[NotificationScheduler] Running for hour={} (KST)", kstHour)

        val morningSent = sendChunked("morning", kstHour) { lastId, pageable ->
            userRepository.findMorningNotificationChunk(kstHour, lastId, pageable)
        }

        val eveningSent = sendChunked("evening", kstHour) { lastId, pageable ->
            userRepository.findEveningNotificationChunk(kstHour, lastId, pageable)
        }

        log.info("[NotificationScheduler] Done. morningSent={}, eveningSent={}", morningSent, eveningSent)
    }

    private fun sendChunked(
        type: String,
        hour: Int,
        fetchChunk: (lastId: Long, pageable: PageRequest) -> List<User>,
    ): Int {
        var lastId = 0L
        var totalSent = 0
        val pageable = PageRequest.ofSize(CHUNK_SIZE)

        while (true) {
            val chunk = fetchChunk(lastId, pageable)
            if (chunk.isEmpty()) break

            for (user in chunk) {
                try {
                    tossMessageService!!.sendMessage(user.providerUserId!!)
                    totalSent++
                } catch (e: Exception) {
                    log.error(
                        "[NotificationScheduler] Failed to send {} notification to userId={}: {}",
                        type, user.id, e.message,
                    )
                }
            }

            lastId = chunk.last().id
            if (chunk.size < CHUNK_SIZE) break
        }

        return totalSent
    }
}
