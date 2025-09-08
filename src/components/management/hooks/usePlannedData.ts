import { useState, useEffect } from "react"

function isSessionValid() {
  const token = localStorage.getItem("token")
  return token && !isTokenExpired(token)
}

function isTokenExpired(token: string) {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]))
    return exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export function usePlannedData() {
  const [plannedData, setPlannedData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlannedData = () => {
    const token = localStorage.getItem("token")

    if (!isSessionValid()) {
      setPlannedData([])
      setLoading(false)
      setError("❌ Sesión no válida o expirada")
      return
    }

    // Eliminar cache previo antes de pedir nueva data
    localStorage.removeItem("plannedData")
    localStorage.removeItem("planned_timestamp")

    fetch(`${import.meta.env.PUBLIC_URL_BACKEND}planned-data/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`)
        return res.json()
      })
      .then((data) => {
        localStorage.setItem("plannedData", JSON.stringify(data))
        localStorage.setItem("planned_timestamp", Date.now().toString())
        setPlannedData(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // Revisa cache al inicio
    const cached = localStorage.getItem("plannedData")
    if (cached) {
      setPlannedData(JSON.parse(cached))
      setLoading(false)
    }
    // De todas formas intenta refrescar datos
    fetchPlannedData()
  }, [])

  return { plannedData, loading, error, fetchPlannedData }
}
