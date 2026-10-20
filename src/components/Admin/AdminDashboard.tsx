import React, { useEffect, useState } from 'react'
import { MessageSquare, Flag, BookOpen, Settings, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase, fetchAdminConfigs, fetchReports } from '../../lib/supabase'
import { navigateToSlug, RouteSlugs } from '../../utils/slugRouter'

interface AdminStats {
  totalComments: number
  pendingReports: number
  totalRecipes: number
  activeConfigs: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalComments: 0,
    pendingReports: 0,
    totalRecipes: 0,
    activeConfigs: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [reports, configs, commentsData] = await Promise.all([
        fetchReports(),
        fetchAdminConfigs(),
        supabase.from('recipe_comments').select('id', { count: 'exact', head: true }),
      ])

      const { count: recipesCount } = await supabase
        .from('recipes')
        .select('id', { count: 'exact', head: true })

      const totalComments = commentsData.count || 0
      const pendingReports = reports.filter(r => r.status === 'pending').length
      const totalRecipes = recipesCount || 0
      const activeConfigs = configs.length

      setStats({
        totalComments,
        pendingReports,
        totalRecipes,
        activeConfigs,
      })
    } catch (error) {
      console.error('Error loading admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Komentar',
      value: stats.totalComments,
      icon: MessageSquare,
      color: 'bg-blue-50 text-blue-600',
      section: 'komentar',
    },
    {
      title: 'Total Laporan (pending)',
      value: stats.pendingReports,
      icon: Flag,
      color: 'bg-orange-50 text-orange-600',
      section: 'laporan',
    },
    {
      title: 'Total Resep',
      value: stats.totalRecipes,
      icon: BookOpen,
      color: 'bg-green-50 text-green-600',
      section: 'resep',
    },
    {
      title: 'Konfigurasi Aktif',
      value: stats.activeConfigs,
      icon: Settings,
      color: 'bg-purple-50 text-purple-600',
      section: 'pengaturan',
    },
  ]

  const quickActions = [
    { label: 'Kelola Komentar', icon: MessageSquare, section: 'komentar' },
    { label: 'Tinjau Laporan', icon: Flag, section: 'laporan' },
    { label: 'Kelola Resep', icon: BookOpen, section: 'resep' },
    { label: 'Pengaturan Sistem', icon: Settings, section: 'pengaturan' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1C1B]">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">Ringkasan statistik dan tindakan cepat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl shadow-sm border border-[#c2c8c0]/60 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-[#1A1C1B] mt-1">
                    {loading ? '-' : card.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#c2c8c0]/60 p-6">
        <h2 className="text-lg font-semibold text-[#1A1C1B] mb-4">Tindakan Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                className="flex items-center gap-3 p-4 rounded-2xl border border-[#c2c8c0]/60 hover:bg-[#F9F9F7] transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#163422]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#163422]" />
                </div>
                <span className="text-sm font-medium text-[#1A1C1B]">{action.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#c2c8c0]/60 p-6">
        <h2 className="text-lg font-semibold text-[#1A1C1B] mb-4">Status Sistem</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-green-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-[#1A1C1B]">Sistem Berjalan Normal</span>
            </div>
            <span className="text-xs text-green-600 font-medium">Aktif</span>
          </div>
          {stats.pendingReports > 0 && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-[#1A1C1B]">
                  {stats.pendingReports} laporan menunggu tinjauan
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
