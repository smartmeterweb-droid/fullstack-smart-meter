import React, { useEffect, useState } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import api from "../api/axios"

const NotificationDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = location.state || {} // get id from state

  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) {
      setError("No notification selected")
      setLoading(false)
      return
    }

    const fetchNotification = async () => {
      try {
        const res = await api.post("/notification/single", { id })
        if (res.data?.status === "ok" && res.data?.notification) {
          setNotification(res.data.notification)
        } else {
          setError(res.data?.msg || "Notification not found")
        }
      } catch (err) {
        console.error("Fetch notification error:", err)
        setError(err.response?.data?.msg || "Failed to load notification")
      } finally {
        setLoading(false)
      }
    }

    fetchNotification()
  }, [id])

  const markAsRead = async () => {
    try {
      await api.post("/notification/mark", { id })
      setNotification((prev) => (prev ? { ...prev, read: true } : prev))
    } catch (err) {
      console.error("Mark as read error:", err)
    }
  }

  const deleteNotification = async () => {
    try {
      await api.post("/notification/delete", { id })
      navigate("/notifications")
    } catch (err) {
      console.error("Delete notification error:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Loading notification...</p>
      </div>
    )
  }

  if (error || !notification) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <p className="text-red-500 text-lg">{error || "Notification not found"}</p>
        <Link to="/notifications" className="px-4 py-2 bg-[#0f172a] text-white rounded-lg text-sm">
          Back to Notifications
        </Link>
      </div>
    )
  }

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
        <div className="flex justify-between items-center mb-4">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase ${
            notification.type === 'error' ? 'bg-red-100 text-red-700' :
            notification.type === 'warning' ? 'bg-amber-100 text-amber-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {notification.type || "Alert"}
          </span>
          <span className="text-xs text-gray-400">
            {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ""}
          </span>
        </div>

        <h2 className="text-2xl font-bold mb-3 text-gray-800">{notification.title}</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">{notification.message}</p>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
          {!notification.read && (
            <button
              onClick={markAsRead}
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm font-medium"
            >
              Mark as Read
            </button>
          )}
          <button
            onClick={deleteNotification}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm font-medium"
          >
            Delete
          </button>
          <button
            onClick={() => navigate("/notifications")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition text-sm font-medium"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationDetails