import React, { useState, useEffect } from 'react'
import { ArrowLeft, Save, Camera, Bell, Shield, Sliders } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
    const navigate = useNavigate()

    // State
    const [cameraUrl, setCameraUrl] = useState('')
    const [mode, setMode] = useState('automatic')
    const [sensitivity, setSensitivity] = useState(50)
    const [notifications, setNotifications] = useState({
        openClose: true,
        obstruction: true,
        maintenance: false
    })

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedUrl = localStorage.getItem('cameraUrl')
        if (savedUrl) setCameraUrl(savedUrl)
    }, [])

    const handleSave = () => {
        // Save to localStorage
        if (cameraUrl) localStorage.setItem('cameraUrl', cameraUrl)

        // Mock save to API
        console.log('Saving settings:', { cameraUrl, mode, sensitivity, notifications })

        // Show notification (mock)
        alert('Configuración guardada correctamente')
        navigate('/')
    }

    return (
        <div className="page-content">
            {/* Top Bar */}
            <div className="top-bar">
                <button className="btn-icon-glass" onClick={() => navigate('/')}>
                    <ArrowLeft size={24} />
                </button>
                <div className="top-bar-title">Configuración</div>
                <div style={{ width: 40 }}></div>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>

                {/* Camera Settings */}
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: 'var(--accent-gold)' }}>
                        <Camera size={24} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-primary)' }}>Cámara IP</h3>
                    </div>

                    <label className="label-text">URL del Stream (MJPEG/Snapshot)</label>
                    <input
                        type="text"
                        className="input-glass"
                        placeholder="http://192.168.1.X:81/stream"
                        value={cameraUrl}
                        onChange={(e) => setCameraUrl(e.target.value)}
                    />
                    <p style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                        Introduce la URL directa de la imagen o stream de tu cámara ESP32-CAM.
                    </p>
                </div>

                {/* Operation Settings */}
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: 'var(--accent-gold)' }}>
                        <Sliders size={24} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-primary)' }}>Funcionamiento</h3>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label className="label-text" style={{ marginBottom: '12px' }}>Modo de Operación</label>
                        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '4px' }}>
                            <button
                                onClick={() => setMode('automatic')}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                                    background: mode === 'automatic' ? 'var(--accent-gold)' : 'transparent',
                                    color: mode === 'automatic' ? '#000' : 'var(--text-secondary)',
                                    fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                Automático
                            </button>
                            <button
                                onClick={() => setMode('manual')}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                                    background: mode === 'manual' ? 'var(--accent-gold)' : 'transparent',
                                    color: mode === 'manual' ? '#000' : 'var(--text-secondary)',
                                    fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                Manual
                            </button>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label className="label-text">Sensibilidad del Sensor</label>
                            <span style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 'bold' }}>{sensitivity}%</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="100"
                            value={sensitivity}
                            onChange={(e) => setSensitivity(parseInt(e.target.value))}
                            style={{
                                width: '100%', height: '6px', borderRadius: '3px', appearance: 'none',
                                background: `linear-gradient(to right, var(--accent-gold) ${sensitivity}%, rgba(255,255,255,0.1) ${sensitivity}%)`,
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Notifications */}
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: 'var(--accent-gold)' }}>
                        <Bell size={24} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-primary)' }}>Notificaciones</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { id: 'openClose', label: 'Alertas de Apertura/Cierre' },
                            { id: 'obstruction', label: 'Detección de Obstrucción' },
                            { id: 'maintenance', label: 'Recordatorios de Mantenimiento' }
                        ].map((item) => (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{item.label}</span>
                                <div
                                    onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id] })}
                                    style={{
                                        width: '48px', height: '26px',
                                        background: notifications[item.id] ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                                        borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: '20px', height: '20px', background: '#fff', borderRadius: '50%',
                                        position: 'absolute', top: '3px',
                                        left: notifications[item.id] ? '25px' : '3px',
                                        transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <Save size={20} />
                    GUARDAR CAMBIOS
                </button>

                <div style={{ height: '40px' }}></div>
            </div>
        </div>
    )
}
