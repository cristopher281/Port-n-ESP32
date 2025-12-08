import React, { useState, useEffect } from 'react'
import { ChevronLeft, Search, Clock, DoorOpen, DoorClosed, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function History() {
    const navigate = useNavigate()
    const [history, setHistory] = useState([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        // TODO: Fetch history from API
        // Simulated data for demo
        setHistory([
            {
                id: 1,
                type: 'open',
                title: 'Apertura Completa',
                subtitle: 'Activado por: Ana Pérez',
                duration: '25s',
                time: '14:30 hs',
                date: 'Hoy'
            },
            {
                id: 2,
                type: 'close',
                title: 'Cierre Manual',
                subtitle: 'Activado por: Juan García',
                duration: '22s',
                time: '12:10 hs',
                date: 'Hoy'
            },
            {
                id: 3,
                type: 'error',
                title: 'Fallo en Apertura',
                subtitle: 'Sensor de obstáculo activado',
                duration: null,
                time: '09:35 hs',
                date: 'Hoy'
            },
            {
                id: 4,
                type: 'close',
                title: 'Cierre Automático',
                subtitle: 'Activado por: Sistema',
                duration: '23s',
                time: '21:00 hs',
                date: 'Ayer'
            },
            {
                id: 5,
                type: 'open',
                title: 'Apertura Completa',
                subtitle: 'Activado por: Ana Pérez',
                duration: '25s',
                time: '20:45 hs',
                date: 'Ayer'
            }
        ])
    }, [])

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
                <button className="icon-btn">
                    <Search size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="content">
                {Object.entries(groupedHistory).map(([date, items]) => (
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
                ))}

                {history.length === 0 && (
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
