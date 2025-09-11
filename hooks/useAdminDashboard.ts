import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import * as XLSX from 'xlsx'

interface Invite {
  id: number
  nameOnInvite: string
  ddi?: string
  phone?: string
  group?: string
  observation?: string
  code?: string
  guests: Guest[]
  confirmedCount: number
  totalGuests: number
}

interface Guest {
  id: number
  fullName: string
  gender?: string
  ageGroup?: string
  costPayment?: string
  status?: string
  tableNumber?: number
  confirmed: boolean
  inviteId: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export function useAdminDashboard() {
  const { data: session, status } = useSession()
  const [invites, setInvites] = useState<Invite[]>([])
  const [filteredInvites, setFilteredInvites] = useState<Invite[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending">("all")
  const [groupFilter, setGroupFilter] = useState<string>("all")
  const [availableGroups, setAvailableGroups] = useState<string[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingInvite, setDeletingInvite] = useState<number | null>(null)
  const [deletingGuest, setDeletingGuest] = useState<number | null>(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const [uploadFeedback, setUploadFeedback] = useState<{
    added: number
    updated: number
  } | null>(null)
  const [stats, setStats] = useState({
    totalInvites: 0,
    totalGuests: 0,
    confirmedGuests: 0,
    confirmationRate: 0
  })
  const router = useRouter()

  // Authentication check
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/admin/login")
    }
  }, [session, status, router])

  // Fetch invites with pagination and filters
  const fetchInvites = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(groupFilter !== 'all' && { group: groupFilter })
      })

      const response = await fetch(`/api/admin/invites?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInvites(data.invites)
        setPagination(data.pagination)
        setAvailableGroups(data.availableGroups || [])
        
        // Use stats from API instead of calculating locally
        setStats(data.stats || {
          totalInvites: 0,
          totalGuests: 0,
          confirmedGuests: 0,
          confirmationRate: 0
        })
      }
    } catch (error) {
      console.error('Erro ao buscar convites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (session) {
      fetchInvites()
    }
  }, [session, pagination.page, pagination.limit, groupFilter])

  // Filter invites based on search term and status
  useEffect(() => {
    let filtered = invites

    if (searchTerm) {
      filtered = filtered.filter(invite =>
        invite.nameOnInvite.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invite.guests.some(guest =>
          guest.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (filter !== "all") {
      filtered = filtered.filter(invite => {
        const hasConfirmed = invite.guests.some(guest => guest.confirmed)
        return filter === "confirmed" ? hasConfirmed : !hasConfirmed
      })
    }

    setFilteredInvites(filtered)
  }, [invites, searchTerm, filter])

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadFeedback(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload-invites', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setUploadFeedback(result)
        fetchInvites()
        
        // Clear the input
        event.target.value = ''
        
        setTimeout(() => setUploadFeedback(null), 5000)
      } else {
        const error = await response.json()
        alert(`Erro no upload: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro no upload do arquivo')
    } finally {
      setIsUploading(false)
    }
  }

  // Export data to Excel
  const exportToExcel = async () => {
    try {
      const response = await fetch('/api/admin/export-invites')
      if (response.ok) {
        const data = await response.json()
        
        const workbook = XLSX.utils.book_new()
        const worksheet = XLSX.utils.json_to_sheet(data.exports)
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Confirmações')
        
        XLSX.writeFile(workbook, `confirmacoes-${new Date().toISOString().split('T')[0]}.xlsx`, {
          compression: true,
          Props: {
            Title: 'Confirmações de Presença',
            Subject: 'Bodas de Pérola',
            CreatedDate: new Date()
          }
        })
      }
    } catch (error) {
      console.error('Erro na exportação:', error)
      alert('Erro ao exportar dados')
    }
  }

  // Sign out handler
  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/login' })
  }

  // Delete invite handler
  const handleDeleteInvite = async (inviteId: number, inviteName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o convite "${inviteName}" e todos os seus convidados?`)) {
      return
    }

    setDeletingInvite(inviteId)
    try {
      const response = await fetch(`/api/admin/invites/${inviteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchInvites()
      } else {
        alert('Erro ao deletar convite')
      }
    } catch (error) {
      console.error('Erro ao deletar convite:', error)
      alert('Erro ao deletar convite')
    } finally {
      setDeletingInvite(null)
    }
  }

  // Delete guest handler
  const handleDeleteGuest = async (guestId: number, guestName: string, inviteName: string) => {
    const confirmed = window.confirm(
      `⚠️ Confirmação de Remoção\n\n` +
      `Remover convidado:\n` +
      `"${guestName}"\n\n` +
      `Do convite: "${inviteName}"\n\n` +
      `Esta ação NÃO pode ser desfeita!\n\n` +
      `Confirmar remoção?`
    )

    if (!confirmed) return

    setDeletingGuest(guestId)

    try {
      const response = await fetch(`/api/admin/guests/${guestId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchInvites()
        alert('✅ Convidado removido com sucesso!')
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(`❌ Erro ao remover convidado: ${errorData.message || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao remover convidado:', error)
      alert('❌ Erro ao remover convidado. Tente novamente.')
    } finally {
      setDeletingGuest(null)
    }
  }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleGroupFilterChange = (group: string) => {
    setGroupFilter(group)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset para primeira página
  }

  return {
    // Data
    session,
    status,
    invites,
    filteredInvites,
    searchTerm,
    filter,
    groupFilter,
    availableGroups,
    pagination,
    isLoading,
    isUploading,
    deletingInvite,
    deletingGuest,
    showManualForm,
    uploadFeedback,
    stats,

    // Setters
    setSearchTerm,
    setFilter,
    setShowManualForm,

    // Handlers
    handleFileUpload,
    exportToExcel,
    handleSignOut,
    handleDeleteInvite,
    handleDeleteGuest,
    handlePageChange,
    handleGroupFilterChange,
    fetchInvites
  }
}
