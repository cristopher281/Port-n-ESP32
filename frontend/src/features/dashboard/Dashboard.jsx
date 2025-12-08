import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import Card from '../../components/common/Card'

export default function Dashboard() {
  const [latest, setLatest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await api.get('/sensors/latest/1')
        setLatest(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLatest()
  }, [])

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="cards">
          <Card title="Última lectura">
            {latest ? (
              <div>
                <div>Sensor: {latest.sensor_type}</div>
                <div>Valor: {latest.value} {latest.unit}</div>
                <div>Timestamp: {latest.timestamp}</div>
              </div>
            ) : (
              <div>No hay lecturas</div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
