# 앱인토스 프로젝트 스켈레톤 가이드

> running-coach 프로젝트를 기반으로 추출한 스켈레톤 구조.
> 토스 로그인 + 게스트 모드를 포함한 앱인토스 WebView 서비스를 빠르게 구축하기 위한 참조 문서.

---

## 1. 기술 스택

### Backend
| 항목 | 선택 | 비고 |
|------|------|------|
| 언어 | Kotlin 2.1 | |
| 프레임워크 | Spring Boot 3.4 | |
| JDK | 21 (LTS) | |
| DB | MySQL + Spring Data JPA | Hibernate ddl-auto: update |
| 인증 | UUID SessionToken + Caffeine 캐시 | JWT 미사용, 심플한 구조 |
| OAuth | 토스 로그인 (mTLS) | 카카오 등 확장 가능 |
| 비밀번호 | BCrypt | 게스트/로컬 로그인용 |
| 캐싱 | Caffeine | 토큰 캐시 30분, 데이터 캐시 2시간 |
| 빌드 | Gradle (Kotlin DSL) | 최종 산출물: app.jar |
| 배포 | Docker (multi-stage) + Railway | JRE 21 기반 |

### Frontend
| 항목 | 선택 | 비고 |
|------|------|------|
| 프레임워크 | React 18 + TypeScript 5.8 | |
| 빌드 | Vite 7 | dev proxy → localhost:8080 |
| UI 라이브러리 | @toss/tds-mobile | 토스 디자인 시스템 필수 |
| 앱인토스 SDK | @apps-in-toss/web-framework | OAuth, 광고, 뒤로가기 등 |
| 스타일링 | Emotion (CSS-in-JS) | Tailwind 미사용 |
| HTTP 클라이언트 | Axios | 인터셉터로 토큰/401 처리 |
| 라우팅 | react-router-dom v7 | |
| 상태관리 | Context API | Redux 불필요한 규모 |
| 설정 | granite.config.ts | 앱인토스 빌드/배포 설정 |

---

## 2. 프로젝트 디렉토리 구조

```
project-root/
├── backend/
│   ├── src/main/kotlin/com/example/myapp/
│   │   ├── config/
│   │   │   ├── WebConfig.kt              # CORS, Interceptor 등록
│   │   │   └── AuthInterceptor.kt        # 토큰 인증 인터셉터
│   │   ├── controller/
│   │   │   ├── AuthController.kt         # 로그인/회원가입 API
│   │   │   ├── UserController.kt         # 프로필/알림 설정 API
│   │   │   └── GuestController.kt        # 게스트 전용 API (인증 불필요)
│   │   ├── entity/
│   │   │   ├── User.kt                   # 사용자 (OAuth + 로컬)
│   │   │   └── UserProfile.kt            # 사용자 프로필 (1:1)
│   │   ├── repository/
│   │   │   ├── UserRepository.kt
│   │   │   └── UserProfileRepository.kt
│   │   ├── service/
│   │   │   ├── AuthService.kt            # 로그인/토큰 발급 로직
│   │   │   └── UserService.kt            # 프로필 CRUD
│   │   ├── oauth/
│   │   │   ├── OAuthClient.kt            # OAuth 인터페이스
│   │   │   └── TossOAuthClient.kt        # 토스 mTLS OAuth 구현
│   │   ├── notification/
│   │   │   ├── NotificationScheduler.kt  # @Scheduled 알림 발송
│   │   │   └── TossMessageService.kt     # 토스 메시징 API
│   │   └── dto/                          # 요청/응답 DTO
│   ├── src/main/resources/
│   │   ├── application.yml               # 환경변수 참조 설정
│   │   ├── running-coach-1_public.crt    # mTLS 인증서 (개발용)
│   │   └── running-coach-1_private.key   # mTLS 개인키 (개발용)
│   ├── build.gradle.kts
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts                 # Axios 인스턴스 + 인터셉터
│   │   │   ├── auth.ts                   # 로그인 API
│   │   │   ├── user.ts                   # 프로필 API
│   │   │   └── [도메인].ts               # 비즈니스 API
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx        # 인증 라우트 가드
│   │   │   ├── BottomNav.tsx             # 하단 탭 네비게이션
│   │   │   └── wizard/                   # 온보딩 위자드
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx            # 인증 상태 (토스+게스트)
│   │   │   └── DataCacheContext.tsx       # API 캐싱 (5분 TTL)
│   │   ├── hooks/
│   │   │   ├── useBackEvent.ts           # 앱인토스 뒤로가기
│   │   │   ├── useExitConfirm.tsx        # 종료 확인
│   │   │   └── useTossBanner.ts          # 배너 광고
│   │   ├── pages/
│   │   │   ├── Login.tsx                 # 토스 로그인 화면
│   │   │   ├── OAuthCallback.tsx         # OAuth 콜백
│   │   │   ├── Onboarding.tsx            # 온보딩 (로그인 선택 + 위자드)
│   │   │   └── [페이지].tsx              # 비즈니스 페이지
│   │   ├── layouts/
│   │   │   └── MainLayout.tsx            # 공통 레이아웃 + BottomNav
│   │   ├── styles/
│   │   │   ├── tokens.ts                 # 디자인 토큰 (색상, 간격, 반경)
│   │   │   └── common.ts                 # 공통 CSS-in-JS
│   │   ├── types/
│   │   │   └── index.ts                  # DTO 타입 정의
│   │   ├── App.tsx                       # 라우팅 정의
│   │   └── main.tsx                      # 엔트리포인트
│   ├── granite.config.ts                 # 앱인토스 설정
│   ├── vite.config.ts                    # Vite 빌드 설정
│   ├── package.json
│   ├── .env.local                        # 개발 환경변수
│   └── .env.production                   # 프로덕션 환경변수
└── README.md
```

---

## 3. Backend 스켈레톤

### 3.1 build.gradle.kts (핵심 의존성)

```kotlin
plugins {
    id("org.springframework.boot") version "3.4.3"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("jvm") version "2.1.10"
    kotlin("plugin.spring") version "2.1.10"
    kotlin("plugin.jpa") version "2.1.10"
}

java { toolchain { languageVersion = JavaLanguageVersion.of(21) } }

dependencies {
    // Spring Boot
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")

    // Kotlin
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    // 인증
    implementation("org.mindrot:jbcrypt:0.4")

    // 캐싱
    implementation("com.github.ben-manes.caffeine:caffeine")

    // DB
    runtimeOnly("com.mysql:mysql-connector-j")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.named<org.springframework.boot.gradle.tasks.bundling.BootJar>("bootJar") {
    archiveFileName.set("app.jar")
}
```

### 3.2 application.yml

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 30
      minimum-idle: 10
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        format_sql: true
        jdbc:
          time_zone: UTC
    open-in-view: false

server:
  port: ${PORT:8080}

# OAuth 제공자 토글 (ConditionalOnProperty 기반)
oauth:
  toss:
    enabled: ${TOSS_OAUTH_ENABLED:true}

# 토스 mTLS 인증서 (환경변수 또는 classpath 리소스)
toss:
  disconnect:
    basic-auth: ${TOSS_DISCONNECT_BASIC_AUTH}
  mtls:
    cert: ${TOSS_MTLS_CERT:}
    key: ${TOSS_MTLS_KEY:}
  message:
    template-code: ${TOSS_MESSAGE_TEMPLATE_CODE:daily_schedule_reminder}
```

### 3.3 Entity - User (다중 인증 제공자 지원)

```kotlin
enum class AuthProvider { TOSS, LOCAL }

@Entity
@Table(
    name = "users",
    uniqueConstraints = [UniqueConstraint(columnNames = ["provider", "provider_user_id"])],
    indexes = [
        Index(name = "idx_user_session_token", columnList = "sessionToken"),
        Index(name = "idx_user_email", columnList = "email"),
    ]
)
class User(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    val provider: AuthProvider,

    @Column(name = "provider_user_id")
    val providerUserId: String? = null,     // OAuth 제공자 고유 ID

    @Column(unique = true)
    var email: String? = null,              // 로컬 로그인용

    var password: String? = null,           // BCrypt 해시

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    var sessionToken: String? = null,       // UUID 기반 세션 토큰
)
```

**설계 포인트:**
- `provider + providerUserId` 복합 유니크 → OAuth 사용자 식별
- `sessionToken` 인덱스 → 인증 캐시 미스 시 빠른 DB 조회
- JWT 대신 UUID 토큰 → 서버 사이드 세션, 즉시 무효화 가능

### 3.4 AuthInterceptor (인증 처리)

```kotlin
@Component
class AuthInterceptor(
    private val userRepository: UserRepository,
) : HandlerInterceptor {

    // 토큰 → userId 매핑 캐시 (TTL 30분, 최대 1000건)
    private val tokenCache = Caffeine.newBuilder()
        .expireAfterWrite(30, TimeUnit.MINUTES)
        .maximumSize(1_000)
        .build<String, Long>()

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
    ): Boolean {
        if (request.method == "OPTIONS") return true

        // 인증 스킵 경로
        val path = request.requestURI
        if (path.startsWith("/api/auth") || path.startsWith("/api/guest")) return true

        // Bearer 토큰 추출
        val header = request.getHeader("Authorization")
        if (header == null || !header.startsWith("Bearer ")) {
            response.status = 401
            response.contentType = "application/json"
            response.writer.write("""{"error":"Unauthorized"}""")
            return false
        }

        val token = header.substring(7)

        // 캐시 우선 → 미스 시 DB 조회
        val userId = tokenCache.get(token) { t ->
            userRepository.findBySessionToken(t)?.id
        }

        if (userId == null) {
            response.status = 401
            return false
        }

        request.setAttribute("userId", userId)
        return true
    }

    fun evictToken(sessionToken: String) {
        tokenCache.invalidate(sessionToken)
    }
}
```

**설계 포인트:**
- Spring Security 미사용 → 인터셉터 기반 경량 인증
- `/api/auth/*`, `/api/guest/*` 경로는 인증 스킵
- Caffeine 캐시로 매 요청마다 DB 조회하지 않음

### 3.5 WebConfig (CORS + 인터셉터 등록)

```kotlin
@Configuration
class WebConfig(
    private val authInterceptor: AuthInterceptor,
) : WebMvcConfigurer {

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(authInterceptor)
            .addPathPatterns("/api/**")
    }

    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/**")
            .allowedOriginPatterns("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
    }
}
```

### 3.6 AuthService (토스 + 로컬 로그인 통합)

```kotlin
@Service
class AuthService(
    private val userRepository: UserRepository,
    private val userProfileRepository: UserProfileRepository,
    oauthClients: List<OAuthClient>,
) {
    // OAuthClient 구현체를 provider별로 매핑
    private val oauthClientMap: Map<AuthProvider, OAuthClient> =
        oauthClients.associateBy { it.provider }

    data class LoginResult(val token: String, val isNewUser: Boolean)

    // --- OAuth 로그인 (토스 등) ---
    fun oauthLogin(providerName: String, code: String, referrer: String? = null): LoginResult {
        val provider = AuthProvider.valueOf(providerName.uppercase())
        val client = oauthClientMap[provider]
            ?: throw RuntimeException("지원하지 않는 로그인 방식입니다: $providerName")

        val accessToken = client.exchangeCode(code, referrer)
        val providerUserId = client.getUserId(accessToken)

        return loginOrCreateOAuthUser(provider, providerUserId)
    }

    // --- 로컬 회원가입 ---
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

    // --- 로컬 로그인 ---
    fun login(email: String, password: String): LoginResult {
        val user = userRepository.findByEmail(email)
            ?: throw RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.")
        if (user.password == null || !BCrypt.checkpw(password, user.password)) {
            throw RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.")
        }
        val isNewUser = userProfileRepository.findByUserId(user.id) == null
        return issueToken(user, isNewUser)
    }

    // --- 토스 연동해제 콜백 ---
    fun disconnectTossUser(userKey: String) {
        val user = userRepository.findByProviderAndProviderUserId(AuthProvider.TOSS, userKey)
            ?: return
        user.sessionToken = null
        userRepository.save(user)
    }

    // --- 내부 메서드 ---
    private fun loginOrCreateOAuthUser(provider: AuthProvider, providerUserId: String): LoginResult {
        val existing = userRepository.findByProviderAndProviderUserId(provider, providerUserId)
        if (existing != null) {
            val isNewUser = userProfileRepository.findByUserId(existing.id) == null
            return issueToken(existing, isNewUser)
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
```

### 3.7 OAuthClient 인터페이스 + 토스 구현

```kotlin
// --- 인터페이스 ---
interface OAuthClient {
    val provider: AuthProvider
    fun exchangeCode(code: String, referrer: String? = null): String   // code → accessToken
    fun getUserId(accessToken: String): String                         // accessToken → providerUserId
}

// --- 토스 OAuth (mTLS) ---
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

    // mTLS RestTemplate 생성 (클라이언트 인증서 기반)
    private fun createMtlsRestTemplate(): RestTemplate {
        val certPem = if (mtlsCert.isNotBlank()) mtlsCert
                      else loadClasspathResource("my-app_public.crt")
        val keyPem = if (mtlsKey.isNotBlank()) mtlsKey
                     else loadClasspathResource("my-app_private.key")

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
}
```

**mTLS 핵심:**
- 토스 API는 **mTLS (Mutual TLS)** 필수 → 클라이언트 인증서로 서버에 신원 증명
- 인증서/키는 환경변수 우선, fallback으로 classpath 리소스
- 앱인토스 콘솔에서 발급받은 인증서 사용

### 3.8 토스 연동해제 콜백

```kotlin
// AuthController 내부
@PostMapping("/toss/disconnect")
fun disconnectToss(
    @RequestBody request: TossDisconnectRequest,
    httpRequest: HttpServletRequest,
): ResponseEntity<Void> {
    // Basic Auth 검증
    val authHeader = httpRequest.getHeader("Authorization") ?: ""
    val expected = "Basic ${Base64.getEncoder().encodeToString(basicAuth.toByteArray())}"
    if (authHeader != expected) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
    }
    authService.disconnectTossUser(request.userKey)
    return ResponseEntity.ok().build()
}

data class TossDisconnectRequest(
    val userKey: String,
    val referrer: String?,  // UNLINK | WITHDRAWAL_TERMS | WITHDRAWAL_TOSS
)
```

### 3.9 게스트 API 패턴

```kotlin
// 인증 불필요 - /api/guest/* 경로는 AuthInterceptor에서 스킵
@RestController
@RequestMapping("/api/guest")
class GuestController(private val myService: MyService) {

    @PostMapping("/data")
    fun getGuestData(@RequestBody request: GuestRequest): ResponseEntity<MyResponse> {
        // 요청 본문에 필요한 모든 데이터를 포함 (DB 의존 없음)
        val result = myService.calculateForGuest(request.toProfileData())
        return ResponseEntity.ok(result)
    }
}
```

**게스트 모드 설계:**
- 로그인 없이 서비스 체험 가능
- 프로필 데이터를 클라이언트(localStorage)에 저장
- 매 API 호출 시 요청 본문에 프로필 데이터 포함
- DB 저장 없음 → 서버 부하 최소

### 3.10 Dockerfile

```dockerfile
FROM gradle:8.5-jdk21 AS build
WORKDIR /app
COPY . .
RUN gradle bootJar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/app.jar app.jar
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
```

### 3.11 GlobalExceptionHandler

```kotlin
@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException::class)
    fun handleRuntime(e: RuntimeException): ResponseEntity<ErrorResponse> {
        val status = when {
            e.message?.contains("not found", true) == true -> HttpStatus.NOT_FOUND
            e.message?.contains("already exists", true) == true -> HttpStatus.CONFLICT
            else -> HttpStatus.BAD_REQUEST
        }
        return ResponseEntity.status(status).body(ErrorResponse(status.reasonPhrase, e.message))
    }

    @ExceptionHandler(Exception::class)
    fun handleGeneral(e: Exception): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse("Internal Server Error", "서버 오류가 발생했습니다."))
    }
}

data class ErrorResponse(val error: String, val message: String?)
```

---

## 4. Frontend 스켈레톤

### 4.1 package.json (핵심 의존성)

```json
{
  "dependencies": {
    "@apps-in-toss/web-framework": "^1.14.0",
    "@emotion/react": "^11.14.0",
    "@toss/tds-mobile": "^2.2.1",
    "@toss/tds-mobile-ait": "^2.2.1",
    "axios": "^1.13.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.13.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.21",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react": "^4.4.1",
    "typescript": "~5.8.3",
    "vite": "^7.3.1"
  }
}
```

### 4.2 granite.config.ts

```typescript
export default {
  appName: 'my-app',                   // 앱인토스 등록 이름
  brand: {
    displayName: '내 서비스',
    primaryColor: '#3182F6',            // 토스 블루 (변경 가능)
    icon: 'https://static.toss.im/...', // 앱 아이콘 URL
    bridgeColorMode: 'basic',
  },
  web: {
    host: '172.30.1.50',                // 로컬 IP (샌드박스 테스트용)
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
};
```

### 4.3 vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',  // Emotion CSS prop 지원
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // 백엔드 프록시
        changeOrigin: true,
      },
    },
  },
});
```

### 4.4 App.tsx (라우팅)

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataCacheProvider } from './contexts/DataCacheContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataCacheProvider>
          <Routes>
            {/* 인증 불필요 */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/toss/callback" element={<OAuthCallback />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* 인증 필요 */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </DataCacheProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### 4.5 AuthContext.tsx (인증 상태 관리)

```tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface GuestProfile {
  // 서비스별 게스트 프로필 데이터 정의
  [key: string]: any;
}

interface AuthContextType {
  token: string | null;
  isNewUser: boolean;
  isGuest: boolean;
  guestProfile: GuestProfile | null;
  login: (token: string, isNewUser: boolean) => void;
  loginAsGuest: () => void;
  logout: () => void;
  setGuestProfile: (profile: GuestProfile) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );
  const [isNewUser, setIsNewUser] = useState<boolean>(
    () => localStorage.getItem('isNewUser') === 'true'
  );
  const [isGuest, setIsGuest] = useState<boolean>(
    () => localStorage.getItem('isGuest') === 'true'
  );
  const [guestProfile, setGuestProfileState] = useState<GuestProfile | null>(
    () => {
      const saved = localStorage.getItem('guestProfile');
      return saved ? JSON.parse(saved) : null;
    }
  );

  // 토스 로그인 성공 시
  const login = useCallback((token: string, isNewUser: boolean) => {
    localStorage.setItem('token', token);
    localStorage.setItem('isNewUser', String(isNewUser));
    localStorage.removeItem('isGuest');
    localStorage.removeItem('guestProfile');
    setToken(token);
    setIsNewUser(isNewUser);
    setIsGuest(false);
    setGuestProfileState(null);
  }, []);

  // 게스트 모드 진입
  const loginAsGuest = useCallback(() => {
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem('token');
    localStorage.removeItem('isNewUser');
    setToken(null);
    setIsNewUser(false);
    setIsGuest(true);
  }, []);

  // 로그아웃 (토스 + 게스트 모두)
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('isNewUser');
    localStorage.removeItem('isGuest');
    localStorage.removeItem('guestProfile');
    setToken(null);
    setIsNewUser(false);
    setIsGuest(false);
    setGuestProfileState(null);
  }, []);

  // 게스트 프로필 저장
  const setGuestProfile = useCallback((profile: GuestProfile) => {
    localStorage.setItem('guestProfile', JSON.stringify(profile));
    setGuestProfileState(profile);
  }, []);

  return (
    <AuthContext.Provider value={{
      token, isNewUser, isGuest, guestProfile,
      login, loginAsGuest, logout, setGuestProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
```

### 4.6 ProtectedRoute.tsx

```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { token, isGuest, guestProfile, isNewUser } = useAuth();

  // 미인증 + 비게스트 → 온보딩
  if (!token && !isGuest) return <Navigate to="/onboarding" replace />;

  // 게스트인데 프로필 미설정 → 온보딩
  if (isGuest && !guestProfile) return <Navigate to="/onboarding" replace />;

  // 토스 로그인했지만 신규 사용자 → 온보딩
  if (token && isNewUser) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}
```

### 4.7 Axios 클라이언트 (client.ts)

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// 요청: 토큰 자동 주입
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답: 401 → 로그아웃 + 리다이렉트
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isNewUser');
      localStorage.removeItem('isGuest');
      localStorage.removeItem('guestProfile');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default client;
```

### 4.8 Login.tsx (토스 로그인)

```tsx
import { css } from '@emotion/react';
import { Button } from '@toss/tds-mobile';
import { appLogin } from '@apps-in-toss/web-framework';
import { oauthLogin } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTossLogin = async () => {
    try {
      // 1. 토스 앱에서 인가 코드 받기
      const { authorizationCode, referrer } = await appLogin();

      // 2. 백엔드에 인가 코드 전송 → 토큰 발급
      const { token, isNewUser } = await oauthLogin('toss', authorizationCode, referrer);

      // 3. 상태 저장
      login(token, isNewUser);

      // 4. 라우팅
      navigate(isNewUser ? '/onboarding' : '/home', { replace: true });
    } catch (error) {
      console.error('토스 로그인 실패:', error);
    }
  };

  return (
    <div css={containerStyle}>
      <h1>내 서비스</h1>
      <p>서비스 설명</p>
      <Button.Primary size="large" onClick={handleTossLogin}>
        토스로 시작하기
      </Button.Primary>
    </div>
  );
}

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 20px;
`;
```

### 4.9 API 호출 - 게스트/로그인 분기 패턴

```typescript
import client from './client';

// 게스트: POST (본문에 프로필 전송) / 로그인: GET (서버에서 프로필 조회)
export async function getData() {
  const isGuest = localStorage.getItem('isGuest') === 'true';

  if (isGuest) {
    const profile = JSON.parse(localStorage.getItem('guestProfile') || '{}');
    const { data } = await client.post('/api/guest/data', profile);
    return data;
  }

  const { data } = await client.get('/api/data');
  return data;
}
```

### 4.10 디자인 토큰 (tokens.ts)

```typescript
// 색상 (TDS adaptive 색상과 혼용 가능)
export const color = {
  bgPage: '#F4F5F7',
  bgCard: '#FFFFFF',
  primary: '#3182F6',
  primaryLight: '#E8F3FF',
  danger: '#FF5B5B',
  success: '#00C48C',
  border: '#E5E8EB',
  text: '#191F28',
  textSecondary: '#8B95A1',
};

// 간격
export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24,
};

// 반경
export const radius = {
  small: 6, medium: 8, large: 12, card: 20,
};

// 레이아웃
export const layout = {
  pagePaddingH: 20,
  navHeight: 60,
  minTouchTarget: 48,
};
```

### 4.11 앱인토스 Hooks

```typescript
// useBackEvent.ts - 뒤로가기 핸들링
import { useEffect } from 'react';
import { onBackEvent } from '@apps-in-toss/web-framework';

export function useBackEvent(handler: () => void) {
  useEffect(() => {
    const unsubscribe = onBackEvent(handler);
    return () => unsubscribe();
  }, [handler]);
}

// useExitConfirm.tsx - 앱 종료 확인
import { exitApp } from '@apps-in-toss/web-framework';
import { ConfirmDialog } from '@toss/tds-mobile';

export function useExitConfirm() {
  const [open, setOpen] = useState(false);

  useBackEvent(() => setOpen(true));

  const dialog = open ? (
    <ConfirmDialog title="앱을 종료할까요?">
      <ConfirmDialog.CancelButton onClick={() => setOpen(false)}>취소</ConfirmDialog.CancelButton>
      <ConfirmDialog.ConfirmButton onClick={() => exitApp()}>종료</ConfirmDialog.ConfirmButton>
    </ConfirmDialog>
  ) : null;

  return { exitDialog: dialog };
}
```

### 4.12 환경변수

```bash
# .env.local (개발)
VITE_API_URL=                           # 빈값 → vite proxy 사용

# .env.production (프로덕션)
VITE_API_URL=https://my-app.up.railway.app
VITE_AD_BANNER_ID=ait.v2.live.xxxxx
VITE_AD_INTERSTITIAL_ID=ait.v2.live.xxxxx
```

---

## 5. 인증 플로우 상세

### 5.1 토스 로그인 플로우

```
[사용자] → 토스로 시작하기 버튼 클릭
    │
    ▼
[프론트] appLogin() 호출
    │   → 토스 앱에서 약관 동의 + 인증
    │   ← authorizationCode + referrer 반환
    ▼
[프론트] POST /api/auth/oauth { provider:"toss", code, referrer }
    │
    ▼
[백엔드] TossOAuthClient.exchangeCode(code, referrer)
    │   → mTLS로 토스 API 호출
    │   ← accessToken 반환
    ▼
[백엔드] TossOAuthClient.getUserId(accessToken)
    │   → mTLS로 토스 API 호출
    │   ← userKey 반환
    ▼
[백엔드] User 조회/생성 → UUID sessionToken 발급
    │   ← { token, isNewUser }
    ▼
[프론트] localStorage에 token 저장
    │   isNewUser → /onboarding
    │   기존 유저 → /home
    ▼
[이후 API] Authorization: Bearer <token>
    │
    ▼
[백엔드] AuthInterceptor → Caffeine 캐시 → userId 주입
```

### 5.2 게스트 모드 플로우

```
[사용자] → "로그인 없이 시작" 버튼 클릭
    │
    ▼
[프론트] loginAsGuest() → isGuest=true (localStorage)
    │   → /onboarding (위자드)
    ▼
[프론트] 위자드 완료 → guestProfile을 localStorage에 저장
    │   → /home 이동
    ▼
[이후 API] POST /api/guest/* (요청 본문에 guestProfile 포함)
    │   → 인증 헤더 없음
    ▼
[백엔드] /api/guest/* → AuthInterceptor 스킵
    │   → 요청 데이터로 계산, DB 저장 없음
    │   ← 결과 반환
```

### 5.3 토스 연동해제 콜백

```
[사용자] → 토스 앱 설정에서 연결 끊기
    │
    ▼
[토스 서버] POST /api/auth/toss/disconnect
    │   Headers: Authorization: Basic <base64>
    │   Body: { userKey, referrer }
    ▼
[백엔드] Basic Auth 검증 → User.sessionToken = null
    │   → 다음 API 호출 시 401 → 프론트 자동 로그아웃
```

---

## 6. 알림 (Push Notification)

### 6.1 구조

```
NotificationScheduler (@Scheduled, 매 시간 정각)
    │
    ├─ 현재 시각(KST)에 해당하는 notificationHour 유저 조회
    │   (페이지네이션 500건 단위)
    │
    ├─ Toss OAuth 유저만 필터 (providerUserId 필수)
    │
    └─ TossMessageService.sendMessage(userKey)
        │
        └─ mTLS로 토스 메시징 API 호출
           POST https://apps-in-toss-api.toss.im/.../send-message
           Headers: X-Toss-User-Key: {userKey}
           Body: { templateSetCode, context }
```

### 6.2 프론트 알림 설정 UI

```
Profile 페이지:
  ├─ 데일리 알림 토글 (on/off)
  └─ 알림 시간 선택 (BottomSheet.Select, 4시~23시)
      └─ PUT /api/users/notification { enabled, hour }
```

---

## 7. 배포 환경

### 7.1 Railway (추천)

```
Backend:  Docker 이미지 빌드 → Railway 자동 배포
Frontend: granite build → Railway static 배포 또는 별도 CDN
DB:       Railway MySQL 플러그인
```

### 7.2 필수 환경변수 체크리스트

```bash
# === Database ===
SPRING_DATASOURCE_URL=jdbc:mysql://host:3306/mydb?useSSL=false
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=

# === Server ===
PORT=8080

# === Toss OAuth (mTLS) ===
TOSS_OAUTH_ENABLED=true
TOSS_MTLS_CERT="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
TOSS_MTLS_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
TOSS_DISCONNECT_BASIC_AUTH=username:password

# === Toss Messaging ===
TOSS_MESSAGE_TEMPLATE_CODE=daily_schedule_reminder

# === Frontend (.env.production) ===
VITE_API_URL=https://my-app-backend.up.railway.app
VITE_AD_BANNER_ID=ait.v2.live.xxxxx       # (선택)
VITE_AD_INTERSTITIAL_ID=ait.v2.live.xxxxx  # (선택)
```

---

## 8. 새 프로젝트 시작 체크리스트

### Backend
- [ ] Spring Initializr로 프로젝트 생성 (Web, JPA, Validation)
- [ ] build.gradle.kts에 BCrypt, Caffeine, MySQL 의존성 추가
- [ ] User Entity + AuthProvider enum 생성
- [ ] AuthInterceptor + WebConfig 설정
- [ ] OAuthClient 인터페이스 + TossOAuthClient 구현
- [ ] AuthService + AuthController 구현
- [ ] GuestController 패턴 구현 (필요 시)
- [ ] 토스 연동해제 콜백 엔드포인트 구현
- [ ] GlobalExceptionHandler 추가
- [ ] application.yml 환경변수 참조 설정
- [ ] Dockerfile 작성
- [ ] 토스 mTLS 인증서 배치 (classpath 또는 환경변수)

### Frontend
- [ ] `npm create vite@latest` → React + TypeScript
- [ ] TDS, Emotion, 앱인토스 SDK 의존성 설치
- [ ] granite.config.ts 작성
- [ ] vite.config.ts (Emotion JSX + API 프록시)
- [ ] AuthContext + DataCacheContext 생성
- [ ] Axios 클라이언트 + 인터셉터 설정
- [ ] Login + OAuthCallback 페이지 구현
- [ ] ProtectedRoute 컴포넌트 구현
- [ ] Onboarding 위자드 구현
- [ ] BottomNav + MainLayout 구현
- [ ] 디자인 토큰 정의
- [ ] 환경변수 파일 (.env.local, .env.production)
- [ ] .gitignore에 .env.local 추가

### 앱인토스 콘솔
- [ ] 미니앱 등록
- [ ] 토스 로그인 약관 동의
- [ ] 동의 항목 설정 (scope)
- [ ] 연결 끊기 콜백 URL 등록
- [ ] mTLS 인증서 발급
- [ ] 복호화 키 수신 (개인정보 사용 시)
- [ ] 광고 ID 발급 (배너/전면, 선택)
- [ ] 메시지 템플릿 등록 (알림 사용 시)

---

## 9. 설계 결정 근거

| 결정 | 이유 |
|------|------|
| JWT 대신 UUID SessionToken | 즉시 무효화 가능, 구현 간단, 앱인토스 규모에 충분 |
| Spring Security 미사용 | 단순 토큰 인증에 과한 설정, 인터셉터로 충분 |
| Caffeine 캐시 | 라이브러리 하나로 토큰/데이터 캐싱, Redis 불필요 |
| Context API (Redux X) | 소규모 앱에 충분, 보일러플레이트 최소화 |
| Emotion (Tailwind X) | TDS와 자연스러운 통합, 동적 스타일링 용이 |
| 게스트 모드 | 로그인 허들 낮춤, DB 부하 없음, 전환율 개선 |
| @ConditionalOnProperty | OAuth 제공자 on/off 토글, 환경별 유연한 설정 |
| mTLS | 토스 API 필수 요건, 서버 간 양방향 인증 |
