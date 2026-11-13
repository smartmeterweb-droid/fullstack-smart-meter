import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../api/axios"
import NotificationListener from "../components/notificationListener"

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  // Fetch all notifications from the backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.post("/notification/all")

        if (res?.data?.status === "ok" && Array.isArray(res.data.notifications)) {
          setNotifications(res.data.notifications)
        } else {
          setError(res?.data?.msg || "No notifications available")
          setNotifications([])
        }
      } catch (err) {
        console.error("Error fetching notifications:", err)
        setError("Error fetching notifications")
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleNewNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Loading notifications...</p>
      </div>
    )
  }

  if (error && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <p className="text-red-500 text-lg">{error}</p>
        <Link to="/dashboard" className="px-4 py-2 bg-[#0f172a] text-white rounded-lg text-sm">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] text-gray-200 flex-col items-center justify-center p-10 rounded-r-3xl">
        <h1 className="text-4xl font-bold mb-4 text-white">Smart Meter Portal</h1>
        <p className="text-gray-400 text-center max-w-md leading-relaxed mb-6">
          Stay updated with alerts and important notifications from your smart meters.
        </p>
        <Link to="/dashboard" className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-white rounded-xl text-sm font-medium transition">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Notifications & Alerts
            </h2>
            <Link to="/dashboard" className="lg:hidden text-sm text-indigo-600 font-medium">
              Dashboard →
            </Link>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No notifications available.</p>
            ) : (
              notifications.map((note) => (
                <Link
                  key={note._id}
                  to="/notificationDetails"
                  state={{ id: note._id }}
                  className={`w-full block px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition ${
                    note.read ? "bg-gray-50 text-gray-500" : "bg-white text-[#0f172a] shadow-sm font-medium"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      {!note.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                      )}
                      {note.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Real-time Notification listener */}
      <NotificationListener onNewNotification={handleNewNotification} />
    </div>
  )
}

export default Notifications
