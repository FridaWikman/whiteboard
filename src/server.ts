import { createServer } from 'http'
import next from 'next'
import { Server } from 'socket.io'

const app = next({ dev: true }) //import next from “next”
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    //import { createServer}from “node:http”
    handler(req, res)
  })

  const io = new Server(httpServer, {
    //import { Server } from "socket.io";
    path: '/api/socketio',
    transports: ['websocket'],
  })

  io.on('connection', (socket) => {
    console.log('User connected to socket:', socket.id)

    socket.on('disconnect', () => {
      console.log('User disconnected from socket:', socket.id)
    })

    // Listening for 'draw' events from clients
    socket.on('draw', (data) => {
      // Broadcasting the 'draw' event to all other clients except the sender
      console.log('Broadcasting draw event: ', data)

      // This sends the event to all other connected clients
      socket.broadcast.emit('draw', data)
    })
  })

  httpServer.listen(3000, () => {
    console.log(`Server running at http://localhost:3000`)
  })
})
