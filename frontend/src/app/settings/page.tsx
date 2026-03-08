import Sidebar from '@/components/Sidebar'
import { Save, Bell, Shield, Database, MessageSquare } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content">
        <header className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-500">Configure your system preferences</p>
        </header>
        <div className="p-8">
          <div className="max-w-2xl">
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="w-5 h-5 text-sky-600" />
                  <h2 className="text-lg font-semibold">Notifications</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'License expiry alerts', desc: 'Get notified 30/60/90 days before' },
                    { label: 'Shift reminders', desc: 'Send WhatsApp reminders to staff' },
                    { label: 'Payroll notifications', desc: 'Alert when payroll is ready' },
                    { label: 'New patient alerts', desc: 'Notify when new patient is added' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-sky-600" />
                  <h2 className="text-lg font-semibold">WhatsApp Integration</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number ID</label>
                    <input type="text" className="input" placeholder="123456789012345" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Access Token</label>
                    <input type="password" className="input" placeholder="••••••••••••" />
                  </div>
                  <p className="text-sm text-gray-500">Configure in Meta Developer Console</p>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-5 h-5 text-sky-600" />
                  <h2 className="text-lg font-semibold">Data Management</h2>
                </div>
                <div className="space-y-3">
                  <button className="btn bg-gray-100 text-gray-700 w-full justify-start">
                    Export All Data (CSV)
                  </button>
                  <button className="btn bg-gray-100 text-gray-700 w-full justify-start">
                    Backup to Google Sheets
                  </button>
                  <button className="btn bg-gray-100 text-gray-700 w-full justify-start">
                    Sync with Baserow
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="btn btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
