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
const UploadDropzone = ({ onFileSelect, accept = '.csv,.xlsx', maxSizeMB = 50 }) => {
  return <div>UploadDropzone - TODO</div>
}
export default UploadDropzone
