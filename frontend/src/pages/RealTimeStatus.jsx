import React, { useState, useEffect } from 'react'
import { ArrowLeft, Activity, Eye, Shield, CheckCircle, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function RealTimeStatus() {
    const navigate = useNavigate()
    const [gateProgress, setGateProgress] = useState(75) // 0-100
    const [sensors, setSensors] = useState({
        motion: true,
        proximity: 0.5, // meters
        system: 'normal' // 'normal' | 'warning' | 'error'
    })

    // Demo: Simulate gate opening/closing
    useEffect(() => {
        const interval = setInterval(() => {
            // This would normally come from WebSocket
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const handleAction = async (action) => {
        // TODO: Send command to API
        console.log('Action:', action)
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
                            {gateProgress === 0 ? 'Cerrado' : gateProgress === 100 ? 'Abierto' : 'Abriendo'}
                        </div>
                        <div className="progress-value">{gateProgress}%</div>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${gateProgress}%` }}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <button className="btn btn-gold" onClick={() => handleAction('open')}>
                        Abrir
                    </button>
                    <button className="btn btn-dark" onClick={() => handleAction('pause')}>
                        Pausar
                    </button>
                    <button className="btn btn-dark" onClick={() => handleAction('close')}>
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
                    <div className="status-indicator">
                        <div className={`status-indicator-icon ${sensors.proximity < 1 ? 'error' : 'success'}`}>
                            <Eye size={18} />
                        </div>
                        <div className="status-indicator-text">
                            Sensor de Proximidad: Objeto a {sensors.proximity.toFixed(1)}m
                        </div>
                        <div className={`status-indicator-dot ${sensors.proximity < 1 ? 'error' : 'success'}`}></div>
                    </div>

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
        </div>
    )
}
