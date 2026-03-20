'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { 
  Users, 
  UserRound, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Shield,
  UserPlus,
  Activity,
  Baby,
  Plus
} from 'lucide-react'

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
    { label: 'Total Staff', value: staff.length.toLocaleString(), icon: Users, change: `${staff.filter(s => s.status === 'Active').length} active`, changeType: 'up' },
    { label: 'Active Patients', value: patients.length.toString(), icon: UserRound, change: `${patients.filter(p => p.status === 'Active').length} active`, changeType: 'up' },
    { label: "Today's Shifts", value: '0', icon: Calendar, change: 'Coming soon', changeType: 'neutral' },
    { label: 'Monthly Payroll', value: 'PKR 0', icon: DollarSign, change: 'Coming soon', changeType: 'neutral' },
  ]

  const designations = [
    { name: 'Registered Nurse (R/N)', count: staff.filter(s => s.designation === 'R/N').length, icon: Activity },
    { name: 'Nurse Assistant', count: staff.filter(s => s.designation === 'NURSE_ASSISTANT').length, icon: Users },
    { name: 'Attendant', count: staff.filter(s => s.designation === 'ATTENDANT').length, icon: UserRound },
    { name: 'BSN', count: staff.filter(s => s.designation === 'BSN').length, icon: Activity },
    { name: 'Physiotherapist', count: staff.filter(s => s.designation === 'PHYSIOTHERAPIST').length, icon: Activity },
    { name: 'Mid Wife', count: staff.filter(s => s.designation === 'MID_WIFE').length, icon: Baby },
    { name: 'Baby Sitter', count: staff.filter(s => s.designation === 'BABY_SITTER').length, icon: Baby },
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
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Spinner />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header 
        title="Dashboard" 
        subtitle="Welcome back! Here's your business overview."
        actions={
          <>
            <Button onClick={() => setShowAddStaff(true)}>
              <UserPlus className="w-4 h-4" />
              Add Staff
            </Button>
            <Button variant="secondary" onClick={() => setShowAddPatient(true)}>
              <Plus className="w-4 h-4" />
              Add Patient
            </Button>
          </>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-ambient transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-primary-fixed-dim">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <Badge variant={stat.changeType === 'up' ? 'success' : 'default'}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </Badge>
              </div>
              <div className="text-3xl font-bold text-on-surface font-display">{stat.value}</div>
              <div className="text-sm text-on-surface-variant mt-1">{stat.label}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold flex items-center gap-2 text-on-surface">
                  <Users className="w-5 h-5 text-primary" />
                  Staff by Designation
                </h2>
              </CardHeader>
              <div className="grid grid-cols-2 gap-4">
                {designations.map((item) => (
                  <div key={item.name} className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary-fixed-dim">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm text-on-surface">{item.name}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold text-on-surface font-display">{item.count}</span>
                      <div className="flex-1 mx-3 h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(item.count / 500) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-bold flex items-center gap-2 text-on-surface">
                  <AlertTriangle className="w-5 h-5 text-secondary-container" />
                  Alerts
                </h2>
              </CardHeader>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div key={index} className="p-4 rounded-xl bg-surface-container-low">
                    <div className="flex items-start gap-3">
                      <alert.icon className="w-5 h-5 mt-0.5 text-secondary-container" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-on-surface">{alert.message}</p>
                        <p className="text-xs mt-1 flex items-center justify-between">
                          <span className="text-on-surface-variant">{alert.count} items</span>
                          <span className="text-on-surface-variant">{alert.days}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="w-full mt-4">
                View All Alerts
              </Button>
            </Card>

            <Card className="bg-gradient-to-br from-primary to-primary-container text-white">
              <CardContent>
                <h2 className="text-lg font-bold mb-2">Quick Actions</h2>
                <p className="text-primary-fixed text-sm mb-4">Fast access to common tasks</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" onClick={() => setShowAddStaff(true)} className="bg-white/20 hover:bg-white/30 text-white border-0">
                    + Add Staff
                  </Button>
                  <Button variant="secondary" onClick={() => setShowAddPatient(true)} className="bg-white/20 hover:bg-white/30 text-white border-0">
                    + Add Patient
                  </Button>
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                    Create Shift
                  </Button>
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                    Payroll
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold flex items-center gap-2 text-on-surface">
              <Activity className="w-5 h-5 text-primary" />
              District Coverage
            </h2>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {districts.map((item) => (
              <div key={item.name} className="p-4 rounded-xl bg-surface-container-low">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-on-surface">{item.name}</span>
                  <Badge variant={item.coverage >= 90 ? 'success' : item.coverage >= 70 ? 'warning' : 'error'}>
                    {item.coverage}%
                  </Badge>
                </div>
                <div className="h-2 bg-surface-container-high rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full transition-all duration-500 ${
                    item.coverage >= 90 ? 'bg-primary' :
                    item.coverage >= 70 ? 'bg-secondary-container' : 'bg-error'
                  }`} style={{ width: `${item.coverage}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">{item.staff} staff</span>
                  <span className="text-on-surface-variant">{item.patients} patients</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal isOpen={showAddStaff} onClose={() => setShowAddStaff(false)} title="Add New Staff">
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" placeholder="Enter full name" />
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Designation</label>
              <select className="w-full px-4 py-2.5 rounded-lg bg-surface-container-highest text-on-surface">
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
            <Input label="Phone Number" placeholder="0300-1234567" />
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">District</label>
              <select className="w-full px-4 py-2.5 rounded-lg bg-surface-container-highest text-on-surface">
                <option>Select district</option>
                <option>Korangi</option>
                <option>Gulshan</option>
                <option>Karachi South</option>
                <option>Nazimabad</option>
                <option>Malir</option>
              </select>
            </div>
          </div>
          <Input label="Hourly Rate (PKR)" type="number" placeholder="500" />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddStaff(false)} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">
              Add Staff
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAddPatient} onClose={() => setShowAddPatient(false)} title="Add New Patient">
        <form className="space-y-4">
          <Input label="Patient Name" placeholder="Enter patient name" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Care Type</label>
              <select className="w-full px-4 py-2.5 rounded-lg bg-surface-container-highest text-on-surface">
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
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Care Level</label>
              <select className="w-full px-4 py-2.5 rounded-lg bg-surface-container-highest text-on-surface">
                <option>Select level</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Address</label>
            <textarea className="w-full px-4 py-2.5 rounded-lg bg-surface-container-highest text-on-surface" rows={2} placeholder="Full address" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" placeholder="0300-1234567" />
            <Input label="Hourly Rate (PKR)" type="number" placeholder="800" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddPatient(false)} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">
              Add Patient
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
