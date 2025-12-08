import React from 'react'

export default function Alerts() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Accesos</h2>
      <p>Gestión de accesos y registro (pendiente desarrollo)</p>
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { ChevronLeft, Filter, AlertTriangle, AlertCircle, Radio } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Alerts() {
    const navigate = useNavigate()
    const [alerts, setAlerts] = useState([])

    useEffect(() => {
        // TODO: Fetch alerts from API
        // Simulated data for demo
        setAlerts([
            {
                id: 1,
                type: 'critical',
                title: 'Distancia Crítica',
                subtitle: 'Vehículo demasiado cerca',
                time: '14:32',
                date: 'Hoy'
            },
            {
                id: 2,
                type: 'warning',
                title: 'Motor en funcionamiento',
                subtitle: 'El portón se está abriendo',
                time: '14:30',
                date: 'Hoy'
            },
            {
                id: 3,
                type: 'info',
                title: 'Movimiento Detectado',
                subtitle: 'Movimiento cerca del portón',
                time: '16:45',
                date: 'Ayer'
            },
            {
                id: 4,
                type: 'info',
                title: 'Movimiento Detectado',
                subtitle: 'Movimiento cerca del portón',
                time: '08:15',
                date: '25 de Julio, 2024'
            }
        ])
    }, [])

    // Group by date
    const groupedAlerts = alerts.reduce((groups, alert) => {
        const date = alert.date
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(alert)
        return groups
    }, {})

    const getIcon = (type) => {
        switch (type) {
            case 'critical':
                return <AlertTriangle size={20} />
            case 'warning':
                return <AlertCircle size={20} />
            case 'info':
                return <Radio size={20} />
            default:
                return <AlertCircle size={20} />
        }
    }

    const getIconClass = (type) => {
        switch (type) {
            case 'critical':
                return 'error'
            case 'warning':
                return 'warning'
            case 'info':
                return 'success'
            default:
                return 'warning'
        }
    }

    return (
        <div className="page">
            {/* Top Bar */}
            <div className="top-bar">
                <button className="icon-btn" onClick={() => navigate('/')}>
                    <ChevronLeft size={24} />
                </button>
                <h1>Alertas</h1>
                <button className="icon-btn">
                    <Filter size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="content">
                {Object.entries(groupedAlerts).map(([date, items]) => (
                    <div key={date} className="list-section">
                        <div className="list-section-title">{date}</div>
                        {items.map((alert) => (
                            <div key={alert.id} className="list-item">
                                <div className={`list-item-icon ${getIconClass(alert.type)}`}>
                                    {getIcon(alert.type)}
                                </div>
                                <div className="list-item-content">
                                    <div className="list-item-title">{alert.title}</div>
                                    <div className="list-item-subtitle">{alert.subtitle}</div>
                                </div>
                                <div className="list-item-meta">
                                    <div className="list-item-time">{alert.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                {alerts.length === 0 && (
                    <div className="empty-state">
                        <AlertCircle size={64} />
                        <div className="empty-state-title">Sin alertas</div>
                        <div className="empty-state-text">
                            No hay alertas activas en este momento
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
