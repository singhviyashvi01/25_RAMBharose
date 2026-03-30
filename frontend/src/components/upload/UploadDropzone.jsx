/**
 * COMPONENT: UploadDropzone
 * Purpose: Drag-and-drop file upload zone for hospital dataset CSV/XLSX.
 * Props:
 *  - onFileSelect: (file: File) => void
 *  - accept: string — default ".csv,.xlsx"
 *  - maxSizeMB: number — default 50
 * Features:
 *  - Drag active state (border highlight)
 *  - File type and size validation
 *  - Preview: shows selected filename + row estimate
 *  - Error messages for invalid files
 *  - "Download Sample CSV" link showing expected format
 * Used on: UploadPage
 */
import { useState, useRef } from 'react'

const UploadDropzone = ({ onFileSelect, accept = '.csv', maxSizeMB = 50 }) => {
  const [isDragActive, setIsDragActive] = useState(false)
  const [error, setError] = useState(null)
  const [file, setFile] = useState(null)
  const fileInputRef = useRef(null)

  const validateFile = (selectedFile) => {
    setError(null)
    if (!selectedFile) return false

    const isCSV = selectedFile.name.endsWith('.csv')
    if (!isCSV) {
      setError('Please upload a valid CSV file.')
      return false
    }

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSizeMB}MB.`)
      return false
    }

    return true
  }

  const handleFile = (selectedFile) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile)
      onFileSelect(selectedFile)
    }
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const onDragLeave = () => {
    setIsDragActive(false)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragActive(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFile(droppedFile)
  }

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all cursor-pointer ${
          isDragActive 
          ? "border-blue-500 bg-blue-50/50" 
          : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900">
            {file ? file.name : "Click to upload or drag and drop"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {file 
              ? `${(file.size / 1024).toFixed(1)} KB` 
              : `Hospital clinical dataset (CSV up to ${maxSizeMB}MB)`
            }
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600">
            {error}
          </div>
        )}

        {!file && (
          <div className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>First time?</span>
            <a 
              href="/sample_patients.csv" 
              download
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:underline"
            >
              Download Sample CSV
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
export default UploadDropzone
