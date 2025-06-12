module.exports = {
  devServer: {
    port: 8081,
    https: false, // HTTPS 비활성화
    host: 'localhost', // 고정 호스트 이름 사용 (IP 주소 대신)
    allowedHosts: 'all', // 모든 호스트 허용
    // 개발 서버 WebSocket 완전 비활성화
    client: {
      webSocketURL: 'auto'
    },
    webSocketServer: false, // 개발 서버 WebSocket 비활성화
    proxy: {
      '/api': {
        target: 'https://freemarket.duckdns.org', // HTTPS 사용
        changeOrigin: true,
        secure: false,  // SSL 인증서 검증 비활성화
        logLevel: 'debug',
        onProxyReq(proxyReq) {
          console.log('API 프록시 요청:', proxyReq.path);
        },
        onProxyRes(proxyRes) {
          // CORS 헤더 설정
          proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
          proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
          proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
          console.log('API 프록시 응답:', proxyRes.statusCode);
        }
      },
      // 채팅 WebSocket 프록시 설정만 유지
      '/ws/chat': {
        target: 'https://freemarket.duckdns.org',
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket 프록시 활성화
        logLevel: 'debug'
      },
      // OAuth2 인증 관련 프록시 설정
      '/oauth2': {
        target: 'https://freemarket.duckdns.org',
        changeOrigin: true,
        secure: false,  // SSL 인증서 검증 비활성화
        logLevel: 'debug'
      },
      // 로그인 관련 프록시 설정
      '/login': {
        target: 'https://freemarket.duckdns.org',
        changeOrigin: true,
        secure: false,  // SSL 인증서 검증 비활성화
        logLevel: 'debug'
      }
    },
    // 리디렉션에 대한 히스토리 설정
    historyApiFallback: true
  },
  // 배포 시 경로 설정
  publicPath: process.env.NODE_ENV === 'production'
    ? '/' // 루트 경로로 설정
    : '/' // 개발 환경에서도 루트 경로 사용
}
