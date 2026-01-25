import React, { useState, useEffect, useRef } from 'react'
import { Lock, Unlock, Power } from 'lucide-react'
import { getDeviceState, sendCommand } from '../services/api'

export default function Home() {
    const [status, setStatus] = useState('closed') // 'open' | 'closed' | 'loading' | 'unknown'
    const [pressing, setPressing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const holdTimer = useRef(null)

    // Fetch status on mount and set up polling
    useEffect(() => {
        fetchStatus()

        // Poll every 5 seconds for status updates
        const interval = setInterval(fetchStatus, 5000)

        return () => clearInterval(interval)
    }, [])

    const fetchStatus = async () => {
        try {
            const response = await getDeviceState()
            if (response.success && response.data) {
                setStatus(response.data.state || 'unknown')
            }
            setError(null)
        } catch (err) {
            console.error('Error fetching device state:', err)
            setError('No se pudo obtener el estado del dispositivo')
            // Don't change status on error, keep last known state
        }
    }

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
        if (loading) return // Prevent multiple simultaneous commands

        const newCommand = status === 'open' ? 'close' : 'open'

        setLoading(true)
        setError(null)

        try {
            const response = await sendCommand(newCommand)

            if (response.success) {
                // Optimistically update UI
                setStatus(newCommand === 'open' ? 'open' : 'closed')

                // Refresh actual state after a short delay
                setTimeout(fetchStatus, 2000)
            } else {
                setError('Error al enviar comando')
            }
        } catch (err) {
            console.error('Error sending command:', err)
            setError('Error al comunicarse con el servidor')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-content">
            {/* Top Bar */}
            <div className="top-bar">
                <div className="top-bar-title">Mi Portón</div>
                <button className="btn-icon-glass">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6m5.656-15.656l-4.243 4.243m-2.828 2.829l-4.243 4.243M23 12h-6m-6 0H1m15.656 5.656l-4.243-4.243m-2.828-2.828l-4.243-4.243" />
                    </svg>
                </button>
            </div>

            {/* Main Control Area */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>

                {/* Status Indicator */}
                <div className={`status-pill ${status === 'open' ? 'open' : status === 'closed' ? 'closed' : ''}`}>
                    {status === 'open' ? (
                        <>
                            <Unlock size={18} />
                            <span>ABIERTO</span>
                        </>
                    ) : status === 'closed' ? (
                        <>
                            <Lock size={18} />
                            <span>CERRADO</span>
                        </>
                    ) : (
                        <>
                            <Activity size={18} className="animate-pulse" />
                            <span>CONECTANDO...</span>
                        </>
                    )}
                </div>

                {/* Power Button */}
                <div
                    className={`power-control ${status === 'open' ? 'active' : ''} ${pressing ? 'pressing' : ''}`}
                    onMouseDown={handlePressStart}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onTouchStart={handlePressStart}
                    onTouchEnd={handlePressEnd}
                >
                    <Power strokeWidth={1.5} />
                </div>

                {/* Hint Text */}
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    marginTop: '1rem',
                    opacity: loading ? 0.7 : 1,
                    textAlign: 'center'
                }}>
                    {loading ? 'Procesando comando...' : 'Mantén presionado para operar'}
                </p>

                {/* Error Message */}
                {error && (
                    <div style={{
                        marginTop: '20px',
                        padding: '10px 16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '12px',
                        color: '#ef4444',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ fontSize: '1.2em' }}>⚠️</span>
                        {error}
                    </div>
                )}
            </div>
        </div>
    )
}
