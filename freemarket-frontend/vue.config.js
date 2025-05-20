module.exports = {
  devServer: {
    port: 8081,
    https: false,
    host: 'localhost', // 고정 호스트 이름 사용 (IP 주소 대신)
    allowedHosts: 'all', // 모든 호스트 허용
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws', // 자동 웹소켓 URL 구성
      progress: true,
    },
    proxy: {
      '/api': {
        // 개발 환경에서는 로컬 서버, 그렇지 않으면 실제 서버 주소 사용
        target: 'https://freemarket.duckdns.org', // 실제 백엔드 서버 주소로 변경
        changeOrigin: true,
        secure: true,  // HTTPS 사용 시 true로 설정
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
          
          // 개발 환경에서 오류 발생 시 안내 메시지 출력 및 응답 보내기
          res.writeHead(500, {
            'Content-Type': 'application/json'
          });
          
          const errorMessage = {
            success: false,
            status: 500,
            message: '프록시 서버 오류: 백엔드 서버에 연결할 수 없습니다.',
            data: null,
            error: err.message || '알 수 없는 오류'
          };
          
          res.end(JSON.stringify(errorMessage));
        }
      },
      // OAuth2 인증 관련 프록시 설정
      '/oauth2': {
        target: 'https://freemarket.duckdns.org',
        changeOrigin: true,
        secure: true,  // HTTPS 사용 시 true로 설정
        logLevel: 'debug',
        onProxyReq(proxyReq) {
          console.log('OAuth2 프록시 요청:', proxyReq.path);
        }
      },
      // 로그인 관련 프록시 설정
      '/login': {
        target: 'https://freemarket.duckdns.org',
        changeOrigin: true,
        secure: true,  // HTTPS 사용 시 true로 설정
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
        secure: true,  // HTTPS 사용 시 true로 설정
        pathRewrite: {
          '^/favicon.ico': '/favicon.ico'
        },
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
