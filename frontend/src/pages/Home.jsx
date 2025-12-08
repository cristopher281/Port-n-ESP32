import React, { useState, useEffect, useRef } from 'react'
import { Lock, Unlock, Power } from 'lucide-react'

export default function Home() {
    const [status, setStatus] = useState('closed') // 'open' | 'closed' | 'loading'
    const [pressing, setPressing] = useState(false)
    const holdTimer = useRef(null)

    // Simulate fetching status (replace with actual API call)
    useEffect(() => {
        // TODO: Fetch actual status from API
        const fetchStatus = async () => {
            // const res = await api.get('/devices/1/status')
            // setStatus(res.data.status)
        }
        fetchStatus()
    }, [])

    const handlePressStart = () => {
        setPressing(true)
        holdTimer.current = setTimeout(() => {
            toggleGate()
        }, 600) // Hold for 600ms to trigger
    }

    const handlePressEnd = () => {
        setPressing(false)
        if (holdTimer.current) {
            clearTimeout(holdTimer.current)
            holdTimer.current = null
        }
    }

    const toggleGate = async () => {
        const newStatus = status === 'open' ? 'closed' : 'open'
        setStatus(newStatus)
        // TODO: Send command to API
        // await api.post('/devices/1/command', { command: newStatus === 'open' ? 'open' : 'close' })
    }

    return (
        <div className="page">
            {/* Top Bar */}
            <div className="top-bar">
                <button className="icon-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <h1>Mi Portón</h1>
                <button className="icon-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6m5.656-15.656l-4.243 4.243m-2.828 2.829l-4.243 4.243M23 12h-6m-6 0H1m15.656 5.656l-4.243-4.243m-2.828-2.828l-4.243-4.243" />
                    </svg>
                </button>
            </div>

            {/* Main Content */}
            <div className="content">
                <div className="power-button-container">
                    {/* Status Badge */}
                    <div className="status-badge">
                        {status === 'open' ? (
                            <>
                                <Unlock size={20} />
                                <span>Abierto</span>
                            </>
                        ) : (
                            <>
                                <Lock size={20} />
                                <span>Cerrado</span>
                            </>
                        )}
                    </div>

                    {/* Power Button */}
                    <div
                        className={`power-button ${status === 'open' ? 'active' : ''}`}
                        onMouseDown={handlePressStart}
                        onMouseUp={handlePressEnd}
                        onMouseLeave={handlePressEnd}
                        onTouchStart={handlePressStart}
                        onTouchEnd={handlePressEnd}
                    >
                        <Power size={100} strokeWidth={1.5} />
                    </div>

                    <p className="hint-text">Mantén presionado para operar</p>
                </div>
            </div>
        </div>
    )
}
