# FreeMarket - 교내 중고거래 플랫폼
- FreeMarket은 대학교 내에서 학생들이 안전하고 편리하게 중고물품을 거래할 수 있는 웹 플랫폼입니다. 학교 이메일 인증을 통해 신뢰성을 확보하고, 실시간 채팅과 리뷰 시스템을 통해 안전한 거래 환경을 제공합니다.

## 주요 기능
### 사용자 관리
- 회원가입/로그인: 일반 회원가입 및 소셜 로그인(`Google`, `Kakao`, `Naver`) 지원
- 학교 이메일 인증: `@office.skhu.ac.kr` 도메인 인증을 통한 신원 확인
- 사용자 프로필: 프로필 조회/수정, 비밀번호 변경
- 비밀번호 재설정: 이메일을 통한 비밀번호 재설정 기능

### 상품 관리
- 상품 CRUD: 등록, 조회, 수정, 삭제 기능
- 다중 이미지: 최대 여러 장의 이미지 업로드 및 썸네일 자동 생성
- 카테고리 분류: 교재/서적, 전자기기, 의류/패션, 화장품/미용, 스포츠/레저, 생활용품, 취미/게임, 기타
- 상품 검색: 키워드, 카테고리, 가격 범위, 상태별 필터링
- 정렬 기능: 최신순, 가격순, 조회수순, 관심수순
- 조회수 관리: 상품별 조회수 자동 증가

### 관심상품 시스템
- 찜하기: 관심 상품 등록/취소
- 관심상품 목록: 사용자별 관심 등록한 상품 목록 조회
- 관심수 통계: 상품별 관심 등록 수 표시

### 실시간 채팅
- 채팅방 생성: 상품별 판매자-구매자 간 1:1 채팅방
- 실시간 메시지: `WebSocket`을 통한 실시간 메시지 전송
- 메시지 타입: 텍스트, 이미지, 시스템 메시지 지원
- 읽음 상태: 메시지 읽음 처리 및 미읽은 메시지 수 조회
- 채팅방 관리: 활성화/비활성화 상태 관리

### 거래 시스템
- 판매완료 처리: 채팅방에서 구매자 선정 후 거래 완료
- 판매완료 취소: 리뷰 작성 전 거래 취소 가능
- 거래 내역: 판매/구매 내역 조회
- 상품 상태 관리: 판매중, 품절, 판매중단

### 리뷰 시스템
- 리뷰 작성: 거래 완료 후 구매자가 판매자에게 1~5점 별점 및 리뷰 작성
- 리뷰 관리: 자신이 작성한 리뷰 수정/삭제
- 리뷰 통계: 사용자별 평균 평점, 별점 분포, 총 리뷰 수
- 리뷰 조회: 판매자가 받은 리뷰 목록 조회

## 기술 스택
### 백엔드
- 언어: Java 21
- 프레임워크: Spring Boot 3.4.4
- 보안: Spring Security 6.x, JWT, OAuth2.0
- 데이터베이스:
  - MySQL 8.x (프로덕션)
  - H2 Database (개발/테스트)
- ORM: Spring Data JPA, QueryDSL 5.0
- 빌드 도구: Gradle 8.13
- 실시간 통신: WebSocket, STOMP

### 프론트엔드

## 주요 라이브러리
- 인증/보안: JJWT 0.12.6, Spring Security OAuth2
- API 문서: SpringDoc OpenAPI 2.8.3 (Swagger)
- 이미지 처리: Thumbnailator 0.4.20
- 이메일: Spring Boot Mail
- 검증: Spring Boot Validation
- 테스트: Spring Boot Test, JUnit 5

## 프로젝트 구조
<img width="885" alt="image" src="https://github.com/user-attachments/assets/e4cc6bfc-0415-4ba6-900e-34f74d216235" />



## 개발 환경 설정
### 프로젝트 클론
- `bashgit clone https://github.com/your-username/FreeMarket.git`
- `cd FreeMarket`

### 개발용 환경 변수 설정 (`application-secret.yml` 파일 생성)
`yaml# src/main/resources/application-secret.yml`
```java
# JWT 설정
jwt:
  secret: your-jwt-secret-key-must-be-at-least-256-bits

# 데이터베이스 설정 (프로덕션)
mysql:
  host: localhost
  port: 3306
  database: freemarket
  username: your-username
  password: your-password

# OAuth2 설정
oauth2:
  google:
    client-id: your-google-client-id
    secret: your-google-client-secret
  kakao:
    client-id: your-kakao-client-id
    secret: your-kakao-client-secret
  naver:
    client-id: your-naver-client-id
    secret: your-naver-client-secret

# 이메일 설정
mail:
  username: your-email@gmail.com
  password: your-app-password

# 파일 저장 경로
file:
  upload-dir: /path/to/images
  thumbnail-dir: /path/to/thumbnails
```

## API 문서
- Swagger UI를 통해 API 문서를 확인할 수 있습니다:
- `http://{baseurl}/swagger-ui/index.html`

## 주요 설정
### JWT 토큰 설정
- 액세스 토큰: 30분 (1800초)
- 리프레시 토큰: 7일 (604800초)

### 파일 업로드 설정
- 최대 파일 크기: 5MB
- 최대 요청 크기: 50MB
- 썸네일 크기: 200px 너비 (비율 유지)

## 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.




