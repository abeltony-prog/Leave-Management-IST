import axiosInstance from '@/lib/axios';

// Calls the backend to generate and return a TOTP QR code URL
export const setupTwoFactor = async (): Promise<string> => {
  const response = await axiosInstance.get<{ qrCodeUrl: string }>('/auth/2fa/setup');
  return response.data.qrCodeUrl;
};

// Confirms scanned QR code by verifying the first OTP, enabling 2FA for the user
export const confirmTwoFactorSetup = async (email: string, code: number): Promise<void> => {
  const response = await axiosInstance.post<{ token: string; twoFactorRequired: boolean }>('/auth/2fa/authenticate', { email, code });
  const { token } = response.data;
  // Update auth token since server returns a fresh JWT
  localStorage.setItem('token', token);
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}; 