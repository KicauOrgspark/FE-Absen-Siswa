'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUsers } from '@/lib/api-hooks'
import { AVAILABLE_CLASSES } from '@/lib/constants'
import { usersAPI, UserDetails } from '@/lib/api-client'

export default function DataMasterPage() {
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const { data, loading, refetch } = useUsers({ search, class_group: classFilter })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalUsersCount = data.users.length
  const totalPages = Math.max(1, Math.ceil(totalUsersCount / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = data.users.slice(startIndex, endIndex)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<UserDetails | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    nisn: '',
    username: '',
    password: '',
    class_group: '',
    parent_phone: '',
  })
  const [saving, setSaving] = useState(false)

  const openDrawer = (student?: UserDetails) => {
    if (student) {
      setEditingStudent(student)
      setFormData({
        full_name: student.full_name,
        nisn: student.nisn,
        username: student.username,
        password: '',
        class_group: student.class_group,
        parent_phone: student.parent_phone,
      })
    } else {
      setEditingStudent(null)
      setFormData({
        full_name: '',
        nisn: '',
        username: '',
        password: '',
        class_group: '',
        parent_phone: '',
      })
    }
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingStudent(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingStudent) {
        await usersAPI.update(editingStudent.id, formData)
      } else {
        await usersAPI.create(formData)
      }
      closeDrawer()
      refetch()
    } catch (error) {
      console.error('Failed to save student', error)
      alert('Gagal menyimpan data siswa')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
      try {
        await usersAPI.delete(id)
        refetch()
      } catch (error) {
        console.error('Failed to delete student', error)
        alert('Gagal menghapus siswa')
      }
    }
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full relative">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
            Data Master Siswa
          </h2>
          <p className="text-base text-muted-foreground mt-1 font-sans">
            Kelola data informasi seluruh siswa terdaftar.
          </p>
        </div>
        <Button
          onClick={() => openDrawer()}
          className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm font-sans"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Pendaftaran Siswa Baru
        </Button>
      </section>

      {/* Filters */}
      <section className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[18px]">search</span>
          <Input
            placeholder="Cari NISN atau Nama..."
            className="pl-10 font-sans"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          />
        </div>
        <Select
          value={classFilter || 'all'}
          onValueChange={(val) => { setClassFilter(val === 'all' ? '' : val); setCurrentPage(1) }}
        >
          <SelectTrigger className="w-full sm:w-48 h-10 border-border bg-background">
            <SelectValue placeholder="Semua Kelas" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">Semua Kelas</SelectItem>
            {AVAILABLE_CLASSES.map((cls) => (
              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* Table */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-card rounded-xl shadow-sm border border-border overflow-hidden"
        style={{ borderTopWidth: 4, borderTopColor: 'var(--primary)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-accent">
              <tr>
                <th className="py-4 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground border-b border-border font-sans">NISN</th>
                <th className="py-4 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground border-b border-border font-sans">Nama</th>
                <th className="py-4 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground border-b border-border font-sans">Username</th>
                <th className="py-4 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground border-b border-border font-sans">Kelas</th>
                <th className="py-4 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground border-b border-border font-sans">Telepon Ortu</th>
                <th className="py-4 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground border-b border-border font-sans text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">Memuat data...</td>
                </tr>
              ) : data.users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">Tidak ada data ditemukan.</td>
                </tr>
              ) : (
                paginatedUsers.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4 font-mono text-muted-foreground">{student.nisn}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent border border-border text-foreground flex items-center justify-center font-bold text-xs uppercase font-sans shrink-0">
                          {getInitials(student.full_name)}
                        </div>
                        <span className="font-semibold text-foreground">{student.full_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{student.username}</td>
                    <td className="py-4 px-4 text-foreground">{student.class_group}</td>
                    <td className="py-4 px-4">
                      {student.parent_phone ? (
                        <a href={`https://wa.me/${student.parent_phone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[var(--status-hadir-text)] hover:opacity-80 transition-opacity">
                          <span className="material-symbols-outlined text-[14px]">forum</span>
                          {student.parent_phone}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDrawer(student)}
                          className="text-muted-foreground hover:text-primary transition-colors p-1"
                          title="Ubah"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          title="Hapus"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-accent px-4 py-3 border-t border-border flex items-center justify-between font-sans">
          <span className="text-sm text-muted-foreground">
            {totalUsersCount === 0
              ? 'Menampilkan 0 dari 0 siswa'
              : `Menampilkan ${startIndex + 1}-${Math.min(endIndex, totalUsersCount)} dari ${totalUsersCount} siswa`}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </Button>
            <span className="text-xs font-semibold px-2 text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Slide-over Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-card shadow-2xl z-50 flex flex-col border-l border-border"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-accent/50">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  {editingStudent ? 'Ubah Data Siswa' : 'Pendaftaran Siswa Baru'}
                </h3>
                <button
                  onClick={closeDrawer}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full p-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto px-6 py-6 font-sans">
                <form id="student-form" onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1">Nama Lengkap</label>
                    <Input
                      required
                      placeholder="Masukkan nama lengkap"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1">NISN</label>
                    <Input
                      required
                      className="font-mono"
                      placeholder="10 digit angka"
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1">Username</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[16px]">alternate_email</span>
                      <Input
                        required
                        className="pl-9"
                        placeholder="username.siswa"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1">
                      Password {editingStudent ? '(Kosongkan jika tidak diubah)' : ''}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[16px]">lock</span>
                      <Input
                        type="password"
                        required={!editingStudent}
                        className="pl-9"
                        placeholder={editingStudent ? 'Masukkan password baru...' : 'Masukkan password...'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1">Kelas</label>
                    <Select
                      value={formData.class_group}
                      onValueChange={(val) => setFormData({ ...formData, class_group: val })}
                    >
                      <SelectTrigger className="w-full h-10 border-border bg-background">
                        <SelectValue placeholder="Pilih Kelas" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {AVAILABLE_CLASSES.map((cls) => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1">No Telepon Orang Tua (WhatsApp)</label>
                    <Input
                      type="tel"
                      className="font-mono"
                      placeholder="08xx-xxxx-xxxx"
                      value={formData.parent_phone}
                      onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                    />
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border bg-accent/50 flex justify-end gap-3 font-sans">
                <Button variant="outline" onClick={closeDrawer} disabled={saving}>
                  Batal
                </Button>
                <Button type="submit" form="student-form" className="gap-2" disabled={saving}>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
