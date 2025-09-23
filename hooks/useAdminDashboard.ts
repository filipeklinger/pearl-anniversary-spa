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
  message?: string | null
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
  const [allInvites, setAllInvites] = useState<Invite[]>([]) // Todos os convites
  const [filteredInvites, setFilteredInvites] = useState<Invite[]>([]) // Convites filtrados
  const [paginatedInvites, setPaginatedInvites] = useState<Invite[]>([]) // Convites da página atual
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
  const [isCreatingInvite, setIsCreatingInvite] = useState(false)
  const [isUpdatingInvite, setIsUpdatingInvite] = useState(false)
  const [deletingInvite, setDeletingInvite] = useState<number | null>(null)
  const [deletingGuest, setDeletingGuest] = useState<number | null>(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const [editingInvite, setEditingInvite] = useState<Invite | null>(null)
  const [uploadFeedback, setUploadFeedback] = useState<{
    added: number
    updated: number
  } | null>(null)
  const [stats, setStats] = useState({
    totalInvites: 0,
    totalGuests: 0,
    confirmedGuests: 0,
    cancelledGuests: 0,
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

  // Fetch all invites (once)
  const fetchInvites = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/invites`)
      if (response.ok) {
        const data = await response.json()
        setAllInvites(data.invites)
        setAvailableGroups(data.availableGroups || [])
        
        // Use stats from API
        setStats(data.stats || {
          totalInvites: 0,
          totalGuests: 0,
          confirmedGuests: 0,
          cancelledGuests: 0,
          confirmationRate: 0
        })
      }
    } catch (error) {
      console.error('Erro ao buscar convites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch (only once)
  useEffect(() => {
    if (session) {
      fetchInvites()
    }
  }, [session])

  // Apply all filters in frontend
  useEffect(() => {
    let filtered = allInvites

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(invite =>
        invite.nameOnInvite.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invite.guests.some(guest =>
          guest.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Filter by group
    if (groupFilter !== "all") {
      filtered = filtered.filter(invite => invite.group === groupFilter)
    }

    // Filter by confirmation status
    if (filter !== "all") {
      filtered = filtered.filter(invite => {
        const hasConfirmed = invite.guests.some(guest => guest.confirmed)
        return filter === "confirmed" ? hasConfirmed : !hasConfirmed
      })
    }

    setFilteredInvites(filtered)

    // Update pagination based on filtered results
    const totalPages = Math.ceil(filtered.length / pagination.limit)
    const newPagination = {
      ...pagination,
      total: filtered.length,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    }
    
    // Adjust current page if it's beyond the available pages
    if (pagination.page > totalPages && totalPages > 0) {
      newPagination.page = 1
    }

    setPagination(newPagination)
  }, [allInvites, searchTerm, filter, groupFilter, pagination.limit])

  // Apply pagination to filtered results
  useEffect(() => {
    const startIndex = (pagination.page - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    setPaginatedInvites(filteredInvites.slice(startIndex, endIndex))
  }, [filteredInvites, pagination.page, pagination.limit])

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadFeedback(null)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { 
        type: 'array',
        codepage: 65001, // UTF-8
        cellText: false,
        cellDates: true
      })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      
      // Converter a planilha em dados brutos primeiro para identificar o cabeçalho correto
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Usar números como índices ao invés de nomes de colunas
        raw: false,
        defval: '',
        blankrows: true
      }) as any[][]

      console.log('Dados brutos recebidos:', rawData.slice(0, 5)) // Debug das primeiras 5 linhas

      // Encontrar a linha do cabeçalho (procurar pela linha que contém "Nome do convite")
      let headerRowIndex = -1
      for (let i = 0; i < Math.min(rawData.length, 5); i++) {
        const row = rawData[i]
        if (row && Array.isArray(row) && row.some(cell => 
          String(cell || '').toLowerCase().includes('nome do convite')
        )) {
          headerRowIndex = i
          break
        }
      }

      if (headerRowIndex === -1) {
        throw new Error('Cabeçalho não encontrado. Verifique se a planilha contém a linha com "Nome do convite *"')
      }

      console.log(`Cabeçalho encontrado na linha ${headerRowIndex + 1}`)

      // Extrair o cabeçalho
      const headerRow = rawData[headerRowIndex]
      
      // Extrair apenas as linhas de dados (após o cabeçalho)
      const dataRows = rawData.slice(headerRowIndex + 1).filter(row => 
        row && Array.isArray(row) && row.some(cell => String(cell || '').trim() !== '')
      )

      // Converter para formato de objetos usando o cabeçalho correto
      const jsonData = dataRows.map(row => {
        const obj: any = {}
        headerRow.forEach((header, index) => {
          if (header && String(header).trim()) {
            obj[String(header)] = row[index] || ''
          }
        })
        return obj
      })

      console.log('Dados processados:', jsonData.slice(0, 3)) // Debug dos primeiros 3 registros

      const response = await fetch('/api/admin/upload-invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: jsonData }),
      })

      if (response.ok) {
        const result = await response.json()
        setUploadFeedback({
          added: result.added || 0,
          updated: result.updated || 0
        })
        fetchInvites()
        
        // Mostrar feedback detalhado
        const totalProcessed = (result.added || 0) + (result.updated || 0)
        alert(`Planilha importada com sucesso!\n\n` +
              `📊 Resumo:\n` +
              `• ${result.added || 0} novos convites adicionados\n` +
              `• ${result.updated || 0} convites atualizados\n` +
              `• ${totalProcessed} total processados`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(`Erro ao importar planilha: ${errorData.message || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao processar arquivo. Verifique se o formato está correto.')
    } finally {
      setIsUploading(false)
    }

    // Reset do input
    event.target.value = ''
  }

  // Export data to Excel
  const exportToExcel = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/export-invites')
      if (response.ok) {
        const data = await response.json() as {
            "Nome do Convite": string,
            "DDI": string,
            "Telefone": string,
            "Grupo": string,
            "Observação": string,
            "Nome do Convidado": string,
            "Gênero": "M" | "F" | "",
            "Faixa Etária": "Adulto",
            "Custo/Pagamento": "Inteira",
            "Situação": "",
            "Mesa": number,
            "Confirmado": "Não" | "Sim",
            "Mensagem": string,
            "Data de Criação": Date,
            "Última Atualização": Date
        }[]

        const workbook = XLSX.utils.book_new()
        const worksheet = XLSX.utils.json_to_sheet(data.sort((a, b) => {
          // Sort by invite name first
          if (a["Nome do Convite"] < b["Nome do Convite"]) return -1
          if (a["Nome do Convite"] > b["Nome do Convite"]) return 1
          
          // Then by guest name
          if (a["Nome do Convidado"] < b["Nome do Convidado"]) return -1
          if (a["Nome do Convidado"] > b["Nome do Convidado"]) return 1
          
          return 0
        }))
        
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
    } finally {
      setIsLoading(false)
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

  // Create manual invite
  const createManualInvite = async (inviteData: {
    nameOnInvite: string
    ddi?: string
    phone?: string
    group?: string
    observation?: string
    code?: string
    guests: {
      fullName: string
      gender?: string
      ageGroup?: string
      costPayment?: string
      status?: string
      tableNumber?: number
    }[]
  }) => {
    try {
      setIsCreatingInvite(true)
      
      const response = await fetch('/api/admin/create-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inviteData),
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh the invites list
        await fetchInvites()
        
        // Close the form and show success
        setShowManualForm(false)
        alert('✅ Convite criado com sucesso!')
        
        return { success: true, invite: data.invite }
      } else {
        alert(`❌ Erro ao criar convite: ${data.message || 'Erro desconhecido'}`)
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('Erro ao criar convite:', error)
      alert('❌ Erro ao criar convite. Tente novamente.')
      return { success: false, error: 'Erro de conexão' }
    } finally {
      setIsCreatingInvite(false)
    }
  }

  // Update existing invite
  const updateInvite = async (inviteId: number, inviteData: {
    nameOnInvite: string
    ddi?: string
    phone?: string
    group?: string
    observation?: string
    code?: string
    guests: {
      id?: number
      fullName: string
      gender?: string
      ageGroup?: string
      costPayment?: string
      status?: string
      tableNumber?: number
      confirmed?: boolean
    }[]
  }) => {
    try {
      setIsUpdatingInvite(true)
      
      const response = await fetch(`/api/admin/invites/${inviteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inviteData),
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh the invites list
        await fetchInvites()
        
        // Close the form and show success
        setShowManualForm(false)
        setEditingInvite(null)
        alert('✅ Convite atualizado com sucesso!')
        
        return { success: true, invite: data.invite }
      } else {
        alert(`❌ Erro ao atualizar convite: ${data.message || 'Erro desconhecido'}`)
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('Erro ao atualizar convite:', error)
      alert('❌ Erro ao atualizar convite. Tente novamente.')
      return { success: false, error: 'Erro de conexão' }
    } finally {
      setIsUpdatingInvite(false)
    }
  }

  // Start editing an invite
  const startEditingInvite = (invite: Invite) => {
    setEditingInvite(invite)
    setShowManualForm(true)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingInvite(null)
    setShowManualForm(false)
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
    allInvites,
    filteredInvites: paginatedInvites, // Return paginated results
    searchTerm,
    filter,
    groupFilter,
    availableGroups,
    pagination,
    isLoading,
    isUploading,
    isCreatingInvite,
    isUpdatingInvite,
    deletingInvite,
    deletingGuest,
    showManualForm,
    editingInvite,
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
    fetchInvites,
    createManualInvite,
    updateInvite,
    startEditingInvite,
    cancelEditing
  }
}
