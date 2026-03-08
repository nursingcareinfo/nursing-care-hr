'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { 
  Search, 
  Plus, 
  Filter,
  Phone,
  MapPin,
  Clock,
  Heart,
  Loader2
} from 'lucide-react'

interface Patient {
  id: string
  patient_id: string
  full_name: string
  care_type: string
  care_level: string
  district: string
  phone_1: string
  hourly_rate: number
  status: string
  start_date: string
}

export default function PatientsPage() {
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchPatients() {
      try {
        const { data, error } = await supabase.from('patients').select('*').order('full_name')
        if (data) setPatients(data)
        if (error) console.error('Error fetching patients:', error)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [])

  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient_id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="main-content flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading patients...</span>
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
              <h1 className="text-2xl font-bold">Patient Management</h1>
              <p className="text-gray-500">Manage patient care assignments</p>
            </div>
            <button className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </button>
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="stat-card">
              <div className="stat-value">980</div>
              <div className="stat-label">Active Patients</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">45</div>
              <div className="stat-label">New This Month</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">320</div>
              <div className="stat-label">High Care Level</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">15</div>
              <div className="stat-label">Discharged</div>
            </div>
          </div>

          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Care Type</th>
                  <th>Level</th>
                  <th>District</th>
                  <th>Hourly Rate</th>
                  <th>Status</th>
                  <th>Start Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono text-sm">{p.patient_id}</td>
                    <td className="font-medium">{p.full_name}</td>
                    <td>
                      <span className="badge badge-info">{p.care_type}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        p.care_level === 'High' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {p.care_level}
                      </span>
                    </td>
                    <td className="text-sm">{p.district}</td>
                    <td className="text-sm">PKR {p.hourly_rate}</td>
                    <td>
                      <span className="badge badge-success">{p.status}</span>
                    </td>
                    <td className="text-sm">{p.start_date}</td>
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
