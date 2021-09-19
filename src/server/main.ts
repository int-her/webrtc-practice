import Koa, { Context } from 'koa'
import route from 'koa-route'
import serve from 'koa-static'
import websockify from 'koa-websocket'

const app = websockify(new Koa())

app.use(serve('src/public'))
app.use(serve('build/client'))

const connections = new Set<Context>()

app.ws.use(
  route.all('/room/:id', (ctx) => {
    connections.add(ctx)

    ctx.websocket.on('message', (message) => {
      const {
        msg: { type, payload, to },
      } = JSON.parse(message.toString())

      if (type === 'login') {
        ctx.state.userId = payload.userId
        console.log('login:', payload.userId)
        return
      }

      console.log(
        'to:',
        to,
        ', from:',
        ctx.state.userId,
        ', msg:',
        type,
        payload,
      )

      connections.forEach((c) => {
        if (c !== ctx && (!to || c.state.userId === to)) {
          c.websocket.send(message)
        }
      })
    })
  }),
)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Sever listening at PORT: ${PORT}`)
})
