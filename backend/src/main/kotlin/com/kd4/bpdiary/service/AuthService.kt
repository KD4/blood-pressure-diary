package com.kd4.bpdiary.service

import com.kd4.bpdiary.entity.AuthProvider
import com.kd4.bpdiary.entity.User
import com.kd4.bpdiary.oauth.OAuthClient
import com.kd4.bpdiary.repository.UserRepository
import org.mindrot.jbcrypt.BCrypt
import org.springframework.stereotype.Service
import java.util.*

@Service
class AuthService(
    private val userRepository: UserRepository,
    oauthClients: List<OAuthClient>,
) {
    private val oauthClientMap: Map<AuthProvider, OAuthClient> =
        oauthClients.associateBy { it.provider }

    data class LoginResult(val token: String, val isNewUser: Boolean)

    fun oauthLogin(providerName: String, code: String, referrer: String? = null): LoginResult {
        val provider = AuthProvider.valueOf(providerName.uppercase())
        val client = oauthClientMap[provider]
            ?: throw RuntimeException("지원하지 않는 로그인 방식입니다: $providerName")

        val accessToken = client.exchangeCode(code, referrer)
        val providerUserId = client.getUserId(accessToken)

        return loginOrCreateOAuthUser(provider, providerUserId)
    }

    fun register(email: String, password: String): LoginResult {
        if (userRepository.findByEmail(email) != null) {
            throw RuntimeException("이미 가입된 이메일입니다.")
        }
        val hashed = BCrypt.hashpw(password, BCrypt.gensalt())
        val user = userRepository.save(
            User(provider = AuthProvider.LOCAL, email = email, password = hashed)
        )
        return issueToken(user, isNewUser = true)
    }

    fun login(email: String, password: String): LoginResult {
        val user = userRepository.findByEmail(email)
            ?: throw RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.")
        if (user.password == null || !BCrypt.checkpw(password, user.password)) {
            throw RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.")
        }
        return issueToken(user, isNewUser = false)
    }

    fun disconnectTossUser(userKey: String) {
        val user = userRepository.findByProviderAndProviderUserId(AuthProvider.TOSS, userKey)
            ?: return
        user.sessionToken = null
        userRepository.save(user)
    }

    private fun loginOrCreateOAuthUser(provider: AuthProvider, providerUserId: String): LoginResult {
        val existing = userRepository.findByProviderAndProviderUserId(provider, providerUserId)
        if (existing != null) {
            return issueToken(existing, isNewUser = false)
        }
        val newUser = userRepository.save(User(provider = provider, providerUserId = providerUserId))
        return issueToken(newUser, isNewUser = true)
    }

    private fun issueToken(user: User, isNewUser: Boolean): LoginResult {
        val token = UUID.randomUUID().toString()
        user.sessionToken = token
        userRepository.save(user)
        return LoginResult(token = token, isNewUser = isNewUser)
    }
}