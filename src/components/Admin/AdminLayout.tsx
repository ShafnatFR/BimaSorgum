import React from 'react'
import { LayoutDashboard, MessageSquare, Flag, BookOpen, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../lib/AuthProvider'
import { navigateToSlug, RouteSlugs } from '../../utils/slugRouter'

interface AdminLayoutProps {
  children: React.ReactNode
  active?: string
}

export function AdminLayout({ children, active = 'dashboard' }: AdminLayoutProps) {
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigateToSlug(RouteSlugs.home())
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'komentar', label: 'Komentar', icon: MessageSquare },
    { id: 'laporan', label: 'Laporan', icon: Flag },
    { id: 'resep', label: 'Resep', icon: BookOpen },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-[#1A1C1B] font-['Manrope',sans-serif]">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white border-r border-[#c2c8c0]/60 shadow-sm">
          <div className="p-6 border-b border-[#c2c8c0]/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-2xl bg-[#163422] flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg">Admin Panel</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = active === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToSlug(`/admin/${item.id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-colors ${
                    isActive
                      ? 'bg-[#163422] text-white shadow-sm'
                      : 'text-[#1A1C1B] hover:bg-[#F9F9F7]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[#1A1C1B] hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Keluar Admin</span>
            </button>
          </div>
        </aside>
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
