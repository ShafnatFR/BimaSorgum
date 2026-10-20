import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChefHat,
  RefreshCw,
  Search,
} from 'lucide-react'
import { supabase, adminDeleteRecipe, mapRecipe } from '../../lib/supabase'
import type { DbIngredientRow, DbRecipeRow, DbStepRow } from '../../lib/supabase'
import type { Recipe } from '../../types'

type AdminRecipeRow = DbRecipeRow & {
  recipe_ingredients?: DbIngredientRow[] | null
  recipe_steps?: DbStepRow[] | null
}

const formatDate = (value?: string | null): string => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const shortId = (value?: string | null): string => {
  if (!value) return '-'
  return value.length > 8 ? `${value.slice(0, 8)}…` : value
}

export const AdminRecipes: React.FC = () => {
  const [recipes, setRecipes] = useState<AdminRecipeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Recipe | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAllRecipes = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    setError(null)

    const { data, error: queryError } = await supabase
      .from('recipes')
      .select('*, recipe_ingredients(*), recipe_steps(*)')
      .order('created_at', { ascending: false })

    if (queryError) {
      setError(queryError.message)
      setRecipes([])
    } else {
      setRecipes((data as AdminRecipeRow[]) || [])
    }

    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchAllRecipes()
  }, [fetchAllRecipes])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 3000)
    return () => clearTimeout(timer)
  }, [notice])

  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return recipes
    return recipes.filter((row) =>
      [row.id, row.slug, row.title, row.created_by]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    )
  }, [recipes, search])

  const openDeleteConfirm = (row: AdminRecipeRow) => {
    setPendingDelete(
      mapRecipe(row, row.recipe_ingredients || [], row.recipe_steps || [])
    )
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    const success = await adminDeleteRecipe(pendingDelete.id)
    setDeleting(false)
    setPendingDelete(null)

    if (success) {
      setNotice('Resep berhasil dihapus dari katalog.')
      fetchAllRecipes(true)
    } else {
      setError('Gagal menghapus resep. Pastikan sesi admin masih aktif.')
    }
  }

  const publishedCount = recipes.filter((row) => row.is_published).length
  const systemCount = recipes.filter((row) => row.is_system).length

  return (
    <div className="min-h-screen bg-[#f9f9f7] text-[#1a1c1b] font-['Manrope',sans-serif] antialiased pb-12">
      {/* Toast notifikasi */}
      {notice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#163422] text-white px-5 py-2.5 rounded-full shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-[#cbebc3]" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#f9f9f7]/95 backdrop-blur-md border-b border-[#e2e3e1]/70 px-5 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#163422] text-white flex items-center justify-center shrink-0">
          <ChefHat className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-[#163422] tracking-tight leading-tight">
            Kelola Resep
          </h1>
          <p className="text-[11px] text-[#727972]">
            {recipes.length} resep • {publishedCount} terbit • {systemCount} sistem
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchAllRecipes(true)}
          disabled={refreshing}
          aria-label="Muat ulang data resep"
          title="Muat ulang"
          className="w-9 h-9 rounded-xl bg-white border border-[#c2c8c0] text-[#424843] hover:border-[#163422]/40 hover:text-[#163422] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <main className="px-5 md:px-10 max-w-5xl mx-auto pt-5 space-y-4">
        {/* Pesan error */}
        {error && (
          <div className="bg-[#ffdad6] text-[#ba1a1a] rounded-2xl border border-[#ba1a1a]/20 px-4 py-3 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
            <span>{error}</span>
          </div>
        )}

        {/* Ringkasan + pencarian */}
        <div className="bg-white rounded-2xl border border-[#2d4b37]/10 shadow-[0_4px_12px_rgba(45,75,55,0.06)] p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-2 text-center">
              <span className="text-2xl font-bold text-[#163422]">{recipes.length}</span>
              <span className="text-[11px] text-[#424843] mt-1 font-medium">Total Resep</span>
            </div>
            <div className="flex flex-col items-center p-2 text-center border-l border-r border-[#c2c8c0]/30">
              <span className="text-2xl font-bold text-[#324d30]">{publishedCount}</span>
              <span className="text-[11px] text-[#424843] mt-1 font-medium">Terbit</span>
            </div>
            <div className="flex flex-col items-center p-2 text-center">
              <span className="text-2xl font-bold text-[#7c5800]">{systemCount}</span>
              <span className="text-[11px] text-[#424843] mt-1 font-medium">Sistem</span>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#727972] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, slug, atau ID pembuat..."
              className="w-full pl-9 pr-3 py-2 border border-[#c2c8c0] rounded-xl text-sm bg-white focus:outline-none focus:border-[#163422] placeholder:text-[#a8a8a3]"
            />
          </div>
        </div>

        {/* Tabel resep */}
        <div className="bg-white rounded-2xl border border-[#2d4b37]/10 shadow-[0_4px_12px_rgba(45,75,55,0.06)] overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-16 rounded bg-[#e8eae6] animate-pulse" />
                  <div className="h-3 flex-1 rounded bg-[#e8eae6] animate-pulse" />
                  <div className="h-3 w-20 rounded bg-[#e8eae6] animate-pulse" />
                  <div className="h-7 w-7 rounded-lg bg-[#e8eae6] animate-pulse" />
                </div>
              ))}
              <p className="text-xs text-[#727972] text-center pt-1">Memuat daftar resep...</p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#e2e3e1] text-[#727972] flex items-center justify-center mx-auto">
                <ChefHat className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#1a1c1b]">
                {recipes.length === 0 ? 'Belum ada resep' : 'Resep tidak ditemukan'}
              </p>
              <p className="text-[11px] text-[#727972]">
                {recipes.length === 0
                  ? 'Katalog resep masih kosong. Resep yang dibuat pengguna akan muncul di sini.'
                  : 'Coba kata kunci lain untuk mencari resep yang tersedia.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#c2c8c0]/40 text-[11px] uppercase tracking-wide text-[#727972]">
                    <th className="px-4 py-3 font-bold">ID</th>
                    <th className="px-4 py-3 font-bold">Slug</th>
                    <th className="px-4 py-3 font-bold">Judul</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold">Pembuat</th>
                    <th className="px-4 py-3 font-bold">Dibuat</th>
                    <th className="px-4 py-3 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipes.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#e2e3e1]/60 last:border-b-0 hover:bg-[#f4f4f2] transition-colors"
                    >
                      <td
                        className="px-4 py-3 text-[11px] font-mono text-[#727972] whitespace-nowrap"
                        title={row.id}
                      >
                        {shortId(row.id)}
                      </td>
                      <td
                        className="px-4 py-3 text-xs text-[#424843] max-w-[160px] truncate"
                        title={row.slug}
                      >
                        {row.slug}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-[#1a1c1b] max-w-[220px] truncate">
                        {row.title}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {row.is_published ? (
                            <span className="bg-[#cbebc3] text-[#324d30] px-2 py-0.5 rounded-full text-[10px] font-bold">
                              Terbit
                            </span>
                          ) : (
                            <span className="bg-[#ffe8b0] text-[#745200] px-2 py-0.5 rounded-full text-[10px] font-bold">
                              Draf
                            </span>
                          )}
                          {row.is_system && (
                            <span className="bg-[#e2e3e1] text-[#424843] px-2 py-0.5 rounded-full text-[10px] font-bold">
                              Sistem
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 text-[11px] font-mono text-[#727972] whitespace-nowrap"
                        title={row.created_by || 'Dibuat oleh sistem'}
                      >
                        {row.created_by ? shortId(row.created_by) : 'sistem'}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#727972] whitespace-nowrap">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openDeleteConfirm(row)}
                          aria-label={`Hapus resep ${row.title}`}
                          title="Hapus resep"
                          className="inline-flex w-8 h-8 items-center justify-center rounded-xl border border-[#ba1a1a]/25 text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Konfirmasi hapus */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 bg-[#1a1c1b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#1a1c1b]">Hapus Resep?</h3>
            <p className="text-xs text-[#727972]">
              Resep <strong className="text-[#424843]">{pendingDelete.title}</strong> beserta bahan
              dan langkah masaknya akan dihapus permanen dari katalog.
            </p>
            <div className="bg-[#f4f4f2] rounded-xl px-3 py-2 text-[11px] text-[#424843] text-left space-y-1">
              <p className="truncate">
                Slug: <span className="font-mono">{pendingDelete.slug || '-'}</span>
              </p>
              <p>
                {pendingDelete.ingredients.length} bahan • {pendingDelete.steps.length} langkah
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-[#c2c8c0] text-xs font-bold text-[#424843] hover:bg-[#f4f4f2] transition-colors cursor-pointer disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-[#ba1a1a] text-white text-xs font-bold hover:bg-rose-700 shadow-sm transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminRecipes
