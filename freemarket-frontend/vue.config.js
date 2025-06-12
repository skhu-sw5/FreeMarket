module.exports = {
  devServer: {
    port: 8081,
    https: false,
    host: 'localhost',
    allowedHosts: 'all',
    client: {
      webSocketURL: 'ws://localhost:8081/ws'
    },
    proxy: {
      '/api': {
        target: 'https://freemarket.duckdns.org',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        onProxyReq(proxyReq) {
          console.log('API 프록시 요청:', proxyReq.path);
        },
        onProxyRes(proxyRes) {
          proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
          proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
          proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
          console.log('API 프록시 응답:', proxyRes.statusCode);
        }
      },
      '/ws/chat': {
        target: 'https://freemarket.duckdns.org',
        changeOrigin: true,
        secure: false,
        ws: true,
        logLevel: 'debug'
      },
      '/oauth2': {
        target: 'https://freemarket.duckdns.org',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      '/login': {
        target: 'https://freemarket.duckdns.org',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      }
    },
    historyApiFallback: true
  },
  publicPath: process.env.NODE_ENV === 'production'
    ? '/'
    : '/'
}
