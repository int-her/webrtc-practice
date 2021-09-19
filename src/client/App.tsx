import * as React from 'react'

import { Caster } from './broadcast/Caster'
import { Watcher } from './broadcast/Watcher'
import { Caller } from './call/Caller'

const enum ConnectionType {
  CALL,
  BROADCAST_CASTER,
  BROADCAST_WATCHER,
}

export const App: React.FC = () => {
  const [type, setType] = React.useState<ConnectionType>()

  return (
    <div>
      {!type && (
        <>
          <button type='button' onClick={() => setType(ConnectionType.CALL)}>
            Call
          </button>
          <button
            type='button'
            onClick={() => setType(ConnectionType.BROADCAST_CASTER)}
          >
            Broadcast: caster
          </button>
          <button
            type='button'
            onClick={() => setType(ConnectionType.BROADCAST_WATCHER)}
          >
            Broadcast: watcher
          </button>
        </>
      )}
      {type === ConnectionType.CALL && <Caller />}
      {type === ConnectionType.BROADCAST_CASTER && <Caster />}
      {type === ConnectionType.BROADCAST_WATCHER && <Watcher />}
    </div>
  )
}
