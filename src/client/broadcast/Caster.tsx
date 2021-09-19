import * as React from 'react'

import { MessageType, SignalingMessage } from '../../types'
import { useConnectToRoom } from '../hooks/use-connect-to-room'
import { config } from '../utils/config'
import { getMediaStream } from '../utils/get-media-stream'

export const BROADCAST_ROOM_ID = '2'

export const Caster: React.FC = () => {
  const [peerConnections] = React.useState(new Map<string, RTCPeerConnection>())
  const mediaStream = React.useRef<MediaStream>()

  const localVideo = React.useRef<HTMLVideoElement>(null)

  const signalingMsgHandler = React.useCallback(
    async (
      _sendMessage: (msg: SignalingMessage, to?: string) => void,
      msg: SignalingMessage,
      from: string,
    ) => {
      if (msg.type === MessageType.WATCH) {
        const peerConnection = new RTCPeerConnection(config)
        peerConnections.set(from, peerConnection)

        peerConnection.addEventListener('icecandidate', (e) => {
          console.log(e)
          const { candidate } = e
          if (candidate) {
            _sendMessage(
              {
                type: MessageType.ICECANDIDATE,
                payload: { candidate },
              },
              from,
            )
          }
        })

        const currentMediaStream = mediaStream.current
        if (currentMediaStream) {
          currentMediaStream.getTracks().forEach((track) => {
            console.log(track)
            peerConnection.addTrack(track, currentMediaStream)
          })
        }

        const sessionDescription = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        })
        await peerConnection.setLocalDescription(sessionDescription)
        _sendMessage(
          {
            type: MessageType.OFFER,
            payload: {
              sessionDescription,
            },
          },
          from,
        )
      } else if (msg.type === MessageType.ANSWER) {
        const { sessionDescription } = msg.payload
        peerConnections.get(from)?.setRemoteDescription(sessionDescription)
      } else if (msg.type === MessageType.ICECANDIDATE) {
        const { candidate } = msg.payload
        peerConnections
          .get(from)
          ?.addIceCandidate(new RTCIceCandidate(candidate))
      } else if (msg.type === MessageType.DISCONNECT_PEER) {
        peerConnections.get(from)?.close()
        peerConnections.delete(from)
      }
    },
    [peerConnections, mediaStream],
  )

  useConnectToRoom(BROADCAST_ROOM_ID, signalingMsgHandler)

  React.useEffect(() => {
    ;(async () => {
      const stream = await getMediaStream()
      if (localVideo.current) {
        localVideo.current.srcObject = stream
        localVideo.current.play()
      }
      mediaStream.current = stream
    })()
  }, [])

  React.useEffect(() => {
    const interval = setInterval(() => {
      peerConnections.forEach(async (peerConnection, userId) => {
        const stats = await peerConnection.getStats()
        stats.forEach((report) => {
          if (report.candidateType && report.type === 'remote-candidate') {
            console.log(userId, report.type, report.candidateType)
          }
        })
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [peerConnections])

  return (
    <div>
      <video ref={localVideo} muted={true} />
    </div>
  )
}
