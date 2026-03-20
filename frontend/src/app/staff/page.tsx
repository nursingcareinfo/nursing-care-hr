'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Search, 
  Plus, 
  Filter, 
  Download,
  MoreVertical,
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Spinner />
          <span>Loading staff...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Staff Management" 
        subtitle={`Manage your ${staff.length} nursing staff`}
        actions={
          <>
            <Button variant="secondary">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button>
              <Plus className="w-4 h-4" />
              Add Staff
            </Button>
          </>
        }
      />

      <div className="p-8">
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <Input 
                  type="text" 
                  placeholder="Search by name, ID, CNIC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select 
              className="px-4 py-2.5 rounded-lg bg-surface-container-highest text-on-surface"
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
            >
              {designations.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select 
              className="px-4 py-2.5 rounded-lg bg-surface-container-highest text-on-surface"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select 
              className="px-4 py-2.5 rounded-lg bg-surface-container-highest text-on-surface"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Button variant="secondary">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left py-4 px-4 font-semibold text-on-surface">ID</th>
                  <th className="text-left py-4 px-4 font-semibold text-on-surface">Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-on-surface">Designation</th>
                  <th className="text-left py-4 px-4 font-semibold text-on-surface">Contact</th>
                  <th className="text-left py-4 px-4 font-semibold text-on-surface">District</th>
                  <th className="text-left py-4 px-4 font-semibold text-on-surface">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-on-surface">PNC Expiry</th>
                  <th className="text-left py-4 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((s) => (
                  <tr key={s.id} className="border-b border-surface-container-low hover:bg-surface-container-lowest">
                    <td className="py-4 px-4 font-mono text-sm text-on-surface-variant">{s.assigned_id}</td>
                    <td className="py-4 px-4 font-medium text-on-surface">{s.full_name}</td>
                    <td className="py-4 px-4">
                      <Badge variant="info">{s.designation}</Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-on-surface-variant">{s.contact_1}</td>
                    <td className="py-4 px-4 text-sm text-on-surface-variant">{s.official_district}</td>
                    <td className="py-4 px-4">
                      <Badge variant="success">{s.status}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-on-surface-variant" />
                        <span className="text-sm text-on-surface-variant">{s.pnc_expiry || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant">
            <p className="text-sm text-on-surface-variant">
              Showing {filteredStaff.length} of {staff.length} staff members
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled>Previous</Button>
              <Button variant="secondary">Next</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
