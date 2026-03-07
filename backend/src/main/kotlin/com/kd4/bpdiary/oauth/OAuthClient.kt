package com.kd4.bpdiary.oauth

import com.kd4.bpdiary.entity.AuthProvider

interface OAuthClient {
    val provider: AuthProvider
    fun exchangeCode(code: String, referrer: String? = null): String
    fun getUserId(accessToken: String): String
}