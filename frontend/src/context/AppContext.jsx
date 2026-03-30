/**
 * CONTEXT: AppContext
 * Purpose: Global app state (active batch, selected ward filters, notifications)
 * Provides:
 *  - activeBatchId: string | null — currently active upload batch
 *  - setActiveBatchId
 *  - notifications: array — pending ASHA tasks alerts
 *  - hasDataset: boolean — whether any dataset has been uploaded
 */
import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export const AppProvider = ({ children }) => {
  const [activeBatchId, setActiveBatchId] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [hasDataset, setHasDataset] = useState(false)

  const addNotification = (msg) => {
    setNotifications((prev) => [{ id: Date.now(), msg }, ...prev])
  }

  return (
    <AppContext.Provider value={{
      activeBatchId, setActiveBatchId,
      notifications, addNotification,
      hasDataset, setHasDataset,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
