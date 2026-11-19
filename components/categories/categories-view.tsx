'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Category } from '@/types/api'
import { Button } from '@/components/ui/button'
import { CategoryFormModal } from '@/components/categories/category-form-modal'
import { Edit2, FolderTree, Plus, Search, Tag } from 'lucide-react'

interface CategoriesViewProps {
  initialCategories: (Category & { movements_count?: number })[]
  canManage: boolean
}

export function CategoriesView({ initialCategories, canManage }: CategoriesViewProps) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [flowFilter, setFlowFilter] = useState<'all' | 'ingreso' | 'egreso'>('all')
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  // Filtrado en memoria
  const filtered = categories.filter((cat) => {
    if (flowFilter !== 'all' && cat.flow !== flowFilter) return false
    if (search.trim()) {
      const term = search.toLowerCase()
      return cat.name.toLowerCase().includes(term)
    }
    return true
  })

  function handleCreate() {
    setSelectedCategory(null)
    setModalOpen(true)
  }

  function handleEdit(cat: Category) {
    setSelectedCategory(cat)
    setModalOpen(true)
  }

  function handleSaved(savedCat: Category) {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === savedCat.id)
      if (exists) {
        return prev.map((c) => (c.id === savedCat.id ? { ...c, ...savedCat } : c))
      }
      return [savedCat, ...prev]
    })
    router.refresh()
  }

  async function handleToggleActive(cat: Category) {
    if (!canManage) return
    setTogglingId(cat.id)
    try {
      const newStatus = !cat.is_active
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cat.name,
          flow: cat.flow,
          is_active: newStatus,
        }),
      })

      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, is_active: newStatus } : c))
        )
        router.refresh()
      }
    } catch (e) {
      console.error('Error toggling category status:', e)
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Barra de filtros y botón nuevo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Selector de flujo */}
          <div className="inline-flex rounded-xl border border-[#dfe8e4] bg-[#fbfcfc] p-1">
            <button
              onClick={() => setFlowFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                flowFilter === 'all'
                  ? 'bg-white text-[#183b34] shadow-xs'
                  : 'text-[#71827e] hover:text-[#183b34]'
              }`}
            >
              Todas ({categories.length})
            </button>
            <button
              onClick={() => setFlowFilter('ingreso')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                flowFilter === 'ingreso'
                  ? 'bg-[#e7f4ef] text-[#0d6b5e] shadow-xs'
                  : 'text-[#71827e] hover:text-[#0d6b5e]'
              }`}
            >
              Ingresos ({categories.filter((c) => c.flow === 'ingreso').length})
            </button>
            <button
              onClick={() => setFlowFilter('egreso')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                flowFilter === 'egreso'
                  ? 'bg-[#faeee9] text-[#b96847] shadow-xs'
                  : 'text-[#71827e] hover:text-[#b96847]'
              }`}
            >
              Egresos ({categories.filter((c) => c.flow === 'egreso').length})
            </button>
          </div>

          {/* Buscador */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 size-4 text-[#93a29e]" />
            <input
              type="text"
              placeholder="Buscar categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-xl border border-[#dfe8e4] bg-white pl-9 pr-3 text-xs text-[#1e3934] placeholder:text-[#93a29e] focus:border-[#0d6b5e] focus:outline-none"
            />
          </div>
        </div>

        {canManage && (
          <Button
            onClick={handleCreate}
            className="h-10 gap-1.5 rounded-xl bg-[#0d6b5e] px-4 text-xs font-semibold text-white hover:bg-[#0a574c]"
          >
            <Plus className="size-4" />
            Nueva categoría
          </Button>
        )}
      </div>

      {/* Lista de categorías: Tarjetas en mobile / Tabla en desktop */}
      <div className="overflow-hidden rounded-2xl border border-[#dfe8e4] bg-white shadow-xs">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <FolderTree className="mx-auto size-10 text-[#93a29e]" />
            <p className="mt-2 text-sm font-semibold text-[#1e3934]">
              No se encontraron categorías
            </p>
            <p className="text-xs text-[#71827e]">
              Probá cambiando los filtros o creá una nueva categoría.
            </p>
          </div>
        ) : (
          <>
            {/* Vista tabla en desktop */}
            <div className="hidden md:block">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#edf1ef] bg-[#fbfcfc] text-[11px] font-bold uppercase tracking-wider text-[#78908a]">
                    <th className="py-3.5 pl-6 pr-4">Nombre de categoría</th>
                    <th className="px-4 py-3.5">Flujo</th>
                    <th className="px-4 py-3.5 text-center">Movimientos</th>
                    <th className="px-4 py-3.5">Estado</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1ef]">
                  {filtered.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#fafcfb]">
                      <td className="py-3 pl-6 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex size-8 items-center justify-center rounded-lg ${
                              cat.flow === 'ingreso'
                                ? 'bg-[#e7f4ef] text-[#0d6b5e]'
                                : 'bg-[#faeee9] text-[#b96847]'
                            }`}
                          >
                            <Tag className="size-4" />
                          </div>
                          <span className="font-semibold text-[#1e3934]">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                            cat.flow === 'ingreso'
                              ? 'bg-[#e7f4ef] text-[#0d6b5e]'
                              : 'bg-[#faeee9] text-[#b96847]'
                          }`}
                        >
                          {cat.flow === 'ingreso' ? 'Ingreso' : 'Egreso'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-[#5a736c]">
                        <span className="font-medium">{cat.movements_count ?? 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        {canManage ? (
                          <button
                            onClick={() => handleToggleActive(cat)}
                            disabled={togglingId === cat.id}
                            title="Clic para cambiar estado"
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                              cat.is_active
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                cat.is_active ? 'bg-emerald-600' : 'bg-gray-400'
                              }`}
                            />
                            {cat.is_active ? 'Activa' : 'Inactiva'}
                          </button>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              cat.is_active
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {cat.is_active ? 'Activa' : 'Inactiva'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pl-4 pr-6 text-right">
                        {canManage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(cat)}
                            className="h-8 gap-1 rounded-xl border-[#d2dfda] px-2.5 text-xs text-[#5a736c] hover:bg-[#f3f7f5]"
                          >
                            <Edit2 className="size-3" />
                            Editar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista tarjetas en mobile (sin scroll horizontal) */}
            <div className="divide-y divide-[#edf1ef] md:hidden">
              {filtered.map((cat) => (
                <div key={cat.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex size-8 items-center justify-center rounded-lg ${
                          cat.flow === 'ingreso'
                            ? 'bg-[#e7f4ef] text-[#0d6b5e]'
                            : 'bg-[#faeee9] text-[#b96847]'
                        }`}
                      >
                        <Tag className="size-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1e3934]">{cat.name}</p>
                        <p className="text-[11px] text-[#71827e]">
                          {cat.movements_count ?? 0} movimientos registrados
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        cat.flow === 'ingreso'
                          ? 'bg-[#e7f4ef] text-[#0d6b5e]'
                          : 'bg-[#faeee9] text-[#b96847]'
                      }`}
                    >
                      {cat.flow === 'ingreso' ? 'Ingreso' : 'Egreso'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#f4f7f6] pt-2.5">
                    {canManage ? (
                      <button
                        onClick={() => handleToggleActive(cat)}
                        disabled={togglingId === cat.id}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          cat.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            cat.is_active ? 'bg-emerald-600' : 'bg-gray-400'
                          }`}
                        />
                        {cat.is_active ? 'Activa' : 'Inactiva'}
                      </button>
                    ) : (
                      <span className="text-xs text-[#71827e]">
                        {cat.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    )}

                    {canManage && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(cat)}
                        className="h-8 gap-1 rounded-xl border-[#d2dfda] px-2.5 text-xs text-[#5a736c]"
                      >
                        <Edit2 className="size-3" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <CategoryFormModal
        category={selectedCategory}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSaved}
      />
    </div>
  )
}
