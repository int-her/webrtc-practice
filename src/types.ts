export const enum MessageType {
  INVITATION = 'INVITATION',
  ACCEPTED = 'ACCEPTED',
  ICECANDIDATE = 'ICECANDIDATE',
  BROADCAST = 'BROADCAST',
  OFFER = 'OFFER',
  WATCH = 'WATCH',
  ANSWER = 'ANSWER',
  DISCONNECT_PEER = 'DISCONNECT_PEER',
}

export type SignalingMessage =
  | {
      type: MessageType.INVITATION
      payload: {
        offer: RTCSessionDescriptionInit
      }
    }
  | {
      type: MessageType.ACCEPTED
      payload: {
        answer: RTCSessionDescriptionInit
      }
    }
  | {
      type: MessageType.ICECANDIDATE
      payload: {
        candidate: RTCIceCandidate
      }
    }
  | BroadcastingMessage

export type BroadcastingMessage =
  | BroadcastingCommonMessage
  | BroadcastingCasterMessage
  | BroadcastingWatcherMessage

export type BroadcastingCommonMessage = {
  type: MessageType.ICECANDIDATE
  payload: {
    candidate: RTCIceCandidate
  }
}

export type BroadcastingCasterMessage = {
  type: MessageType.OFFER
  payload: {
    sessionDescription: RTCSessionDescriptionInit
  }
}

export type BroadcastingWatcherMessage =
  | {
      type: MessageType.WATCH
      payload: undefined
    }
  | {
      type: MessageType.ANSWER
      payload: {
        sessionDescription: RTCSessionDescriptionInit
      }
    }
  | {
      type: MessageType.DISCONNECT_PEER
      payload: undefined
    }
