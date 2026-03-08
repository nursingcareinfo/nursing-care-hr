import Sidebar from '@/components/Sidebar'

export default function ReportsPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content">
        <header className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-500">Business insights and statistics</p>
        </header>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Staff Utilization', desc: 'Hours worked vs available', color: 'bg-sky-500' },
              { title: 'Revenue Report', desc: 'Monthly earnings breakdown', color: 'bg-emerald-500' },
              { title: 'Patient Satisfaction', desc: 'Feedback and ratings', color: 'bg-purple-500' },
              { title: 'Compliance Status', desc: 'Licenses and certifications', color: 'bg-amber-500' },
              { title: 'Payroll Summary', desc: 'Cost analysis by department', color: 'bg-rose-500' },
              { title: 'Shift Coverage', desc: 'District-wise coverage', color: 'bg-cyan-500' },
            ].map((report) => (
              <div key={report.title} className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className={`w-12 h-12 ${report.color} rounded-lg mb-4`} />
                <h3 className="font-semibold mb-1">{report.title}</h3>
                <p className="text-sm text-gray-500">{report.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
