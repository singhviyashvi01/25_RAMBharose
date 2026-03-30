/**
 * COMPONENT: PageHeader
 * Purpose: Consistent page title + subtitle + optional action button.
 * Props:
 *  - title: string
 *  - subtitle: string
 *  - action: ReactNode — optional button on the right (e.g., "Export", "Auto-Assign")
 * Example:
 *   <PageHeader
 *     title="Patient List"
 *     subtitle="1,247 patients across 8 wards"
 *     action={<button>Export CSV</button>}
 *   />
 */
const PageHeader = ({ title, subtitle, action }) => {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm font-medium text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
      
      {action && (
        <div className="flex w-full items-center gap-3 md:w-auto">
          {action}
        </div>
      )}
    </div>
  )
}
export default PageHeader
