package com.kd4.bpdiary.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.http.*
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

@Service
@ConditionalOnProperty("oauth.toss.enabled", havingValue = "true", matchIfMissing = false)
class TossMessageService(
    @Value("\${toss.message.template-code}") private val templateCode: String,
    @Value("\${toss.mtls.cert:}") private val mtlsCert: String,
    @Value("\${toss.mtls.key:}") private val mtlsKey: String,
) {
    companion object {
        private const val SEND_URL =
            "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/send-message"
    }

    fun sendMessage(userKey: String) {
        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
            set("X-Toss-User-Key", userKey)
        }
        val body = mapOf(
            "templateSetCode" to templateCode,
            "context" to emptyMap<String, Any>(),
        )

        try {
            val restTemplate = RestTemplate()
            restTemplate.exchange(
                SEND_URL, HttpMethod.POST, HttpEntity(body, headers), Map::class.java,
            )
        } catch (e: Exception) {
            // 메시지 발송 실패는 로깅만 하고 예외를 전파하지 않음
            println("메시지 발송 실패 (userKey=$userKey): ${e.message}")
        }
    }
}