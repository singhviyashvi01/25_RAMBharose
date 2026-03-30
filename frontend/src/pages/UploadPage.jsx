/**
 * PAGE: UploadPage
 * Route: /upload
 * Purpose: One-time (or recurring) dataset upload from hospital.
 * Features:
 *  - Drag-and-drop OR file picker for CSV/XLSX
 *  - Column mapping preview (shows detected columns vs expected)
 *  - Validation errors shown per row
 *  - Submit → POST /api/upload → triggers ML pipeline
 *  - Live progress bar during processing
 *  - Upload summary (X patients processed, Y high-risk found)
 *  - Navigate to Dashboard after success
 *  - Upload history table (batch_id, date, record count)
 */
const UploadPage = () => {
  return <div>UploadPage - TODO</div>
}
export default UploadPage
