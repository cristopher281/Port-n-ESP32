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
    const [isMoving, setIsMoving] = useState(false)

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


    // Get camera URL from settings or use default
    const cameraUrl = localStorage.getItem('cameraUrl') || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=450&fit=crop"

    return (
        <div className="page-content">
            {/* Top Bar */}
            <div className="top-bar">
                <button className="btn-icon-glass" onClick={() => navigate('/')}>
                    <ArrowLeft size={24} />
                </button>
                <div className="top-bar-title">Monitoreo</div>
                <div style={{ width: 40 }}></div> {/* Spacer for center alignment */}
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Live Indicator */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                    fontSize: '0.75rem',
                    color: 'var(--accent-gold)',
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                }}>
                    <span style={{
                        display: 'block',
                        width: '8px',
                        height: '8px',
                        background: 'var(--accent-gold)',
                        borderRadius: '50%',
                        boxShadow: '0 0 8px var(--accent-gold)'
                    }}></span>
                    TIEMPO REAL
                </div>

                {/* Camera View - Glass Panel */}
                <div className="glass-panel" style={{ overflow: 'hidden', marginBottom: '24px', position: 'relative' }}>
                    <div style={{ aspectRatio: '16/9', background: '#000' }}>
                        <img
                            src={cameraUrl}
                            alt="Cámara en vivo"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/800x450/000000/ffffff?text=Sin+Señal+de+Camara'; }}
                        />
                    </div>
                    {/* Timestamp Overlay */}
                    <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: 'rgba(0,0,0,0.6)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '0.7rem',
                        backdropFilter: 'blur(4px)'
                    }}>
                        {new Date().toLocaleTimeString()}
                    </div>
                </div>

                {/* Gate Progress */}
                <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-end' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Apertura</span>
                        <span style={{ color: 'var(--accent-gold)', fontWeight: '600', fontSize: '1.2rem' }}>{gateProgress}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${gateProgress}%`,
                            background: 'linear-gradient(90deg, var(--accent-gold-dim), var(--accent-gold))',
                            boxShadow: '0 0 10px var(--accent-gold-glow)',
                            transition: 'width 0.3s ease-out'
                        }}></div>
                    </div>
                </div>

                {/* Controls Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <button className="btn-primary" onClick={() => handleAction(gateProgress > 0 ? 'close' : 'open')} disabled={loading}>
                        {loading ? '...' : (gateProgress > 0 ? 'CERRAR' : 'ABRIR')}
                    </button>
                    <button className="btn-secondary" onClick={() => handleAction('stop')} disabled={loading}>
                        PAUSAR
                    </button>
                </div>

                {/* Sensors List */}
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', marginLeft: '4px' }}>SENSORES</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Motion */}
                    <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: sensors.motion ? 'var(--status-warning-dim)' : 'rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: sensors.motion ? 'var(--status-warning)' : 'var(--text-secondary)'
                        }}>
                            <Activity size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Movimiento</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{sensors.motion ? 'Detectado en zona' : 'Zona despejada'}</div>
                        </div>
                        {sensors.motion && <div className="animate-pulse" style={{ width: '8px', height: '8px', background: 'var(--status-warning)', borderRadius: '50%' }}></div>}
                    </div>

                    {/* Proximity */}
                    {sensors.proximity !== null && (
                        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: sensors.proximity < 1 ? 'var(--status-error-dim)' : 'rgba(255,255,255,0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: sensors.proximity < 1 ? 'var(--status-error)' : 'var(--text-secondary)'
                            }}>
                                <Eye size={20} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Proximidad</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Objeto a {sensors.proximity.toFixed(1)}m</div>
                            </div>
                        </div>
                    )}

                    {/* System */}
                    <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: sensors.system === 'normal' ? 'var(--status-success-dim)' : 'var(--status-warning-dim)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: sensors.system === 'normal' ? 'var(--status-success)' : 'var(--status-warning)'
                        }}>
                            <Shield size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Sistema</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{sensors.system === 'normal' ? 'Funcionando correctamente' : 'Requiere revisión'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
