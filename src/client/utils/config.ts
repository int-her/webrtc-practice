export const config = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
    {
      urls: 'your turn server',
      credential: 'credential',
      username: 'username',
    },
  ],
  iceTransportPolicy: 'relay' as const,
}
