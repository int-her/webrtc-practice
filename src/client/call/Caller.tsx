import * as React from 'react'

import { MessageType, SignalingMessage } from '../../types'
import { getMediaStream } from '../utils/get-media-stream'
import { useConnectToRoom } from '../hooks/use-connect-to-room'

const ROOM_ID = '1'

export const Caller: React.FC = () => {
  const [pc] = React.useState(new RTCPeerConnection())
  const [mediaStream, setMediaStream] = React.useState<MediaStream>()

  const localVideo = React.useRef<HTMLVideoElement>(null)
  const remoteVideo = React.useRef<HTMLVideoElement>(null)

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
      _sendMessage: (message: SignalingMessage) => void,
      msg: SignalingMessage,
    ) => {
      if (msg.type === MessageType.INVITATION) {
        const { offer } = msg.payload
        await pc.setRemoteDescription(offer)
        const answer = await pc.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        })
        await pc.setLocalDescription(answer)
        _sendMessage({
          type: MessageType.ACCEPTED,
          payload: {
            answer,
          },
        })
      } else if (msg.type === MessageType.ICECANDIDATE) {
        const candidate = new RTCIceCandidate(msg.payload.candidate)
        await pc.addIceCandidate(candidate)
      } else if (msg.type === MessageType.ACCEPTED) {
        const { answer } = msg.payload
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
      }
    },
    [pc],
  )

  const { sendMessage } = useConnectToRoom(ROOM_ID, signalingMsgHandler)

  React.useEffect(() => {
    ;(async () => {
      const stream = await getMediaStream()
      if (localVideo.current) {
        localVideo.current.srcObject = stream
        localVideo.current.play()
      }

      stream.getTracks().forEach((track) => pc.addTrack(track))
      setMediaStream(stream)

      pc.ontrack = (e) => {
        console.log('track stream:', e.streams[0])
        if (remoteVideo.current) {
          addRemoteTrack(e.track)
        }
      }

      pc.onicecandidate = (e) => {
        const { candidate } = e
        if (candidate) {
          sendMessage({
            type: MessageType.ICECANDIDATE,
            payload: {
              candidate,
            },
          })
        }
      }
    })()
  }, [addRemoteTrack, pc, sendMessage])

  return (
    <div>
      <video ref={localVideo} muted={true} />
      {mediaStream && (
        <button
          type="button"
          onClick={async () => {
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            })

            await pc.setLocalDescription(offer)
            sendMessage({
              type: MessageType.INVITATION,
              payload: {
                offer,
              },
            })
          }}
        >
          Invite
        </button>
      )}
      <video ref={remoteVideo} muted={true} />
    </div>
  )
}
