'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

interface Shift {
  id: string
  staff_id: string
  patient_id: string
  shift_date: string
  start_time: string
  end_time: string
  status: string
}

export default function SchedulingPage() {
  const [loading, setLoading] = useState(true)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    async function fetchShifts() {
      try {
        const { data, error } = await supabase
          .from('shifts')
          .select('*')
          .order('shift_date', { ascending: true })
          
        if (data) setShifts(data)
        if (error) console.error('Error fetching shifts:', error)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchShifts()
  }, [])

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="main-content flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading shifts...</span>
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
              <h1 className="text-2xl font-bold">Scheduling</h1>
              <p className="text-gray-500">Manage shifts and staff assignments</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn bg-gray-100 text-gray-700">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium">March 2026</span>
              <button className="btn bg-gray-100 text-gray-700">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="btn btn-primary ml-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Shift
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="bg-sky-100 p-2 rounded">
                  <Clock className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <div className="stat-value">245</div>
                  <div className="stat-label">Today&apos;s Shifts</div>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="stat-value">198</div>
                  <div className="stat-label">Confirmed</div>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="stat-value">47</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="stat-value">0</div>
                  <div className="stat-label">Unassigned</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="p-3 text-left bg-gray-50 sticky left-0">Staff</th>
                    {days.map((day, i) => (
                      <th key={day} className="p-3 text-center bg-gray-50 min-w-[150px]">
                        <div className="font-medium">{day}</div>
                        <div className="text-xs text-gray-500">{7 + i}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 font-medium bg-gray-50 sticky left-0">Abdullah (R/N)</td>
                    <td className="p-2"></td>
                    <td className="p-2">
                      <div className="bg-sky-100 rounded p-2 text-xs">
                        <div className="font-medium">Ahmed Khan</div>
                        <div>08:00-16:00</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="bg-sky-100 rounded p-2 text-xs">
                        <div className="font-medium">Fatima B</div>
                        <div>08:00-16:00</div>
                      </div>
                    </td>
                    <td className="p-2"></td>
                    <td className="p-2"></td>
                    <td className="p-2"></td>
                    <td className="p-2"></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium bg-gray-50 sticky left-0">Amanullah (BSN)</td>
                    <td className="p-2">
                      <div className="bg-purple-100 rounded p-2 text-xs">
                        <div className="font-medium">Rahimullah</div>
                        <div>12:00-20:00</div>
                      </div>
                    </td>
                    <td className="p-2"></td>
                    <td className="p-2">
                      <div className="bg-purple-100 rounded p-2 text-xs">
                        <div className="font-medium">Patient D</div>
                        <div>08:00-16:00</div>
                      </div>
                    </td>
                    <td className="p-2"></td>
                    <td className="p-2"></td>
                    <td className="p-2"></td>
                    <td className="p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
