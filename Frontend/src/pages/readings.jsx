import React, { useEffect, useState } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import socket from "../api/socket"
import api from "../api/axios"
import MeterDetails from "../components/meterDetails"
import LiveReadingCard from "../components/liveReadingCard"

const Readings = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [meterId, setMeterId] = useState(location.state?.meterId || "")
  const [availableMeters, setAvailableMeters] = useState([])

  const [readings, setReadings] = useState([])
  const [selectedReading, setSelectedReading] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Fetch available meters for easy switching if none or switching
  useEffect(() => {
    const fetchMeters = async () => {
      try {
        const res = await api.post("/meter/all")
        const list = res.data?.meters || []
        setAvailableMeters(list)
        if (list.length > 0) {
          setMeterId((current) => current || list[0]._id)
        }
      } catch (err) {
        console.error("Error fetching meters list:", err)
      }
    }
    fetchMeters()
  }, [])

  // Fetch readings whenever selected meterId changes
  useEffect(() => {
    if (!meterId) {
      setMessage("No meter selected yet.")
      setReadings([])
      return
    }

    const fetchInitialReadings = async () => {
      setLoading(true)
      setMessage("")
      try {
        const res = await api.post("/readings/view", { meter: meterId })
        setReadings(res.data?.readings || [])
      } catch (err) {
        console.error("Error fetching readings:", err)
        setMessage("Failed to fetch readings.")
      } finally {
        setLoading(false)
      }
    }

    fetchInitialReadings()
  }, [meterId])

  // Real-time socket updates for new readings
  useEffect(() => {
    if (!meterId) return

    const handleNewReading = (reading) => {
      const readingMeterId = reading.meter?._id || reading.meter
      if (readingMeterId === meterId) {
        setReadings((prev) => [reading, ...prev])
      }
    }

    socket.on("new-reading", handleNewReading)

    return () => {
      socket.off("new-reading", handleNewReading)
    }
  }, [meterId])

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] text-gray-200 flex-col items-center justify-center p-10 rounded-r-3xl">
        <h1 className="text-4xl font-bold mb-4 text-white">Smart Meter Portal</h1>
        <p className="text-gray-400 text-center max-w-md leading-relaxed mb-6">
          Monitor your real-time meter readings, energy consumption and power status.
        </p>
        <Link to="/dashboard" className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-white rounded-xl text-sm font-medium transition">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-start px-6 py-10">
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Meter Readings
            </h2>
            <Link to="/dashboard" className="lg:hidden text-sm text-indigo-600 font-medium">
              Dashboard →
            </Link>
          </div>

          {/* Meter selector if multiple meters exist */}
          {availableMeters.length > 0 && (
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                Select Meter
              </label>
              <select
                value={meterId}
                onChange={(e) => setMeterId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-700 bg-white"
              >
                {availableMeters.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name || `Meter ${m.serialNumber}`} ({m.location || "No location"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Meter Details */}
          {meterId ? (
            <MeterDetails 
              meterId={meterId} 
              onDeleted={() => {
                setMeterId("")
                navigate("/meterList")
              }} 
            />
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-xl mb-6">
              <p className="text-gray-500 mb-3">No meter selected.</p>
              <Link to="/meterList" className="text-sm font-medium text-indigo-600 hover:underline">
                Choose a meter from the list
              </Link>
            </div>
          )}

          {message && <p className="text-red-600 text-center mb-4">{message}</p>}

          <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Readings</h3>

          {loading ? (
            <p className="text-gray-500 animate-pulse text-center py-4">Loading readings...</p>
          ) : readings.length === 0 ? (
            <p className="text-gray-500 text-center py-6 border border-dashed border-gray-200 rounded-xl">
              No readings found for this meter.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {readings.map((reading) => (
                <LiveReadingCard
                  key={reading._id}
                  reading={reading}
                  onView={setSelectedReading}
                />
              ))}
            </div>
          )}

          {/* Selected Reading Details */}
          {selectedReading && (
            <div className="mt-6 bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-800">Reading Snapshot</h3>
                <button
                  onClick={() => setSelectedReading(null)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Close ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-gray-700 text-sm">
                <p><span className="font-semibold text-gray-500">ID:</span> <span className="font-mono text-xs">{selectedReading._id}</span></p>
                <p><span className="font-semibold text-gray-500">Status:</span> <span className="capitalize">{selectedReading.status}</span></p>
                <p><span className="font-semibold text-gray-500">Energy:</span> {selectedReading.energy_consumed} kWh</p>
                <p><span className="font-semibold text-gray-500">Voltage:</span> {selectedReading.voltage} V</p>
                <p><span className="font-semibold text-gray-500">Current:</span> {selectedReading.current} A</p>
                <p><span className="font-semibold text-gray-500">Date:</span> {new Date(selectedReading.timestamp).toLocaleString()}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Readings
