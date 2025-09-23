"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { ManualInviteForm } from "@/components/manual-invite-form-modal"
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
  UserX,
  Edit,
  Clock,
  Ban
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
    isCreatingInvite,
    isUpdatingInvite,
    deletingInvite,
    deletingGuest,
    showManualForm,
    editingInvite,
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
    handleGroupFilterChange,
    createManualInvite,
    updateInvite,
    startEditingInvite,
    cancelEditing
  } = useAdminDashboard()

  // Function to get status icon for a guest
  // Priority: confirmed field first (for backward compatibility), then status field
  const getGuestStatusIcon = (guest: any) => {
    // If confirmed is true, always show green checkmark (backward compatibility)
    if (guest.confirmed === true) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    
    // If confirmed is false and we have a new status field, use it
    if (guest.status && guest.status !== 'Pendente') {
      switch (guest.status) {
        case 'Confirmado':
          return <CheckCircle className="h-4 w-4 text-green-600" />
        case 'Cancelado':
          return <XCircle className="h-4 w-4 text-red-600" />
        default:
          return <Ban className="h-4 w-4 text-gray-400" />
      }
    }
    
    // Default: pending status
    return <Clock className="h-4 w-4 text-yellow-600" />
  }

  // Function to get complete status info for a guest
  // Priority: confirmed field first (for backward compatibility), then status field
  const getGuestStatusInfo = (guest: any) => {
    // If confirmed is true, always treat as confirmed (backward compatibility)
    if (guest.confirmed === true) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        title: 'Confirmado',
        bgColor: 'bg-green-50 hover:bg-green-100',
        textColor: 'text-green-800'
      }
    }
    
    // If confirmed is false and we have a new status field, use it
    if (guest.status && guest.status !== 'Pendente') {
      switch (guest.status) {
        case 'Confirmado':
          return {
            icon: <CheckCircle className="h-4 w-4 text-green-600" />,
            title: 'Confirmado',
            bgColor: 'bg-green-50 hover:bg-green-100',
            textColor: 'text-green-800'
          }
        case 'Cancelado':
          return {
            icon: <XCircle className="h-4 w-4 text-red-600" />,
            title: 'Cancelado',
            bgColor: 'bg-red-50 hover:bg-red-100',
            textColor: 'text-red-800'
          }
        default:
          return {
            icon: <Ban className="h-4 w-4 text-gray-400" />,
            title: 'Não Respondido',
            bgColor: 'bg-gray-50 hover:bg-gray-100',
            textColor: 'text-gray-600'
          }
      }
    }
    
    // Default: pending status
    return {
      icon: <Clock className="h-4 w-4 text-yellow-600" />,
      title: 'Pendente',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100',
      textColor: 'text-yellow-800'
    }
  }

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
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-start md:items-center space-x-4">
          <div>
            <h1 className="text-muted-foreground text-sm">Bodas de Pérola</h1>
            <p className="font-serif text-2xl font-bold text-foreground">Painel Administrativo</p>
          </div>
        </div>
        
        <div className="flex flex-row space-y-2 gap-1 justify-between md:justify-normal md:items-center md:space-y-0 md:space-x-4">
          <Link href="/admin/send-invites">
            <Button variant="default" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Enviar Convites
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="secondary" size="sm">
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelledGuests || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Confirmação</CardTitle>
              <CircleCheckBig className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.confirmationRate?.toFixed(1)}%</div>
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
                onClick={() => setShowManualForm(true)} 
                variant="outline"
              >
                Cadastro Manual
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <CardTitle>Lista de Convites</CardTitle>
              
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 h-4 w-4" />
                  <Input
                    placeholder="Buscar convites ou convidados..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 min-w-[250px] border-border"
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
                  <option value="all">Todos os status</option>
                  <option value="confirmed">Com confirmados</option>
                  <option value="pending">Sem confirmação</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInvites.map((invite) => (
                <div key={invite.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row items-start justify-between flex-wrap">
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-3 mb-2">
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
                      
                      <div className="flex flex-col md:flex-row flex-wrap gap-4 text-sm text-gray-600 mb-3">
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

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingInvite(invite)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        title="Editar convite"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteInvite(invite.id, invite.nameOnInvite)}
                        disabled={deletingInvite === invite.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Deletar convite"
                      >
                        {deletingInvite === invite.id ? (
                          <div className="animate-spin h-4 w-4 border border-red-500 border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {invite.guests.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid gap-2">
                        {invite.guests.map((guest) => {
                          const statusInfo = getGuestStatusInfo(guest)
                          return (
                            <div key={guest.id} className={`group flex items-center justify-between py-2 px-3 rounded-lg ${statusInfo.bgColor} transition-colors`}>
                              <div className="flex items-center space-x-3 flex-1" title={statusInfo.title}>
                                {statusInfo.icon}
                                
                                <div className="flex-1">
                                  <span className={`font-medium ${statusInfo.textColor}`}>
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
                                      <Badge 
                                        variant={
                                          guest.status === 'Confirmado' ? 'default' : 
                                          guest.status === 'Cancelado' ? 'destructive' : 
                                          'secondary'
                                        } 
                                        className="text-xs"
                                      >
                                        {guest.status}
                                      </Badge>
                                    )}
                                    {guest.tableNumber && (
                                      <Badge variant="outline" className="text-xs">
                                        Mesa {guest.tableNumber}
                                      </Badge>
                                    )}
                                    {guest.message && (
                                      <Badge variant="outline" className="text-xs" title={guest.message}>
                                        💬 Mensagem
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
                          )
                        })}
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

      {/* Modal para Formulário */}
      <Modal
        isOpen={showManualForm}
        onClose={editingInvite ? cancelEditing : () => setShowManualForm(false)}
        title={editingInvite ? "Editar Convite" : "Cadastro Manual de Convite"}
        size="xl"
      >
        <ManualInviteForm
          onSubmit={editingInvite ? 
            (data) => updateInvite(editingInvite.id, data) : 
            createManualInvite
          }
          isLoading={editingInvite ? isUpdatingInvite : isCreatingInvite}
          availableGroups={availableGroups}
          onCancel={editingInvite ? cancelEditing : () => setShowManualForm(false)}
          editingInvite={editingInvite}
          isEditing={!!editingInvite}
        />
      </Modal>
    </div>
  )
}
