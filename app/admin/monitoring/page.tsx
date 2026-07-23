'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMonitoringData } from '@/lib/api-hooks'
import { AVAILABLE_CLASSES } from '@/lib/constants'

/* ── helpers ── */
type StatusVariant = 'hadir' | 'telat' | 'sakit' | 'alpa' | 'belum'

function statusVariant(status: string): StatusVariant {
  const s = status?.toLowerCase() ?? ''
  if (s === 'hadir') return 'hadir'
  if (s === 'telat' || s === 'terlambat') return 'telat'
  if (s === 'sakit' || s === 'izin') return 'sakit'
  if (s === 'alpa' || s === 'alfa') return 'alpa'
  return 'belum'
}

function statusLabel(status: string) {
  const v = statusVariant(status)
  if (v === 'hadir') return 'Hadir'
  if (v === 'telat') return 'Telat'
  if (v === 'sakit') return 'Sakit'
  if (v === 'alpa') return 'Alpa'
  return 'Belum Absen'
}

function formatDate() {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/* ── Department Card ── */
interface DeptCardProps {
  name: string
  percentage: number
  color: string
  trend?: { value: number; direction: 'up' | 'down' }
  index: number
}

function DeptCard({ name, percentage, color, trend, index }: DeptCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' as const }}
      className="bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: color }} />
      <h3 className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1 group-hover:text-primary transition-colors font-sans">
        {name}
      </h3>
      <div className="flex items-end gap-2 mb-3">
        <span className="text-2xl font-bold text-foreground leading-none font-sans">{percentage}%</span>
        {trend && (
          <span className={`text-xs font-semibold flex items-center font-sans ${trend.direction === 'up' ? 'text-[var(--status-hadir-text)]' : 'text-[var(--status-sakit-text)]'}`}>
            {trend.direction === 'up' ? <span className="material-symbols-outlined text-[14px]">arrow_upward</span> : <span className="material-symbols-outlined text-[14px]">arrow_downward</span>}
            {trend.value}%
          </span>
        )}
      </div>
      <div className="w-full bg-accent rounded-full h-1.5">
        <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
    </motion.div>
  )
}

/* ── Page ── */
export default function MonitoringPage() {
  const [classGroup, setClassGroup] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [angkatan, setAngkatan] = useState('Semua Angkatan')
  const [jurusan, setJurusan] = useState('Semua Jurusan')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editStatus, setEditStatus] = useState('')

  const { data: monitoring, loading, updateStatus, refetch } = useMonitoringData({
    class_group: classGroup || undefined,
    status: statusFilter || undefined,
    angkatan: angkatan !== 'Semua Angkatan' ? angkatan : undefined,
    jurusan: jurusan !== 'Semua Jurusan' ? jurusan : undefined,
  })

  const students = monitoring?.data ?? []
  const summary = monitoring?.summary

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalStudentsCount = students.length
  const totalPages = Math.max(1, Math.ceil(totalStudentsCount / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedStudents = students.slice(startIndex, endIndex)

  const handleSave = async (userId: number) => {
    if (editStatus) {
      await updateStatus(userId, editStatus)
    }
    setEditingId(null)
    setEditStatus('')
  }

  const defaultDepts = [
    { name: 'RPL', color: 'var(--primary)' },
    { name: 'TKJ', color: '#176c43' },
    { name: 'DKV', color: '#694f0d' },
    { name: 'LPB', color: '#8e706d' },
    { name: 'TOI', color: '#b45309' },
  ]

  const departments: DeptCardProps[] = defaultDepts.map((d, i) => {
    const stat = summary?.departments?.[d.name]
    let percentage = 0
    if (stat && stat.total > 0) {
      percentage = Math.round((stat.hadir / stat.total) * 100)
    }
    return {
      name: d.name,
      percentage,
      color: d.color,
      index: i
    }
  })

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
            Absensi Harian Siswa
          </h2>
          <p className="text-base text-muted-foreground mt-1 font-sans">
            Pantau dan kelola kehadiran siswa secara real-time untuk hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-4 py-2 rounded-full border border-border shadow-sm font-sans">
          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          <span>{formatDate()}</span>
        </div>
      </section>

      {/* Department Summary Cards */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {departments.map((dept) => (
          <DeptCard key={dept.name} {...dept} />
        ))}
      </section>

      {/* Cascade Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-end gap-4"
      >
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1 font-sans">Angkatan</label>
          <Select 
            value={angkatan} 
            onValueChange={(val) => { setAngkatan(val); setClassGroup(''); setCurrentPage(1) }}
          >
            <SelectTrigger className="w-full h-10 border-border bg-background">
              <SelectValue placeholder="Angkatan" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="Semua Angkatan">Semua Angkatan</SelectItem>
              <SelectItem value="Kelas X">Kelas X</SelectItem>
              <SelectItem value="Kelas XI">Kelas XI</SelectItem>
              <SelectItem value="Kelas XII">Kelas XII</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1 font-sans">Jurusan</label>
          <Select 
            value={jurusan} 
            onValueChange={(val) => { setJurusan(val); setClassGroup(''); setCurrentPage(1) }}
          >
            <SelectTrigger className="w-full h-10 border-border bg-background">
              <SelectValue placeholder="Jurusan" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="Semua Jurusan">Semua Jurusan</SelectItem>
              <SelectItem value="RPL">RPL</SelectItem>
              <SelectItem value="TKJ">TKJ</SelectItem>
              <SelectItem value="DKV">DKV</SelectItem>
              <SelectItem value="LPB">LPB</SelectItem>
              <SelectItem value="TOI">TOI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1 font-sans">Kelas</label>
          <Select
            value={classGroup || 'all'}
            onValueChange={(val) => { setClassGroup(val === 'all' ? '' : val); setCurrentPage(1) }}
          >
            <SelectTrigger className="w-full h-10 border-border bg-background">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">Semua Kelas</SelectItem>
              {AVAILABLE_CLASSES.filter(c => {
                let matchAngkatan = true
                if (angkatan === 'Kelas X') matchAngkatan = c.startsWith('X-')
                if (angkatan === 'Kelas XI') matchAngkatan = c.startsWith('XI-')
                if (angkatan === 'Kelas XII') matchAngkatan = c.startsWith('XII-')
            
                let matchJurusan = true
                if (jurusan !== 'Semua Jurusan') matchJurusan = c.includes(`-${jurusan}-`) || c.endsWith(`-${jurusan}`)
            
                return matchAngkatan && matchJurusan
              }).map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-1 font-sans">Status</label>
          <Select
            value={statusFilter || 'all'}
            onValueChange={(val) => { setStatusFilter(val === 'all' ? '' : val); setCurrentPage(1) }}
          >
            <SelectTrigger className="w-full h-10 border-border bg-background">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="hadir">Hadir</SelectItem>
              <SelectItem value="telat">Telat</SelectItem>
              <SelectItem value="sakit">Sakit/Izin</SelectItem>
              <SelectItem value="alfa">Alpa</SelectItem>
              <SelectItem value="belum_absen">Belum Absen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => { setClassGroup(''); setStatusFilter(''); setAngkatan('Semua Angkatan'); setJurusan('Semua Jurusan'); refetch() }}
          className="flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Reset
        </Button>
      </motion.div>

      {/* Monitoring Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-accent">
              <tr>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground border-b border-border font-sans">NISN</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground border-b border-border font-sans">Nama Lengkap</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground border-b border-border font-sans">Kelas</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground border-b border-border font-sans">Waktu Absen</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground border-b border-border font-sans">Status</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground border-b border-border text-right font-sans">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border font-sans">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Memuat data...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Tidak ada data ditemukan.</td></tr>
              ) : (
                paginatedStudents.map((student) => {
                  const isEditing = editingId === student.id
                  const waktu = student.timestamp
                    ? new Date(student.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
                    : '-'

                  if (isEditing) {
                    return (
                      <tr key={student.id} className="bg-[var(--inverse-on-surface)] shadow-inner relative">
                        <td className="py-4 px-4 font-mono text-muted-foreground">{student.nisn}</td>
                        <td className="py-4 px-4 font-medium">{student.name}</td>
                        <td className="py-4 px-4">{student.class_group}</td>
                        <td className="py-4 px-4 text-muted-foreground italic">{waktu}</td>
                        <td className="py-4 px-4">
                          <select
                            value={editStatus || student.status}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="block w-full text-sm border-primary rounded-md focus:ring-primary focus:border-primary bg-card font-semibold text-foreground shadow-sm"
                          >
                            <option value="hadir">Hadir</option>
                            <option value="sakit">Sakit</option>
                            <option value="izin">Izin</option>
                            <option value="alfa">Alpa</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setEditingId(null); setEditStatus('') }}>
                              Batal
                            </Button>
                            <Button size="sm" onClick={() => handleSave(student.id)}>
                              Simpan
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  }

                  return (
                    <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-muted-foreground">{student.nisn}</td>
                      <td className="py-3 px-4 font-medium">{student.name}</td>
                      <td className="py-3 px-4">{student.class_group}</td>
                      <td className="py-3 px-4">{waktu}</td>
                      <td className="py-3 px-4">
                        <Badge variant={statusVariant(student.status)}>{statusLabel(student.status)}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setEditingId(student.id); setEditStatus(student.status) }}
                        >
                          Ubah
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-accent px-4 py-3 border-t border-border flex items-center justify-between font-sans">
          <span className="text-sm text-muted-foreground">
            {totalStudentsCount === 0
              ? 'Menampilkan 0 dari 0 siswa'
              : `Menampilkan ${startIndex + 1}-${Math.min(endIndex, totalStudentsCount)} dari ${totalStudentsCount} siswa`}
            {summary ? ` (Hadir: ${summary.hadir}, Telat: ${summary.telat}, Alfa: ${summary.alfa})` : ''}
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
      </motion.div>
    </div>
  )
}
