import api, { extractResponseData, extractErrorMessage } from './api';
import { API_ENDPOINTS } from '@/config';

class AuthService {
  // 로그인
  async login(credentials) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // 회원가입
  async signup(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // 토큰 갱신
  async refreshToken(refreshToken) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken
      });
      return extractResponseData(response);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // 로그아웃
  async logout() {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // 비밀번호 재설정 요청
  async requestPasswordReset(email) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST, {
        email
      });
      return extractResponseData(response);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // 비밀번호 재설정 확인
  async verifyPasswordReset(token, newPassword) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.PASSWORD_RESET_VERIFY, {
        token,
        newPassword
      });
      return extractResponseData(response);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // 이메일 인증 요청
  async sendEmailVerification(email) {
    try {
      const response = await api.post(API_ENDPOINTS.EMAIL_VERIFICATION.SEND, {
        email
      });
      return extractResponseData(response);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // 이메일 인증 확인
  async verifyEmail(email, verificationCode) {
    try {
      const response = await api.post(API_ENDPOINTS.EMAIL_VERIFICATION.VERIFY, {
        email,
        verificationCode
      });
      return extractResponseData(response);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }

  // 소셜 로그인 URL 생성
  getSocialLoginUrl(provider) {
    const baseUrl = 'https://freemarket.duckdns.org';
    
    return `${baseUrl}/oauth2/authorization/${provider}`;
  }

  // OAuth 콜백 처리
  handleOAuthCallback(searchParams) {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    
    if (accessToken && refreshToken) {
      return {
        accessToken: decodeURIComponent(accessToken),
        refreshToken: decodeURIComponent(refreshToken),
        tokenType: 'Bearer',
        expi