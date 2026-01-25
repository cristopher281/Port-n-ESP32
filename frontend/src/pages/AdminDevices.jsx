import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, Cpu, Copy, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminDevices() {
    const navigate = useNavigate()
    const [devices, setDevices] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    // Form State
    const [newName, setNewName] = useState('')
    const [newLocation, setNewLocation] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Token Modal State
    const [createdDevice, setCreatedDevice] = useState(null)
    const [showTokenModal, setShowTokenModal] = useState(false)
    const [copiedToken, setCopiedToken] = useState(false)

    useEffect(() => {
        fetchDevices()
    }, [])

    const fetchDevices = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/devices')
            const data = await res.json()
            if (data.success) {
                setDevices(data.data)
            }
        } catch (error) {
            console.error('Error fetching devices:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateDevice = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await fetch('http://localhost:3000/api/devices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    location: newLocation,
                    device_type: 'gate_controller'
                })
            })
            const data = await res.json()

            if (data.success) {
                // Show token modal with the new device data (which includes the token)
                setCreatedDevice(data.data)
                setShowTokenModal(true)

                // Reset form
                setNewName('')
                setNewLocation('')
                setShowForm(false)
                fetchDevices() // Refresh list
            } else {
                alert('Error: ' + data.message)
            }
        } catch (error) {
            console.error(error)
            alert('Error creating device: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que quieres eliminar este dispositivo?')) return
        try {
            await fetch(`http://localhost:3000/api/devices/${id}`, { method: 'DELETE' })
            fetchDevices()
        } catch (error) {
            console.error('Error deleting device:', error)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(createdDevice?.token || '')
        setCopiedToken(true)
        setTimeout(() => setCopiedToken(false), 2000)
    }

    return (
        <div className="page-content">
            {/* Top Bar */}
            <div className="top-bar">
                <button className="btn-icon-glass" onClick={() => navigate('/settings')}>
                    <ArrowLeft size={24} />
                </button>
                <div className="top-bar-title">Dispositivos</div>
                <button
                    className="btn-icon-glass"
                    onClick={() => setShowForm(!showForm)}
                    style={{ background: showForm ? 'var(--accent-gold)' : '' }}
                >
                    <Plus size={24} color={showForm ? '#000' : '#fff'} />
                </button>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>

                {/* Create Form */}
                {showForm && (
                    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', animation: 'fadeIn 0.3s' }}>
                        <h3 className="section-title" style={{ marginBottom: '16px' }}>Nuevo Dispositivo</h3>
                        <form onSubmit={handleCreateDevice}>
                            <div style={{ marginBottom: '16px' }}>
                                <label className="label-text">Nombre</label>
                                <input
                                    type="text" className="input-glass"
                                    placeholder="Ej: Portón Principal"
                                    value={newName} onChange={e => setNewName(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label className="label-text">Ubicación</label>
                                <input
                                    type="text" className="input-glass"
                                    placeholder="Ej: Entrada Frente"
                                    value={newLocation} onChange={e => setNewLocation(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isSubmitting}
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                {isSubmitting ? 'Creando...' : 'Crear Dispositivo'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Device List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {isLoading ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando...</p>
                    ) : devices.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hay dispositivos registrados.</p>
                    ) : (
                        devices.map(dev => (
                            <div key={dev.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Cpu size={20} color="var(--accent-gold)" />
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{dev.name}</h4>
                                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>ID: {dev.id} • {dev.location}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(dev.id)}
                                    className="btn-icon-glass"
                                    style={{ width: '36px', height: '36px', color: '#ff4d4d' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Token Modal */}
            {showTokenModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '30px', border: '1px solid var(--accent-gold)' }}>
                        <h2 style={{ color: 'var(--accent-gold)', marginBottom: '16px', fontSize: '1.4rem' }}>¡Dispositivo Creado!</h2>

                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Guarda estos datos. El token <strong>no</strong> se volverá a mostrar.
                        </p>

                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>DEVICE ID</span>
                                <span style={{ color: '#fff', fontWeight: 'bold' }}>{createdDevice?.id}</span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>DEVICE TOKEN</span>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.05)', padding: '10px',
                                borderRadius: '6px', wordBreak: 'break-all',
                                fontSize: '0.85rem', color: 'var(--accent-cyan)',
                                maxHeight: '100px', overflowY: 'auto'
                            }}>
                                {createdDevice?.token}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                style={{
                                    background: 'transparent', border: '1px solid var(--accent-cyan)',
                                    color: 'var(--accent-cyan)', padding: '8px', borderRadius: '6px',
                                    width: '100%', marginTop: '12px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                {copiedToken ? <Check size={16} /> : <Copy size={16} />}
                                {copiedToken ? 'Copiado' : 'Copiar Token'}
                            </button>
                        </div>

                        <button
                            className="btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => setShowTokenModal(false)}
                        >
                            Entendido, Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
