package com.kd4.bpdiary.controller

import com.kd4.bpdiary.service.AuthService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.Base64

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
    @Value("\${toss.disconnect.basic-auth:}") private val basicAuth: String,
) {

    data class OAuthRequest(val provider: String, val code: String, val referrer: String?)
    data class LoginRequest(val email: String, val password: String)
    data class RegisterRequest(val email: String, val password: String)
    data class TossDisconnectRequest(val userKey: String, val referrer: String?)

    @PostMapping("/oauth")
    fun oauthLogin(@RequestBody request: OAuthRequest): ResponseEntity<AuthService.LoginResult> {
        val result = authService.oauthLogin(request.provider, request.code, request.referrer)
        return ResponseEntity.ok(result)
    }

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<AuthService.LoginResult> {
        val result = authService.login(request.email, request.password)
        return ResponseEntity.ok(result)
    }

    @PostMapping("/register")
    fun register(@RequestBody request: RegisterRequest): ResponseEntity<AuthService.LoginResult> {
        val result = authService.register(request.email, request.password)
        return ResponseEntity.status(HttpStatus.CREATED).body(result)
    }

    @PostMapping("/toss/disconnect")
    fun disconnectToss(
        @RequestBody request: TossDisconnectRequest,
        httpRequest: HttpServletRequest,
    ): ResponseEntity<Void> {
        if (basicAuth.isNotBlank()) {
            val authHeader = httpRequest.getHeader("Authorization") ?: ""
            val expected = "Basic ${Base64.getEncoder().encodeToString(basicAuth.toByteArray())}"
            if (authHeader != expected) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
            }
        }
        authService.disconnectTossUser(request.userKey)
        return ResponseEntity.ok().build()
    }
}