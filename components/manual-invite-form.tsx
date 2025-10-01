"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {isEditing ? <Edit className="h-5 w-5" /> : <User className="h-5 w-5" />}
            {isEditing ? "Editar Convite" : "Cadastro Manual de Convite"}
          </span>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Convite */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">
              Dados do Convite
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nameOnInvite">Nome no Convite *</Label>
                <Input
                  id="nameOnInvite"
                  value={formData.nameOnInvite}
                  onChange={(e) => setFormData({ ...formData, nameOnInvite: e.target.value })}
                  placeholder="Ex: Família Silva"
                  className={errors.nameOnInvite ? "border-red-500" : ""}
                />
                {errors.nameOnInvite && (
                  <p className="text-sm text-red-500 mt-1">{errors.nameOnInvite}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ddi">DDI</Label>
                <Input
                  id="ddi"
                  value={formData.ddi}
                  onChange={(e) => setFormData({ ...formData, ddi: e.target.value })}
                  placeholder="55"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="group">Grupo</Label>
              <select
                id="group"
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="">Selecione um grupo</option>
                {availableGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="observation">Observações</Label>
              <Textarea
                id="observation"
                value={formData.observation}
                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                placeholder="Observações sobre o convite..."
                rows={3}
              />
            </div>
          </div>

          {/* Lista de Convidados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2 flex-1">
                Convidados
              </h3>
              <Button type="button" onClick={addGuest} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Convidado
              </Button>
            </div>

            {errors.guests && (
              <p className="text-sm text-red-500">{errors.guests}</p>
            )}

            <div className="space-y-4">
              {guests.map((guest, index) => (
                <div key={guest.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <Label htmlFor={`fullName_${guest.id}`}>Nome Completo *</Label>
                      <Input
                        id={`fullName_${guest.id}`}
                        value={guest.fullName}
                        onChange={(e) => updateGuest(guest.id, 'fullName', e.target.value)}
                        placeholder="Nome completo do convidado"
                        className={errors[`guest_${guest.id}`] ? "border-red-500" : ""}
                      />
                      {errors[`guest_${guest.id}`] && (
                        <p className="text-sm text-red-500 mt-1">{errors[`guest_${guest.id}`]}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`gender_${guest.id}`}>Gênero</Label>
                      <select
                        id={`gender_${guest.id}`}
                        value={guest.gender || ""}
                        onChange={(e) => updateGuest(guest.id, 'gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="">Selecione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor={`ageGroup_${guest.id}`}>Faixa Etária</Label>
                      <select
                        id={`ageGroup_${guest.id}`}
                        value={guest.ageGroup || ""}
                        onChange={(e) => updateGuest(guest.id, 'ageGroup', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="">Selecione</option>
                        <option value="Criança">Criança</option>
                        <option value="Adolescente">Adolescente</option>
                        <option value="Adulto">Adulto</option>
                        <option value="Idoso">Idoso</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor={`costPayment_${guest.id}`}>Tipo de Pagamento</Label>
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
                      <Label htmlFor={`status_${guest.id}`}>Status</Label>
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
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? (isEditing ? "Atualizando..." : "Salvando...") 
                : (isEditing ? "Atualizar Convite" : "Salvar Convite")
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}