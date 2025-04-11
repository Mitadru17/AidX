import { auth } from '@clerk/nextjs';

export const getCurrentUser = () => {
  const { userId, sessionId, getToken } = auth();
  return { userId, sessionId, getToken };
};

export const isAuthenticated = () => {
  const { userId } = auth();
  return !!userId;
}; 