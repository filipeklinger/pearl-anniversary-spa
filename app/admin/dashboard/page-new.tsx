"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Heart, 
  Users, 
  CheckCircle, 
  XCircle, 
  LogOut, 
  Download, 
  Upload,
  FileSpreadsheet,
  Search,
  Settings
} from "lucide-react"
import * as XLSX from 'xlsx'
import Link from "next/link"

interface Invite {
  id: number
  nameOnInvite: string
  phone?: string
  code?: string
  guests: Guest[]
  confirmedCount: number
  totalGuests: number
}

interface Guest {
  id: number
  fullName: string
  confirmed: boolean
  inviteId: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [invites, setInvites] = useState<Invite[]>([])
  const [filteredInvites, setFilteredInvites] = useState<Invite[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalInvites: 0,
    totalGuests: 0,
    confirmedGuests: 0,
    confirmationRate: 0
  })
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/admin/login")
      return
    }
    fetchInvites()
  }, [session, status, router])

  useEffect(() => {
    filterInvites()
  }, [invites, searchTerm, filter])

  const fetchInvites = async () => {
    try {
      const response = await fetch('/api/admin/invites')
      if (response.ok) {
        const data = await response.json()
        setInvites(data.invites)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erro ao buscar convites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterInvites = () => {
    let filtered = invites

    if (searchTerm) {
      filtered = filtered.filter(invite => 
        invite.nameOnInvite.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invite.phone && invite.phone.includes(searchTerm))
      )
    }

    if (filter !== "all") {
      filtered = filtered.filter(invite => {
        if (filter === "confirmed") {
          return invite.confirmedCount > 0
        } else if (filter === "pending") {
          return invite.confirmedCount === 0
        }
        return true
      })
    }

    setFilteredInvites(filtered)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      const response = await fetch('/api/admin/upload-invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: jsonData }),
      })

      if (response.ok) {
        fetchInvites()
        alert('Planilha importada com sucesso!')
      } else {
        alert('Erro ao importar planilha')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao processar arquivo')
    }

    // Reset do input
    event.target.value = ''
  }

  const exportData = async () => {
    try {
      const response = await fetch('/api/admin/export-invites')
      if (response.ok) {
        const data = await response.json()
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Confirmações')
        XLSX.writeFile(workbook, `confirmacoes_${new Date().toISOString().split('T')[0]}.xlsx`)
      }
    } catch (error) {
      console.error('Erro na exportação:', error)
      alert('Erro ao exportar dados')
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/login' })
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-800">Painel Administrativo</h1>
              <p className="text-slate-600 text-sm">Bodas de Pérola - Robson & Roseli</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/settings">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-white border-slate-300 text-slate-800 hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Convites</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvites}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Convidados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGuests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmedGuests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Confirmação</CardTitle>
              <Heart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmationRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="file-upload" className="sr-only">
              Upload planilha
            </Label>
            <div className="relative">
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => document.getElementById('file-upload')?.click()}
                className="w-full sm:w-auto"
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar Planilha
              </Button>
            </div>
          </div>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por nome ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="filter">Status</Label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as "all" | "confirmed" | "pending")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">Todos</option>
                  <option value="confirmed">Com Confirmação</option>
                  <option value="pending">Pendentes</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invites List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Convites ({filteredInvites.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{invite.nameOnInvite}</h3>
                    {invite.phone && (
                      <p className="text-sm text-muted-foreground">{invite.phone}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={invite.confirmedCount > 0 ? "default" : "secondary"}>
                        {invite.confirmedCount} / {invite.totalGuests} confirmados
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {invite.confirmedCount > 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
              
              {filteredInvites.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || filter !== "all" 
                    ? "Nenhum convite encontrado com os filtros aplicados."
                    : "Nenhum convite cadastrado ainda. Importe uma planilha para começar."
                  }
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
