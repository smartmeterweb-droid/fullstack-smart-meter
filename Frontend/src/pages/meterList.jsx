import React, { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../api/axios"

const MeterList = () => {
  const [meters, setMeters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const fetchMeters = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await api.post("/meter/all")
      setMeters(res.data.meters || [])
    } catch (err) {
      console.error("Fetch meters error:", err)
      setError("Failed to fetch meters. The backend server might still be waking up.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeters()
  }, [])

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 text-base font-medium">Loading meters from database...</p>
        <p className="text-gray-400 text-xs">If the server was asleep, this can take a few seconds.</p>
      </div>
    )

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4 p-6">
        <p className="text-red-500 text-lg text-center max-w-md">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={fetchMeters}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
          <Link to="/dashboard" className="px-5 py-2.5 bg-[#0f172a] text-white rounded-xl text-sm font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left dark panel */}
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] text-gray-200 flex-col items-center justify-center p-10 rounded-r-3xl">
        <h1 className="text-4xl font-bold mb-4 text-white">Smart Meter Portal</h1>
        <p className="text-gray-400 text-center max-w-md leading-relaxed mb-6">
          Here you can see all your registered meters and their latest readings.
          Click on any meter to view its detailed readings and status.
        </p>
        <Link to="/dashboard" className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-white rounded-xl text-sm font-medium transition">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Right content panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              My Meters
            </h2>
            <Link to="/dashboard" className="lg:hidden text-sm text-indigo-600 font-medium">
              Dashboard →
            </Link>
          </div>
          <p className="text-gray-500 mb-6">
            Below are all meters currently registered in the system.
          </p>

          {meters.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No meters found.</p>
              <Link to="/addMeter" className="px-4 py-2 bg-[#0f172a] text-white rounded-lg text-sm">
                Add Your First Meter
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {meters.map((meter) => (
                <div
                  key={meter._id}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {meter.name || `Meter ${meter._id}`}
                    </p>
                    <p className="text-sm mt-1 text-gray-600">
                      Status: <span className="capitalize">{meter.status || "Unknown"}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Serial: {meter.serialNumber || "N/A"} | Location: {meter.location || "N/A"}
                    </p>
                    {meter.lastReading && (
                      <p className="text-xs text-indigo-600 mt-1 font-medium">
                        Last Reading: {meter.lastReading.energy_consumed} kWh ({meter.lastReading.status})
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      navigate("/readings", { state: { meterId: meter._id } })
                    }
                    className="px-4 py-2 bg-[#0f172a] text-white text-sm rounded-lg hover:bg-[#1e293b] transition"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MeterList
