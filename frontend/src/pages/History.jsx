import React, { useState, useEffect } from 'react'
import { ChevronLeft, Search, Clock, DoorOpen, DoorClosed, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getHistory, parseTimestamp } from '../services/api'

export default function History() {
    const navigate = useNavigate()
    const [history, setHistory] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await getHistory(undefined, {
                limit: 50,
                offset: 0
            })

            if (response.success && response.data) {
                // Transform backend data to UI format
                const transformedData = response.data.map((reading, index) => {
                    // Determine type and title based on sensor data
                    let type = 'info'
                    let title = 'Lectura de Sensor'
                    let subtitle = `${reading.sensor_type}: ${reading.value} ${reading.unit || ''}`

                    // Classify by sensor type
                    if (reading.sensor_type === 'motion') {
                        type = reading.value === 1 ? 'warning' : 'info'
                        title = reading.value === 1 ? 'Movimiento Detectado' : 'Sin Movimiento'
                        subtitle = 'Sensor de movimiento'
                    } else if (reading.sensor_type === 'position' || reading.sensor_type === 'gate_position') {
                        if (reading.value > 90) {
                            type = 'open'
                            title = 'Apertura Completa'
                        } else if (reading.value < 10) {
                            type = 'close'
                            title = 'Cierre Completo'
                        } else {
                            type = 'info'
                            title = 'Posición Parcial'
                        }
                        subtitle = `Posición: ${reading.value}%`
                    } else if (reading.sensor_type === 'error' || reading.sensor_type === 'alert') {
                        type = 'error'
                        title = 'Error del Sistema'
                        subtitle = reading.value
                    }

                    const timestamp = new Date(reading.timestamp)
                    const now = new Date()
                    const diffDays = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24))

                    let dateLabel = 'Hoy'
                    if (diffDays === 1) {
                        dateLabel = 'Ayer'
                    } else if (diffDays > 1) {
                        dateLabel = timestamp.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })
                    }

                    return {
                        id: reading.id || index,
                        type,
                        title,
                        subtitle,
                        duration: null, // Backend doesn't provide duration yet
                        time: timestamp.toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) + ' hs',
                        date: dateLabel,
                        timestamp: reading.timestamp
                    }
                })

                setHistory(transformedData)
            }
        } catch (err) {
            console.error('Error fetching history:', err)
            setError('Error al cargar el historial')
        } finally {
            setLoading(false)
        }
    }

    // Group by date
    const groupedHistory = history.reduce((groups, item) => {
        const date = item.date
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(item)
        return groups
    }, {})

    const getIcon = (type) => {
        switch (type) {
            case 'open':
                return <DoorOpen size={20} />
            case 'close':
                return <DoorClosed size={20} />
            case 'error':
                return <AlertTriangle size={20} />
            default:
                return <Clock size={20} />
        }
    }

    const getIconClass = (type) => {
        switch (type) {
            case 'open':
            case 'close':
                return 'success'
            case 'error':
                return 'error'
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
                <h1>Historial de Operaciones</h1>
                <button className="icon-btn" onClick={fetchHistory}>
                    <Search size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="content">
                {loading ? (
                    <div className="empty-state">
                        <Clock size={64} />
                        <div className="empty-state-title">Cargando...</div>
                    </div>
                ) : error ? (
                    <div className="empty-state">
                        <AlertTriangle size={64} />
                        <div className="empty-state-title">Error</div>
                        <div className="empty-state-text">{error}</div>
                        <button
                            className="btn btn-gold"
                            onClick={fetchHistory}
                            style={{ marginTop: '1rem' }}
                        >
                            Reintentar
                        </button>
                    </div>
                ) : Object.keys(groupedHistory).length > 0 ? (
                    Object.entries(groupedHistory).map(([date, items]) => (
                        <div key={date} className="list-section">
                            <div className="list-section-title">{date}</div>
                            {items.map((item) => (
                                <div key={item.id} className="list-item">
                                    <div className={`list-item-icon ${getIconClass(item.type)}`}>
                                        {getIcon(item.type)}
                                    </div>
                                    <div className="list-item-content">
                                        <div className="list-item-title">{item.title}</div>
                                        <div className="list-item-subtitle">{item.subtitle}</div>
                                        {item.duration && (
                                            <div className="list-item-badge" style={{ marginTop: '0.25rem' }}>
                                                <Clock size={12} />
                                                <span>Duración: {item.duration}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="list-item-meta">
                                        <div className="list-item-time">{item.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <Clock size={64} />
                        <div className="empty-state-title">Sin historial</div>
                        <div className="empty-state-text">
                            No hay operaciones registradas todavía
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
