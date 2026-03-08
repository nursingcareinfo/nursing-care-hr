'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { 
  DollarSign, 
  Download, 
  CheckCircle,
  Clock,
  FileText,
  Loader2
} from 'lucide-react'

interface Payroll {
  id: string
  staff_id: string
  period_start: string
  period_end: string
  regular_hours: number
  overtime_hours: number
  hourly_rate: number
  gross_amount: number
  deductions: number
  net_amount: number
  status: string
}

export default function PayrollPage() {
  const [loading, setLoading] = useState(true)
  const [payrollData, setPayrollData] = useState<Payroll[]>([])

  useEffect(() => {
    async function fetchPayroll() {
      try {
        const { data, error } = await supabase
          .from('payroll')
          .select('*')
          .order('period_start', { ascending: false })
          
        if (data) setPayrollData(data)
        if (error) console.error('Error fetching payroll:', error)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPayroll()
  }, [])

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="main-content flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading payroll...</span>
          </div>
        </main>
      </div>
    )
  }
  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content">
        <header className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Payroll Management</h1>
              <p className="text-gray-500">Process and manage staff salaries</p>
            </div>
            <div className="flex gap-3">
              <button className="btn bg-gray-100 text-gray-700">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </button>
              <button className="btn btn-primary">
                <DollarSign className="w-4 h-4 mr-2" />
                Generate Payroll
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="stat-card">
              <div className="stat-value">PKR 12.5M</div>
              <div className="stat-label">Monthly Total</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">1,180</div>
              <div className="stat-label">Staff to Pay</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">245</div>
              <div className="stat-label">Processed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">935</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Payroll Period: March 2026</h2>
              <div className="flex gap-2">
                <button className="btn bg-gray-100 text-gray-700">Export All</button>
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Staff</th>
                  <th>Period</th>
                  <th>Regular Hrs</th>
                  <th>OT Hrs</th>
                  <th>Gross</th>
                  <th>Deductions</th>
                  <th>Net</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.map((pay) => (
                  <tr key={pay.id}>
                    <td className="font-mono text-sm">{pay.id}</td>
                    <td className="font-medium">{pay.staff_id}</td>
                    <td className="text-sm">{pay.period_start} - {pay.period_end}</td>
                    <td className="text-sm">{pay.regular_hours}</td>
                    <td className="text-sm">{pay.overtime_hours}</td>
                    <td className="text-sm">PKR {pay.gross_amount?.toLocaleString()}</td>
                    <td className="text-sm text-red-600">-PKR {pay.deductions?.toLocaleString()}</td>
                    <td className="text-sm font-medium">PKR {pay.net_amount?.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${
                        pay.status === 'Paid' ? 'badge-success' :
                        pay.status === 'Approved' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
