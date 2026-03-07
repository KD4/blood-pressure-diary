package com.kd4.bpdiary.oauth

import com.kd4.bpdiary.entity.AuthProvider
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.http.*
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import org.springframework.http.client.SimpleClientHttpRequestFactory
import java.io.ByteArrayInputStream
import java.net.HttpURLConnection
import java.security.KeyFactory
import java.security.KeyStore
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate
import java.security.spec.PKCS8EncodedKeySpec
import java.util.Base64
import javax.net.ssl.HttpsURLConnection
import javax.net.ssl.KeyManagerFactory
import javax.net.ssl.SSLContext

@Component
@ConditionalOnProperty("oauth.toss.enabled", havingValue = "true", matchIfMissing = false)
class TossOAuthClient(
    @Value("\${toss.mtls.cert:}") private val mtlsCert: String,
    @Value("\${toss.mtls.key:}") private val mtlsKey: String,
) : OAuthClient {

    override val provider = AuthProvider.TOSS
    private val restTemplate: RestTemplate = createMtlsRestTemplate()

    companion object {
        private const val TOKEN_URL =
            "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/generate-token"
        private const val USER_INFO_URL =
            "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/login-me"
    }

    override fun exchangeCode(code: String, referrer: String?): String {
        val headers = HttpHeaders().apply { contentType = MediaType.APPLICATION_JSON }
        val body = mapOf("authorizationCode" to code, "referrer" to (referrer ?: "DEFAULT"))
        val response = restTemplate.exchange(
            TOKEN_URL, HttpMethod.POST, HttpEntity(body, headers), Map::class.java,
        )
        val result = response.body?.get("success") as? Map<*, *>
            ?: throw RuntimeException("Toss token exchange failed")
        return result["accessToken"] as String
    }

    override fun getUserId(accessToken: String): String {
        val headers = HttpHeaders().apply {
            set("Authorization", "Bearer $accessToken")
            contentType = MediaType.APPLICATION_JSON
        }
        val response = restTemplate.exchange(
            USER_INFO_URL, HttpMethod.GET, HttpEntity<Void>(headers), Map::class.java,
        )
        val result = response.body?.get("success") as? Map<*, *>
            ?: throw RuntimeException("Failed to get Toss user info")
        return (result["userKey"] as? Any)?.toString()
            ?: throw RuntimeException("Failed to get Toss userKey")
    }

    private fun createMtlsRestTemplate(): RestTemplate {
        val certPem = if (mtlsCert.isNotBlank()) mtlsCert
                      else loadClasspathResource("bp-diary_public.crt")
        val keyPem = if (mtlsKey.isNotBlank()) mtlsKey
                     else loadClasspathResource("bp-diary_private.key")

        val cert = parseCertificate(certPem)
        val key = parsePrivateKey(keyPem)

        val keyStore = KeyStore.getInstance(KeyStore.getDefaultType()).apply {
            load(null, null)
            setCertificateEntry("client-cert", cert)
            setKeyEntry("client-key", key, charArrayOf(), arrayOf(cert))
        }
        val kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm()).apply {
            init(keyStore, charArrayOf())
        }
        val sslContext = SSLContext.getInstance("TLS").apply {
            init(kmf.keyManagers, null, null)
        }
        val factory = object : SimpleClientHttpRequestFactory() {
            override fun prepareConnection(connection: HttpURLConnection, httpMethod: String) {
                if (connection is HttpsURLConnection) {
                    connection.sslSocketFactory = sslContext.socketFactory
                }
                super.prepareConnection(connection, httpMethod)
            }
        }
        return RestTemplate(factory)
    }

    private fun loadClasspathResource(name: String): String {
        return this::class.java.classLoader.getResourceAsStream(name)
            ?.bufferedReader()?.readText()
            ?: throw RuntimeException("Classpath resource not found: $name")
    }

    private fun parseCertificate(pem: String): X509Certificate {
        val cleaned = pem.replace("\\n", "\n")
        val factory = CertificateFactory.getInstance("X.509")
        return factory.generateCertificate(ByteArrayInputStream(cleaned.toByteArray())) as X509Certificate
    }

    private fun parsePrivateKey(pem: String): java.security.PrivateKey {
        val cleaned = pem.replace("\\n", "\n")
            .replace("-----BEGIN PRIVATE KEY-----", "")
            .replace("-----END PRIVATE KEY-----", "")
            .replace("\\s".toRegex(), "")
        val decoded = Base64.getDecoder().decode(cleaned)
        return KeyFactory.getInstance("RSA").generatePrivate(PKCS8EncodedKeySpec(decoded))
    }
}