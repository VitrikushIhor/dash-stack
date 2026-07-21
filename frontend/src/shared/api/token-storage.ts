export const tokenStorage = {
  setTokens: async (
    accessToken: string,
    refreshToken: string
  ): Promise<void> => {
    await fetch('/api/auth/set-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, refreshToken }),
    })
  },
  clearTokens: async (): Promise<void> => {
    await fetch('/api/auth/clear-tokens', {
      method: 'POST',
    })
  },
}
