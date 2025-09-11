"use client"

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
  Settings,
  Circle,
  CircleCheckBig,
  Trash2,
  UserX
} from "lucide-react"
import Link from "next/link"
import { useAdminDashboard } from "@/hooks/useAdminDashboard"

export default function AdminDashboard() {
  const {
    session,
    status,
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
    setSearchTerm,
    setFilter,
    setShowManualForm,
    handleFileUpload,
    exportToExcel,
    handleSignOut,
    handleDeleteInvite,
    handleDeleteGuest,
    handlePageChange,
    handleGroupFilterChange
  } = useAdminDashboard()

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground">Carregando...</p>
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
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-muted-foreground text-sm">Bodas de Pérola</h1>
                <p className="font-serif text-2xl font-bold text-foreground">Painel Administrativo</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/admin/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </Link>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
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
              <div className="text-2xl font-bold text-green-600">{stats.confirmedGuests}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Confirmação</CardTitle>
              <CircleCheckBig className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.confirmationRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Feedback */}
        {uploadFeedback && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Upload realizado com sucesso!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              {uploadFeedback.added} novos convites adicionados, {uploadFeedback.updated} atualizados.
            </p>
          </div>
        )}

        {/* Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button asChild disabled={isUploading}>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? "Enviando..." : "Importar Planilha"}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              <Button onClick={exportToExcel} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>

              <Button 
                onClick={() => setShowManualForm(!showManualForm)} 
                variant="outline"
              >
                {showManualForm ? "Cancelar" : "Cadastro Manual"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Form */}
        {showManualForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Cadastro Manual de Convite</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Formulário de cadastro manual será implementado em breve.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <CardTitle>Lista de Convites</CardTitle>
              
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar convites ou convidados..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 min-w-[250px]"
                  />
                </div>

                {/* Group Filter */}
                <select
                  value={groupFilter}
                  onChange={(e) => handleGroupFilterChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="all">Todos os grupos</option>
                  {availableGroups.map(group => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as "all" | "confirmed" | "pending")}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="all">Todos</option>
                  <option value="confirmed">Confirmados</option>
                  <option value="pending">Pendentes</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInvites.map((invite) => (
                <div key={invite.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{invite.nameOnInvite}</h3>
                        {invite.group && (
                          <Badge variant="secondary" className="text-xs">
                            {invite.group}
                          </Badge>
                        )}
                        <Badge variant={invite.confirmedCount > 0 ? "default" : "outline"}>
                          {invite.confirmedCount}/{invite.totalGuests} confirmados
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        {invite.phone && (
                          <span>📱 {invite.ddi ? `+${invite.ddi} ` : ''}{invite.phone}</span>
                        )}
                        {invite.code && (
                          <span>🎫 {invite.code}</span>
                        )}
                      </div>

                      {invite.observation && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-3">
                          💬 {invite.observation}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteInvite(invite.id, invite.nameOnInvite)}
                      disabled={deletingInvite === invite.id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingInvite === invite.id ? (
                        <div className="animate-spin h-4 w-4 border border-red-500 border-t-transparent rounded-full" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {invite.guests.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid gap-2">
                        {invite.guests.map((guest) => (
                          <div key={guest.id} className="group flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-3 flex-1" title={guest.confirmed ? "Confirmado" : "Não confirmado"}>
                              {guest.confirmed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400" />
                              )}
                              
                              <div className="flex-1">
                                <span className={`font-medium ${guest.confirmed ? 'text-green-700' : 'text-gray-700'}`}>
                                  {guest.fullName}
                                </span>
                                
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {guest.gender && (
                                    <Badge variant="outline" className="text-xs">
                                      {guest.gender}
                                    </Badge>
                                  )}
                                  {guest.ageGroup && (
                                    <Badge variant="outline" className="text-xs">
                                      {guest.ageGroup}
                                    </Badge>
                                  )}
                                  {guest.status && (
                                    <Badge variant="outline" className="text-xs">
                                      {guest.status}
                                    </Badge>
                                  )}
                                  {guest.tableNumber && (
                                    <Badge variant="outline" className="text-xs">
                                      Mesa {guest.tableNumber}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGuest(guest.id, guest.fullName, invite.nameOnInvite)}
                              disabled={deletingGuest === guest.id}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-100 p-0.5 h-6 w-6"
                              title={`Remover ${guest.fullName}`}
                            >
                              {deletingGuest === guest.id ? (
                                <div className="animate-spin h-3 w-3 border border-red-500 border-t-transparent rounded-full" />
                              ) : (
                                <UserX className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
            
            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Página {pagination.page} de {pagination.totalPages} • {pagination.total} convites no total
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    Anterior
                  </Button>
                  
                  {/* Números das páginas */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, pagination.page - 2) + i;
                      if (pageNum > pagination.totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
