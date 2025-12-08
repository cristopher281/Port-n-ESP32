import React, { useState } from 'react'
import { ChevronLeft, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
    const navigate = useNavigate()
    const [mode, setMode] = useState('automatic') // 'automatic' | 'manual'
    const [sensitivity, setSensitivity] = useState(50)
    const [minDistance, setMinDistance] = useState(50)
    const [notifications, setNotifications] = useState({
        openClose: true,
        obstruction: true,
        maintenance: false
    })

    const handleSave = async () => {
        // TODO: Save settings to API
        console.log('Saving settings:', { mode, sensitivity, minDistance, notifications })
        // await api.put('/devices/1/settings', settings)
        navigate('/')
    }

    return (
        <div className="page">
            {/* Top Bar */}
            <div className="top-bar">
                <button className="icon-btn" onClick={() => navigate('/')}>
                    <ChevronLeft size={24} />
                </button>
                <h1>Configuración del Sistema</h1>
                <div style={{ width: 40 }}></div>
            </div>

            {/* Content */}
            <div className="content">
                {/* Operation Mode */}
                <div className="card">
                    <h3 className="card-title">Modo de Operación</h3>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <button
                            className={`btn ${mode === 'automatic' ? 'btn-gold' : 'btn-dark'}`}
                            onClick={() => setMode('automatic')}
                            style={{ flex: 1 }}
                        >
                            Automático
                        </button>
                        <button
                            className={`btn ${mode === 'manual' ? 'btn-gold' : 'btn-dark'}`}
                            onClick={() => setMode('manual')}
                            style={{ flex: 1 }}
                        >
                            Manual
                        </button>
                    </div>
                </div>

                {/* Sensor Settings */}
                <div className="card">
                    <h3 className="card-title">Ajustes del Sensor</h3>

                    {/* Sensitivity Slider */}
                    <div className="slider-container">
                        <div className="slider-label">
                            <span>Sensibilidad del sensor</span>
                            <span style={{ color: 'var(--text-muted)' }}>
                                {sensitivity < 33 ? 'Bajo' : sensitivity < 66 ? 'Medio' : 'Alto'}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sensitivity}
                            onChange={(e) => setSensitivity(parseInt(e.target.value))}
                            className="slider"
                            style={{
                                backgroundSize: `${sensitivity}% 100%`
                            }}
                        />
                    </div>

                    {/* Minimum Distance */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <div className="slider-label">
                            <span>Distancia Mínima</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                            </span>
                        </div>
                        <div className="number-input">
                            <button onClick={() => setMinDistance(Math.max(10, minDistance - 10))}>−</button>
                            <div className="value">{minDistance} cm</div>
                            <button onClick={() => setMinDistance(Math.min(200, minDistance + 10))}>+</button>
                        </div>
                    </div>
                </div>

                {/* Push Notifications */}
                <div className="card">
                    <h3 className="card-title">Gestionar Notificaciones Push</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {/* Opening/Closing Notifications */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Notificar al abrir/cerrar</span>
                            <div
                                className={`toggle-switch ${notifications.openClose ? 'active' : ''}`}
                                onClick={() => setNotifications({ ...notifications, openClose: !notifications.openClose })}
                            >
                                <div className="toggle-knob"></div>
                            </div>
                        </div>

                        {/* Obstruction Alerts */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Alertas de obstrucción</span>
                            <div
                                className={`toggle-switch ${notifications.obstruction ? 'active' : ''}`}
                                onClick={() => setNotifications({ ...notifications, obstruction: !notifications.obstruction })}
                            >
                                <div className="toggle-knob"></div>
                            </div>
                        </div>

                        {/* Maintenance */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Mantenimiento</span>
                            <div
                                className={`toggle-switch ${notifications.maintenance ? 'active' : ''}`}
                                onClick={() => setNotifications({ ...notifications, maintenance: !notifications.maintenance })}
                            >
                                <div className="toggle-knob"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button className="btn btn-gold" onClick={handleSave} style={{ width: '100%', marginTop: '1rem' }}>
                    <Save size={20} />
                    Guardar Cambios
                </button>
            </div>
        </div>
    )
}
