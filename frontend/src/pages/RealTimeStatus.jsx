import React from 'react'

export default function RealTimeStatus() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Estado en tiempo real</h2>
      <p>Pantalla de estado en tiempo real (placeholder)</p>
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Activity, Eye, Shield, CheckCircle, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAllLatestReadings, sendCommand } from '../services/api'

export default function RealTimeStatus() {
    const navigate = useNavigate()
    const [gateProgress, setGateProgress] = useState(0) // 0-100
    const [sensors, setSensors] = useState({
        motion: false,
        proximity: null, // meters
        system: 'normal' // 'normal' | 'warning' | 'error'
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Fetch sensor data on mount and set up polling
    useEffect(() => {
        fetchSensorData()

        // Poll every 3 seconds for real-time updates
        const interval = setInterval(fetchSensorData, 3000)

        return () => clearInterval(interval)
    }, [])

    const fetchSensorData = async () => {
        try {
            const response = await getAllLatestReadings()

            if (response.success && response.data) {
                const sensorData = response.data

                // Parse sensor readings
                const newSensors = { ...sensors }

                sensorData.forEach(reading => {
                    switch (reading.sensor_type) {
                        case 'motion':
                            newSensors.motion = reading.value === 1
                            break
                        case 'proximity':
                        case 'distance':
                            newSensors.proximity = reading.value
                            break
                        case 'gate_position':
                        case 'position':
                            setGateProgress(Math.round(reading.value))
                            break
                        case 'status':
                        case 'system_status':
                            newSensors.system = reading.value === 1 ? 'normal' : 'warning'
                            break
                    }
                })

                setSensors(newSensors)
            }
            setError(null)
        } catch (err) {
            console.error('Error fetching sensor data:', err)
            // Don't show error on every failed poll, just log it
        }
    }

    const handleAction = async (action) => {
        if (loading) return

        setLoading(true)
        setError(null)

        try {
            let command = action
            if (action === 'pause') {
                // Backend doesn't have pause, use stop or close
                command = 'close'
            }

            const response = await sendCommand(command)

            if (response.success) {
                // Forzar actualización INMEDIATA
                setIsMoving(true)
                setTimeout(fetchSensorData, 100)
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
        <div className="page">
            {/* Top Bar */}
            <div className="top-bar">
                <button className="icon-btn" onClick={() => navigate('/')}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Estado en Tiempo Real</h1>
                <button className="icon-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6m5.656-15.656l-4.243 4.243m-2.828 2.829l-4.243 4.243M23 12h-6m-6 0H1m15.656 5.656l-4.243-4.243m-2.828-2.828l-4.243-4.243" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="content">
                {/* Real-time indicator */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#ffd700'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#ffd700',
                        animation: 'pulse 1s infinite'
                    }}></div>
                    Tiempo Real (actualización cada 500ms)
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        color: '#ff6b6b',
                        fontSize: '0.875rem',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        borderRadius: '0.5rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Camera View */}
                <div className="camera-view">
                    <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=450&fit=crop"
                        alt="Vista de la cámara"
                        style={{ filter: 'brightness(0.9)' }}
                    />
                </div>

                {/* Gate Progress */}
                <div className="progress-bar-container">
                    <div className="progress-info">
                        <div className="progress-label">
                            {gateProgress === 0 ? 'Cerrado' : gateProgress === 100 ? 'Abierto' : gateProgress > 50 ? 'Abriendo' : 'Cerrando'}
                        </div>
                        <div className="progress-value" style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: isMoving ? '#ffd700' : 'inherit'
                        }}>
                            {gateProgress}%
                        </div>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${gateProgress}%`,
                                transition: 'width 0.3s ease-out'
                            }}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <button
                        className="btn btn-gold"
                        onClick={() => handleAction('open')}
                        disabled={loading}
                        style={{ opacity: loading ? 0.6 : 1 }}
                    >
                        Abrir
                    </button>
                    <button
                        className="btn btn-dark"
                        onClick={() => handleAction('pause')}
                        disabled={loading}
                        style={{ opacity: loading ? 0.6 : 1 }}
                    >
                        Pausar
                    </button>
                    <button
                        className="btn btn-dark"
                        onClick={() => handleAction('close')}
                        disabled={loading}
                        style={{ opacity: loading ? 0.6 : 1 }}
                    >
                        Cerrar
                    </button>
                </div>

                {/* Sensor Status Indicators */}
                <div style={{ marginTop: '1.5rem' }}>
                    {/* Motion Sensor */}
                    <div className="status-indicator">
                        <div className={`status-indicator-icon ${sensors.motion ? 'warning' : 'success'}`}>
                            <Activity size={18} />
                        </div>
                        <div className="status-indicator-text">
                            Sensor de Movimiento: {sensors.motion ? 'Detectado' : 'Inactivo'}
                        </div>
                        <div className={`status-indicator-dot ${sensors.motion ? 'warning' : 'success'}`}></div>
                    </div>

                    {/* Proximity Sensor */}
                    {sensors.proximity !== null && (
                        <div className="status-indicator">
                            <div className={`status-indicator-icon ${sensors.proximity < 1 ? 'error' : 'success'}`}>
                                <Eye size={18} />
                            </div>
                            <div className="status-indicator-text">
                                Sensor de Proximidad: Objeto a {sensors.proximity.toFixed(1)}m
                            </div>
                            <div className={`status-indicator-dot ${sensors.proximity < 1 ? 'error' : 'success'}`}></div>
                        </div>
                    )}

                    {/* System Status */}
                    <div className="status-indicator">
                        <div className={`status-indicator-icon ${sensors.system === 'normal' ? 'success' : 'warning'}`}>
                            <Shield size={18} />
                        </div>
                        <div className="status-indicator-text">
                            Estado del Sistema: {sensors.system === 'normal' ? 'Normal' : 'Advertencia'}
                        </div>
                        <div className={`status-indicator-dot ${sensors.system === 'normal' ? 'success' : 'warning'}`}></div>
                    </div>
                </div>
            </div>

            {/* Add pulse animation */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    )
}
