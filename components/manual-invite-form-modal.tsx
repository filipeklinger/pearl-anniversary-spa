"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, X, User, Phone, Hash, Users, MessageSquare, Edit } from "lucide-react"

interface Guest {
  id: string | number
  fullName: string
  gender?: string
  ageGroup?: string
  costPayment?: string
  status?: string
  tableNumber?: number
  confirmed?: boolean
}

interface ExistingInvite {
  id: number
  nameOnInvite: string
  ddi?: string
  phone?: string
  group?: string
  observation?: string
  code?: string
  guests: {
    id: number
    fullName: string
    gender?: string
    ageGroup?: string
    costPayment?: string
    status?: string
    tableNumber?: number
    confirmed: boolean
  }[]
}

interface ManualInviteFormProps {
  onSubmit: (data: {
    nameOnInvite: string
    ddi?: string
    phone?: string
    group?: string
    observation?: string
    code?: string
    guests: (Omit<Guest, 'id'> & { id?: number })[]
  }) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
  availableGroups: string[]
  onCancel: () => void
  editingInvite?: ExistingInvite | null
  isEditing?: boolean
}

export function ManualInviteForm({ 
  onSubmit, 
  isLoading, 
  availableGroups, 
  onCancel, 
  editingInvite = null, 
  isEditing = false 
}: ManualInviteFormProps) {
  const [formData, setFormData] = useState({
    nameOnInvite: "",
    ddi: "",
    phone: "",
    group: "",
    observation: "",
    code: ""
  })

  const [guests, setGuests] = useState<Guest[]>([
    { id: "1", fullName: "" }
  ])

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Initialize form with editing data
  useEffect(() => {
    if (editingInvite && isEditing) {
      setFormData({
        nameOnInvite: editingInvite.nameOnInvite || "",
        ddi: editingInvite.ddi || "",
        phone: editingInvite.phone || "",
        group: editingInvite.group || "",
        observation: editingInvite.observation || "",
        code: editingInvite.code || ""
      })

      if (editingInvite.guests && editingInvite.guests.length > 0) {
        setGuests(editingInvite.guests.map(guest => ({
          id: guest.id,
          fullName: guest.fullName,
          gender: guest.gender,
          ageGroup: guest.ageGroup,
          costPayment: guest.costPayment,
          status: guest.status,
          tableNumber: guest.tableNumber,
          confirmed: guest.confirmed
        })))
      }
    } else {
      // Reset form for new invite
      setFormData({
        nameOnInvite: "",
        ddi: "",
        phone: "",
        group: "",
        observation: "",
        code: ""
      })
      setGuests([{ id: "1", fullName: "" }])
    }
    setErrors({})
  }, [editingInvite, isEditing])

  // Add new guest
  const addGuest = () => {
    const newGuest: Guest = {
      id: Date.now().toString(),
      fullName: ""
    }
    setGuests([...guests, newGuest])
  }

  // Remove guest
  const removeGuest = (guestId: string | number) => {
    if (guests.length > 1) {
      setGuests(guests.filter(g => g.id !== guestId))
    }
  }

  // Update guest data
  const updateGuest = (guestId: string | number, field: keyof Guest, value: string | number | boolean) => {
    setGuests(guests.map(guest => 
      guest.id === guestId ? { ...guest, [field]: value } : guest
    ))
  }

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.nameOnInvite.trim()) {
      newErrors.nameOnInvite = "Nome do convite é obrigatório"
    }

    const validGuests = guests.filter(g => g.fullName.trim())
    if (validGuests.length === 0) {
      newErrors.guests = "Pelo menos um convidado deve ser adicionado"
    }

    guests.forEach((guest, index) => {
      if (!guest.fullName.trim()) {
        newErrors[`guest_${guest.id}`] = "Nome completo é obrigatório"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const validGuests = guests
      .filter(g => g.fullName.trim())
      .map(guest => ({
        id: typeof guest.id === 'number' ? guest.id : undefined,
        fullName: guest.fullName,
        gender: guest.gender,
        ageGroup: guest.ageGroup,
        costPayment: guest.costPayment,
        status: guest.status,
        tableNumber: guest.tableNumber || undefined,
        confirmed: guest.confirmed || false
      }))

    const submitData = {
      ...formData,
      ddi: formData.ddi || undefined,
      phone: formData.phone || undefined,
      group: formData.group || undefined,
      observation: formData.observation || undefined,
      code: formData.code || undefined,
      guests: validGuests
    }

    const result = await onSubmit(submitData)
    
    if (result.success) {
      // Reset form
      setFormData({
        nameOnInvite: "",
        ddi: "",
        phone: "",
        group: "",
        observation: "",
        code: ""
      })
      setGuests([{ id: "1", fullName: "" }])
      setErrors({})
    }
  }

  return (
    <div className="p-4 sm:p-6 overflow-x-hidden max-w-full">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
        {/* Dados do Convite */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-foreground border-b pb-2">
            Dados do Convite
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-full">
            <div className="sm:col-span-1 min-w-0">
              <Label htmlFor="nameOnInvite" className="text-sm">Nome no Convite *</Label>
              <Input
                id="nameOnInvite"
                value={formData.nameOnInvite}
                onChange={(e) => setFormData({ ...formData, nameOnInvite: e.target.value })}
                placeholder="Ex: Família Silva"
                className={`text-sm w-full ${errors.nameOnInvite ? "border-red-500" : ""}`}
              />
              {errors.nameOnInvite && (
                <p className="text-xs text-red-500 mt-1">{errors.nameOnInvite}</p>
              )}
            </div>

            <div className="sm:col-span-1 min-w-0">
              <Label htmlFor="code" className="text-sm">Código do Convite</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: FAM001"
                className="text-sm w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-full">
            <div>
              <Label htmlFor="ddi" className="text-sm">DDI</Label>
              <Input
                id="ddi"
                value={formData.ddi}
                onChange={(e) => setFormData({ ...formData, ddi: e.target.value })}
                placeholder="55"
                className="text-sm w-full"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="phone" className="text-sm">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="text-sm w-full"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="group" className="text-sm">Grupo</Label>
            <select
              id="group"
              value={formData.group}
              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-background"
            >
              <option value="">Selecione um grupo</option>
              {availableGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="observation" className="text-sm">Observações</Label>
            <Textarea
              id="observation"
              value={formData.observation}
              onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              placeholder="Observações sobre o convite..."
              rows={2}
              className="text-sm w-full"
            />
          </div>
        </div>

        {/* Lista de Convidados */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-foreground border-b pb-2 flex-1">
              Convidados
            </h3>
            <Button type="button" onClick={addGuest} size="sm" variant="outline" className="text-sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Adicionar Convidado</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          </div>

          {errors.guests && (
            <p className="text-xs sm:text-sm text-red-500">{errors.guests}</p>
          )}

          <div className="space-y-3 sm:space-y-4 max-w-full overflow-x-hidden">
            {guests.map((guest, index) => (
              <div key={guest.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50 max-w-full overflow-x-hidden">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <h4 className="font-medium text-sm text-gray-700">
                    Convidado {index + 1}
                  </h4>
                  {guests.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGuest(guest.id)}
                      className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`fullName_${guest.id}`} className="text-sm">Nome Completo *</Label>
                    <Input
                      id={`fullName_${guest.id}`}
                      value={guest.fullName}
                      onChange={(e) => updateGuest(guest.id, 'fullName', e.target.value)}
                      placeholder="Nome completo do convidado"
                      className={`text-sm w-full ${errors[`guest_${guest.id}`] ? "border-red-500" : ""}`}
                    />
                    {errors[`guest_${guest.id}`] && (
                      <p className="text-xs text-red-500 mt-1">{errors[`guest_${guest.id}`]}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-full">
                    <div>
                      <Label htmlFor={`gender_${guest.id}`} className="text-sm">Gênero</Label>
                      <select
                        id={`gender_${guest.id}`}
                        value={guest.gender || ""}
                        onChange={(e) => updateGuest(guest.id, 'gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-background"
                      >
                        <option value="">Selecione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor={`ageGroup_${guest.id}`} className="text-sm">Faixa Etária</Label>
                      <select
                        id={`ageGroup_${guest.id}`}
                        value={guest.ageGroup || ""}
                        onChange={(e) => updateGuest(guest.id, 'ageGroup', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-background"
                      >
                        <option value="">Selecione</option>
                        <option value="Criança">Criança</option>
                        <option value="Adolescente">Adolescente</option>
                        <option value="Adulto">Adulto</option>
                        <option value="Idoso">Idoso</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`costPayment_${guest.id}`} className="text-sm">Pagamento</Label>
                      <select
                        id={`costPayment_${guest.id}`}
                        value={guest.costPayment || ""}
                        onChange={(e) => updateGuest(guest.id, 'costPayment', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="">Selecione</option>
                        <option value="Inteira">Inteira</option>
                        <option value="Meia">Meia</option>
                        <option value="Cortesia">Cortesia</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor={`status_${guest.id}`} className="text-sm">Status</Label>
                      <select
                        id={`status_${guest.id}`}
                        value={guest.status || ""}
                        onChange={(e) => updateGuest(guest.id, 'status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="">Selecione</option>
                        <option value="Confirmado">Confirmado</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Cancelado">Não vai comparecer</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="text-sm">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="text-sm">
            {isLoading 
              ? (isEditing ? "Atualizando..." : "Salvando...") 
              : (isEditing ? "Atualizar Convite" : "Salvar Convite")
            }
          </Button>
        </div>
      </form>
    </div>
  )
}