import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/axios"

const MeterList = () => {
    const [meters, setMeters] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchMeters = async () => {
        setLoading(true)
        setError("")
        try {
            const res = await api.post("/meter/all")
            setMeters(res.data.meters || [])
        } catch (err) {
            console.error("Fetch meters error:", err)
            setError("Failed to fetch meters. Server might be warming up.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMeters()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center gap-2 py-4">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">Loading meters from database...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                <p className="text-red-600 text-sm">{error}</p>
                <button
                    onClick={fetchMeters}
                    className="text-xs font-semibold text-indigo-600 hover:underline ml-4"
                >
                    Retry
                </button>
            </div>
        )
    }

    if (meters.length === 0) {
        return <p className="text-gray-500">No meters found.</p>
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {meters.map((meter) => (
                <Link
                    key={meter._id}
                    to="/readings"
                    state={{ meterId: meter._id }}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition block border border-gray-100"
                >
                    <h4 className="text-lg font-bold mb-1 text-gray-800">{meter.name || `Meter ${meter._id}`}</h4>
                    <p className="text-gray-600 text-sm">
                        Status: <span className="font-medium capitalize">{meter.status || "Unknown"}</span>
                    </p>
                    <p className="text-gray-600 text-sm">
                        Location: {meter.location || "N/A"}
                    </p>
                    <p className="text-gray-600 text-sm">
                        Last Reading: {meter.lastReading ? meter.lastReading.energy_consumed + " kWh" : "N/A"}
                    </p>
                </Link>
            ))}
        </div>
    )
}

export default MeterList
