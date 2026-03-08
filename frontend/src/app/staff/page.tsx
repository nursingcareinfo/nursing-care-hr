'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { 
  Search, 
  Plus, 
  Filter, 
  Download,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Shield,
  Loader2
} from 'lucide-react'

interface Staff {
  id: string
  assigned_id: string
  full_name: string
  designation: string
  contact_1: string
  official_district: string
  status: string
  pnc_expiry: string | null
}

const designations = ['All', 'R/N', 'BSN', 'NURSE_ASSISTANT', 'ATTENDANT', 'MID_WIFE', 'PHYSIOTHERAPIST', 'DOCTOR']
const districts = ['All', 'Korangi', 'Gulshan', 'Karachi South', 'Nazimabad', 'Malir', 'Keamari']
const statuses = ['All', 'Active', 'On Leave', 'Inactive']

export default function StaffPage() {
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<Staff[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDesignation, setSelectedDesignation] = useState('All')
  const [selectedDistrict, setSelectedDistrict] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  useEffect(() => {
    async function fetchStaff() {
      try {
        const { data, error } = await supabase.from('staff').select('*').order('full_name')
        if (data) setStaff(data)
        if (error) console.error('Error fetching staff:', error)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStaff()
  }, [])

  const filteredStaff = staff.filter(s => {
    const matchSearch = s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       s.assigned_id?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchDesignation = selectedDesignation === 'All' || s.designation === selectedDesignation
    const matchDistrict = selectedDistrict === 'All' || s.official_district === selectedDistrict
    const matchStatus = selectedStatus === 'All' || s.status === selectedStatus
    return matchSearch && matchDesignation && matchDistrict && matchStatus
  })

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="main-content flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading staff...</span>
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
              <h1 className="text-2xl font-bold">Staff Management</h1>
              <p className="text-gray-500">Manage your 1200+ nursing staff</p>
            </div>
            <div className="flex gap-3">
              <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button className="btn btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="card mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name, ID, CNIC..." 
                    className="input pl-10"
                  />
                </div>
              </div>
              <select className="input w-auto">
                {designations.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select className="input w-auto">
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select className="input w-auto">
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>

          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Contact</th>
                  <th>District</th>
                  <th>Status</th>
                  <th>PNC Expiry</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((s) => (
                  <tr key={s.id}>
                    <td className="font-mono text-sm">{s.assigned_id}</td>
                    <td className="font-medium">{s.full_name}</td>
                    <td>
                      <span className="badge badge-info">{s.designation}</span>
                    </td>
                    <td className="text-sm">{s.contact_1}</td>
                    <td className="text-sm">{s.official_district}</td>
                    <td>
                      <span className="badge badge-success">{s.status}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{s.pnc_expiry || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <button className="p-2 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">Showing 1-5 of 1,200 staff members</p>
              <div className="flex gap-2">
                <button className="btn bg-gray-100 text-gray-700" disabled>Previous</button>
                <button className="btn bg-gray-100 text-gray-700">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
