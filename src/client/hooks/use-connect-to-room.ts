import React from 'react'

import { SignalingMessage } from '../../types'

const userId = Math.random().toString(36)

function getWSProtocol() {
  return window.location.protocol === 'https:' ? 'wss:' : 'ws:'
}

export function useConnectToRoom(
  roomId: string,
  signalingMsgHandler: (
    sendMessage: (msg: SignalingMessage, to?: string) => void,
    msg: SignalingMessage,
    from: string,
  ) => void,
  onOpenSendMessage?: SignalingMessage,
): {
  sendMessage(msg: SignalingMessage, to?: string): void
} {
  const ws = React.useRef<WebSocket>()

  const sendMessage = React.useCallback(
    (msg: SignalingMessage, to?: string) => {
      const data = { msg: Object.assign(msg, { to }), userId }
      ws.current?.send(JSON.stringify(data))
    },
    [],
  )

  React.useEffect(() => {
    if (!roomId || !sendMessage || !signalingMsgHandler) {
      return undefined
    }

    if (!ws.current) {
      console.log(window.location.protocol)
      ws.current = new WebSocket(
        `${getWSProtocol()}//${window.location.host}/room/${roomId}`,
      )

      ws.current.addEventListener(
        'open',
        () => {
          const loginData = {
            msg: {
              type: 'login',
              payload: {
                userId,
              },
            },
          }
          ws.current?.send(JSON.stringify(loginData))
          console.log('login completed.')
          if (onOpenSendMessage) {
            ws.current?.send(JSON.stringify({ msg: onOpenSendMessage, userId }))
          }
        },
        { once: true },
      )
    }

    function handler(m: MessageEvent<string>) {
      const { msg, userId: from } = JSON.parse(m.data)
      console.log('received message:', msg, '/ from:', from)
      signalingMsgHandler(sendMessage, msg, from)
    }
    ws.current.addEventListener('message', handler)

    return () => {
      if (ws.current) {
        ws.current.removeEventListener('message', handler)
      }
    }
  }, [onOpenSendMessage, roomId, sendMessage, signalingMsgHandler])

  return {
    sendMessage,
  }
}
