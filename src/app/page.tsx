'use client'

import { io } from 'socket.io-client'
import { useEffect, useState, useRef } from 'react'

let socket: any

export default function Home() {
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prevPoint = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = 800
    canvas.height = 600

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.lineCap = 'round'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2

    socket = io(`http://localhost:3000`, {
      path: '/api/socketio',
      transports: ['websocket'],
    })
    socket.on('connect', () => console.log('Connected', socket.id))

    socket.on('draw', ({ x0, y0, x1, y1 }: any) => {
      const ctx = canvasRef.current!.getContext('2d')!
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y1)
      ctx.stroke()
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const startDrawing = ({ nativeEvent }: any) => {
    setIsDrawing(true)
    const { offsetX, offsetY } = nativeEvent
    prevPoint.current = { x: offsetX, y: offsetY }
  }

  const finishDrawing = () => {
    setIsDrawing(false)
    prevPoint.current = null
  }

  const draw = ({ nativeEvent }: any) => {
    if (!isDrawing || !prevPoint.current) return
    const { offsetX: x1, offsetY: y1 } = nativeEvent
    const { x: x0, y: y0 } = prevPoint.current
    const ctx = canvasRef.current!.getContext('2d')!

    // Local draw
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()

    // Broadcast
    socket.emit('draw', { x0, y0, x1, y1 })
    prevPoint.current = { x: x1, y: y1 }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-500 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Whiteboard</h1>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        className="border-2 mb-2 border-black bg-white" // ensure bg-white here
      />
    </div>
  )
}
