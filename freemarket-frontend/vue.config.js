module.exports = {
  devServer: {
    port: 8081,
    https: false,
    proxy: {
      '/api': {
        target: 'https://freemarket.duckdns.org', // API 서버 주소
        changeOrigin: true,
        secure: false,  // SSL 인증서 검증 비활성화 - 개발 환경에서만 false로 설정
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
        },
        onError(err, req, res) {
          // 프록시 오류 발생 시 처리
          console.error('프록시 오류:', err);
          
          // 로컬 개발 환경에서 오류 발생 시:
          // 1. 백엔드 서버가 실행 중인지 확인
          // 2. 인증서 오류인 경우 secure: false 설정
          // 3. API 서버 주소가 올바른지 확인
        }
      },
      // OAuth2 인증 관련 프록시 설정
      '/oauth2': {
        target: 'https://freemarket.duckdns.org',
        changeOrigin: true,
        secure: false,  // SSL 인증서 검증 비활성화
        logLevel: 'debug',
        onProxyReq(proxyReq) {
          console.log('OAuth2 프록시 요청:', proxyReq.path);
        }
      },
      // 로그인 관련 프록시 설정
      '/login': {
        target: 'https://freemarket.duckdns.org',
        changeOrigin: true,
        secure: false,  // SSL 인증서 검증 비활성화
        logLevel: 'debug',
        onProxyReq(proxyReq) {
          console.log('Login 프록시 요청:', proxyReq.path);
        },
        onProxyRes(proxyRes) {
          proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
          proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
          proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
        }
      },
      // favicon.ico에 대한 프록시 추가
      '/favicon.ico': {
        target: 'https://freemarket.duckdns.org',
        changeOrigin: true,
        secure: false,  // SSL 인증서 검증 비활성화
        pathRewrite: {
          '^/favicon.ico': '/favicon.ico'
        },
        logLevel: 'debug'
      }
    },
    // 리디렉션에 대한 히스토리 설정
    historyApiFallback: true
  }
}
