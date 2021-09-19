import * as React from 'react'

import { MessageType, SignalingMessage } from '../../types'
import { useConnectToRoom } from '../hooks/use-connect-to-room'
import { config } from '../utils/config'

import { BROADCAST_ROOM_ID } from './Caster'

export const Watcher: React.FC = () => {
  const [peerConnection] = React.useState(new RTCPeerConnection(config))
  const remoteVideo = React.useRef<HTMLVideoElement>(null)
  const casterUserId = React.useRef<string>()

  const [tracks, setTracks] = React.useState<MediaStreamTrack[]>([])
  const addRemoteTrack = React.useCallback((track: MediaStreamTrack) => {
    setTracks((prevTracks) => [...prevTracks, track])
  }, [])

  React.useEffect(() => {
    if (tracks.length >= 2 && remoteVideo.current) {
      remoteVideo.current.srcObject = new MediaStream(tracks)
      remoteVideo.current.play()
    }
  }, [tracks])

  const signalingMsgHandler = React.useCallback(
    async (
      _sendMessage: (msg: SignalingMessage, to?: string) => void,
      msg: SignalingMessage,
      from: string,
    ) => {
      if (msg.type === MessageType.OFFER) {
        casterUserId.current = from
        const { sessionDescription: remoteSessionDescription } = msg.payload

        await peerConnection.setRemoteDescription(remoteSessionDescription)
        // create local sdp
        const sessionDescription = await peerConnection.createAnswer({
          offerToReceiveAudio: false,
          offerToReceiveVideo: false,
        })
        await peerConnection.setLocalDescription(sessionDescription)
        _sendMessage(
          {
            type: MessageType.ANSWER,
            payload: { sessionDescription },
          },
          from,
        )
      } else if (msg.type === MessageType.ICECANDIDATE) {
        const { candidate } = msg.payload
        if (candidate) {
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        }
      }
    },
    [peerConnection],
  )

  const { sendMessage } = useConnectToRoom(
    BROADCAST_ROOM_ID,
    signalingMsgHandler,
    {
      type: MessageType.WATCH,
      payload: undefined,
    },
  )

  React.useEffect(() => {
    peerConnection.addEventListener('track', (e) => {
      console.log('eventListener track:', e.track)
      if (remoteVideo.current) {
        addRemoteTrack(e.track)
      }
    })
    peerConnection.addEventListener('icecandidate', (e) => {
      const { candidate } = e
      if (candidate) {
        sendMessage(
          {
            type: MessageType.ICECANDIDATE,
            payload: { candidate },
          },
          casterUserId.current,
        )
      }
    })
  }, [addRemoteTrack, peerConnection, sendMessage])

  return (
    <div>
      <video ref={remoteVideo} muted={true} />
    </div>
  )
}
