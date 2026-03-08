'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  UserRound, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Shield,
  X,
  Plus,
  UserPlus,
  Activity,
  Baby,
  Loader2
} from 'lucide-react'

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden transform scale-100">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

interface Staff {
  id: string
  assigned_id: string
  full_name: string
  designation: string
  status: string
  official_district: string
}

interface Patient {
  id: string
  patient_id: string
  full_name: string
  care_type: string
  status: string
  district: string
}

export default function Dashboard() {
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<Staff[]>([])
  const [patients, setPatients] = useState<Patient[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [staffRes, patientsRes] = await Promise.all([
          supabase.from('staff').select('*'),
          supabase.from('patients').select('*')
        ])
        
        if (staffRes.data) setStaff(staffRes.data)
        if (patientsRes.data) setPatients(patientsRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const stats = [
    { label: 'Total Staff', value: staff.length.toLocaleString(), icon: Users, color: 'from-blue-500 to-cyan-400', change: `${staff.filter(s => s.status === 'Active').length} active`, changeType: 'up' },
    { label: 'Active Patients', value: patients.length.toString(), icon: UserRound, color: 'from-emerald-500 to-teal-400', change: `${patients.filter(p => p.status === 'Active').length} active`, changeType: 'up' },
    { label: "Today's Shifts", value: '0', icon: Calendar, color: 'from-amber-500 to-orange-400', change: 'Coming soon', changeType: 'neutral' },
    { label: 'Monthly Payroll', value: 'PKR 0', icon: DollarSign, color: 'from-purple-500 to-pink-400', change: 'Coming soon', changeType: 'neutral' },
  ]

  const designations = [
    { name: 'Registered Nurse (R/N)', count: staff.filter(s => s.designation === 'R/N').length, color: 'from-blue-500 to-cyan-400', icon: Activity },
    { name: 'Nurse Assistant', count: staff.filter(s => s.designation === 'NURSE_ASSISTANT').length, color: 'from-emerald-500 to-teal-400', icon: Users },
    { name: 'Attendant', count: staff.filter(s => s.designation === 'ATTENDANT').length, color: 'from-amber-500 to-orange-400', icon: UserRound },
    { name: 'BSN', count: staff.filter(s => s.designation === 'BSN').length, color: 'from-purple-500 to-pink-400', icon: Activity },
    { name: 'Physiotherapist', count: staff.filter(s => s.designation === 'PHYSIOTHERAPIST').length, color: 'from-rose-500 to-red-400', icon: Activity },
    { name: 'Mid Wife', count: staff.filter(s => s.designation === 'MID_WIFE').length, color: 'from-cyan-500 to-blue-400', icon: Baby },
    { name: 'Baby Sitter', count: staff.filter(s => s.designation === 'BABY_SITTER').length, color: 'from-violet-500 to-purple-400', icon: Baby },
  ]

  const alerts = [
    { type: 'info', message: 'Connect Supabase to see alerts', icon: Shield, count: 0, days: 'Setup' },
  ]

  const districts = [
    { name: 'Korangi', staff: staff.filter(s => s.official_district === 'Korangi').length, coverage: 0, patients: patients.filter(p => p.district === 'Korangi').length },
    { name: 'Gulshan', staff: staff.filter(s => s.official_district === 'Gulshan').length, coverage: 0, patients: patients.filter(p => p.district === 'Gulshan').length },
    { name: 'Karachi South', staff: staff.filter(s => s.official_district === 'Karachi South').length, coverage: 0, patients: patients.filter(p => p.district === 'Karachi South').length },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-8 py-6 sticky top-0 z-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-slate-500">Welcome back! Here&apos;s your business overview.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAddStaff(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              >
                <UserPlus className="w-4 h-4" />
                Add Staff
              </button>
              <button 
                onClick={() => setShowAddPatient(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Patient
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-full ${
                    stat.changeType === 'up' ? 'bg-emerald-100 text-emerald-700' :
                    stat.changeType === 'down' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Staff by Designation
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {designations.map((item) => (
                    <div key={item.name} className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 hover:border-slate-300 transition-all duration-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color}`}>
                          <item.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-sm text-slate-700">{item.name}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-900">{item.count}</span>
                        <div className="flex-1 mx-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${item.color} rounded-full`} style={{ width: `${(item.count / 500) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 mb-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Alerts
                </h2>
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div key={index} className={`p-4 rounded-xl flex items-start gap-3 ${
                      alert.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
                      alert.type === 'danger' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <alert.icon className={`w-5 h-5 mt-0.5 ${
                        alert.type === 'warning' ? 'text-amber-600' :
                        alert.type === 'danger' ? 'text-red-600' : 'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{alert.message}</p>
                        <p className="text-xs mt-1 flex items-center justify-between">
                          <span className={alert.type === 'danger' ? 'text-red-600' : alert.type === 'warning' ? 'text-amber-600' : 'text-blue-600'}>{alert.count} items</span>
                          <span className="text-slate-400">{alert.days}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-200">
                  View All Alerts
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 shadow-lg shadow-blue-500/25 text-white">
                <h2 className="text-lg font-bold mb-2">Quick Actions</h2>
                <p className="text-blue-100 text-sm mb-4">Fast access to common tasks</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setShowAddStaff(true)} className="py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all duration-200">
                    + Add Staff
                  </button>
                  <button onClick={() => setShowAddPatient(true)} className="py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all duration-200">
                    + Add Patient
                  </button>
                  <button className="py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all duration-200">
                    Create Shift
                  </button>
                  <button className="py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all duration-200">
                    Payroll
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              District Coverage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {districts.map((item) => (
                <div key={item.name} className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 hover:border-slate-300 transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.coverage >= 90 ? 'bg-emerald-100 text-emerald-700' :
                      item.coverage >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.coverage}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                    <div className={`h-full rounded-full transition-all duration-500 ${
                      item.coverage >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                      item.coverage >= 70 ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-gradient-to-r from-red-500 to-rose-400'
                    }`} style={{ width: `${item.coverage}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{item.staff} staff</span>
                    <span className="text-slate-500">{item.patients} patients</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Modal isOpen={showAddStaff} onClose={() => setShowAddStaff(false)} title="Add New Staff">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
              <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Select designation</option>
                <option>R/N</option>
                <option>BSN</option>
                <option>Nurse Assistant</option>
                <option>Attendant</option>
                <option>Mid Wife</option>
                <option>Physiotherapist</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0300-1234567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
              <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Select district</option>
                <option>Korangi</option>
                <option>Gulshan</option>
                <option>Karachi South</option>
                <option>Nazimabad</option>
                <option>Malir</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate (PKR)</label>
            <input type="number" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="500" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowAddStaff(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-200">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all duration-200">
              Add Staff
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAddPatient} onClose={() => setShowAddPatient(false)} title="Add New Patient">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
            <input type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Enter patient name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Care Type</label>
              <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option>Select care type</option>
                <option>ICU</option>
                <option>Elderly</option>
                <option>Pediatric</option>
                <option>Post-surgical</option>
                <option>Mother & Baby</option>
                <option>General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Care Level</label>
              <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option>Select level</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <textarea className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" rows={2} placeholder="Full address" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="0300-1234567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate (PKR)</label>
              <input type="number" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="800" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowAddPatient(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-200">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all duration-200">
              Add Patient
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
