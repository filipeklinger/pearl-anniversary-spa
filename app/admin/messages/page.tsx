"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MessageCircle, 
  Search, 
  ArrowLeft, 
  Users, 
  Calendar,
  Heart,
  Filter
} from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface MessageData {
  id: number
  inviteId: number
  nameOnInvite: string
  phone?: string
  group?: string
  message: string
  guestName?: string
  status?: string
  updatedAt: string
  confirmedCount: number
  totalGuests: number
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState<MessageData[]>([])
  const [filteredMessages, setFilteredMessages] = useState<MessageData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "cancelled">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMessages: 0,
    confirmedMessages: 0,
    cancelledMessages: 0
  })

  useEffect(() => {
    if (session) {
      fetchMessages()
    }
  }, [session])

  useEffect(() => {
    filterMessages()
  }, [messages, searchTerm, statusFilter])

  const fetchMessages = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
        setStats(data.stats)
      } else {
        console.error('Erro ao buscar mensagens')
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterMessages = () => {
    let filtered = messages

    // Filtro por busca (nome do convite ou nome do convidado)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(msg => 
        msg.nameOnInvite.toLowerCase().includes(search) ||
        (msg.guestName && msg.guestName.toLowerCase().includes(search)) ||
        msg.message.toLowerCase().includes(search)
      )
    }

    // Filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter(msg => {
        if (statusFilter === "confirmed") {
          return msg.status === "Confirmado" || msg.confirmedCount > 0
        } else if (statusFilter === "cancelled") {
          return msg.status === "Cancelado" || msg.confirmedCount === 0
        }
        return true
      })
    }

    setFilteredMessages(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (msg: MessageData) => {
    if (msg.status === "Confirmado" || msg.confirmedCount > 0) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmado</Badge>
    } else if (msg.status === "Cancelado" || msg.confirmedCount === 0) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Não comparecerá</Badge>
    }
    return <Badge variant="secondary">Pendente</Badge>
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground">Carregando mensagens...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-muted-foreground text-sm">Bodas de Pérola</h1>
                <p className="font-serif text-2xl font-bold text-foreground">Mensagens dos Convidados</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmações</CardTitle>
              <Heart className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.confirmedMessages}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelamentos</CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelledMessages}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome, convidado ou conteúdo da mensagem..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "confirmed" | "cancelled")}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="all">Todos os status</option>
                  <option value="confirmed">Confirmações</option>
                  <option value="cancelled">Cancelamentos</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Mensagens */}
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">
                  {searchTerm || statusFilter !== "all" 
                    ? "Nenhuma mensagem encontrada com os filtros aplicados"
                    : "Nenhuma mensagem enviada ainda"
                  }
                </p>
                <p className="text-gray-500 text-sm">
                  {searchTerm || statusFilter !== "all" 
                    ? "Tente ajustar os filtros para ver mais resultados"
                    : "As mensagens dos convidados aparecerão aqui conforme forem enviadas"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredMessages.map((msg) => (
              <Card key={`${msg.inviteId}-${msg.guestName || 'invite'}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {msg.nameOnInvite}
                        </h3>
                        {msg.guestName && (
                          <Badge variant="outline" className="text-xs">
                            👤 {msg.guestName}
                          </Badge>
                        )}
                        {getStatusBadge(msg)}
                        {msg.group && (
                          <Badge variant="secondary" className="text-xs">
                            {msg.group}
                          </Badge>
                        )}
                      </div>

                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-3">
                        <p className="text-gray-800 leading-relaxed">
                          "{msg.message}"
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        {msg.phone && (
                          <span className="flex items-center gap-1">
                            📱 {msg.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {msg.confirmedCount}/{msg.totalGuests} confirmados
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(msg.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Resultado da busca */}
        {(searchTerm || statusFilter !== "all") && filteredMessages.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Exibindo {filteredMessages.length} de {messages.length} mensagens
          </div>
        )}
      </main>
    </div>
  )
}
