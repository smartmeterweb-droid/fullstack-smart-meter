import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"

const MeterDetails = ({ meterId, onDeleted }) => {
  const navigate = useNavigate()
  const [meter, setMeter] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    if (!meterId) {
      setError("No meter selected yet.")
      return
    }

    const fetchMeterDetails = async () => {
      setLoading(true)
      setError("")

      try {
        const res = await api.post("/meter/single", { meterId })

        if (res.data.status === "ok") {
          const fetchedReadings = res.data.readings || []
          const fetchedMeter = res.data.meter || fetchedReadings[0]?.meter || null
          setMeter(fetchedMeter)
        } else {
          setError(res.data.msg || "Failed to fetch meter details")
        }
      } catch (err) {
        console.error("Fetch meter error:", err)
        setError("Error fetching meter details")
      } finally {
        setLoading(false)
      }
    }

    fetchMeterDetails()
  }, [meterId])

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this meter?")) return

    try {
      await api.post("/meter/delete", { 
        meter: { _id: meterId },
        meterId: meterId 
      })
      setSuccessMsg("Meter deleted successfully!")
      if (typeof onDeleted === "function") {
        onDeleted()
      } else {
        setTimeout(() => navigate("/dashboard"), 1500)
      }
    } catch (err) {
      console.error("Delete error:", err)
      alert("Failed to delete meter.")
    }
  }

  if (!meterId) return <p className="text-gray-500 mb-4">No meter selected.</p>
  if (loading) return <p className="text-gray-500 animate-pulse mb-4">Loading meter details...</p>
  if (error) return <p className="text-red-600 mb-4">{error}</p>
  if (!meter) return <p className="text-gray-500 mb-4">Meter details unavailable.</p>

  return (
    <div className="flex flex-col bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{meter.name || "Smart Meter"}</h2>
          <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase ${
            meter.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
          }`}>
            {meter.status || "Unknown"}
          </span>
        </div>
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs font-medium"
        >
          Delete Meter
        </button>
      </div>

      {successMsg && <p className="text-green-600 text-sm mb-3">{successMsg}</p>}

      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 bg-white p-4 rounded-xl border border-gray-100">
        <p><span className="font-semibold text-gray-500">Serial:</span> {meter.serialNumber || "N/A"}</p>
        <p><span className="font-semibold text-gray-500">Location:</span> {meter.location || "N/A"}</p>
      </div>
    </div>
  )
}

export default MeterDetails
