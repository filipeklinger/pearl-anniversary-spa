"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, Users, Search, CheckCircle, XCircle } from "lucide-react"

interface Guest {
  id: number
  fullName: string
  confirmed: boolean
}

interface Invite {
  id: number
  nameOnInvite: string
  phone?: string
  guests: Guest[]
}

interface RSVPFormProps {
  inviteToken?: string | null
}

export default function RSVPForm({ inviteToken }: RSVPFormProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [foundInvites, setFoundInvites] = useState<Invite[]>([])
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null)
  const [selectedGuests, setSelectedGuests] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [thankYouMessage, setThankYouMessage] = useState("")

  // Carregar convite automaticamente se um token for fornecido
  useEffect(() => {
    if (inviteToken) {
      loadInviteByToken(inviteToken)
    }
  }, [inviteToken])

  const loadInviteByToken = async (token: string) => {
    setIsSearching(true)
    setError("")
    
    try {
      const response = await fetch(`/api/invite-by-token?token=${encodeURIComponent(token)}`)
      
      if (response.ok) {
        const data = await response.json()
        setSelectedInvite(data.invite)
        // Pré-seleciona convidados já confirmados
        const confirmedIds = data.invite.guests
          .filter((guest: Guest) => guest.confirmed)
          .map((guest: Guest) => guest.id)
        setSelectedGuests(confirmedIds)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Convite não encontrado')
      }
    } catch (error) {
      setError('Erro ao carregar convite. Tente novamente.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setIsSearching(true)
    setError("")
    setFoundInvites([])
    setSelectedInvite(null)

    try {
      //testar apenas se existe numeros no texto
      const isPhoneSearch = /\d/.test(searchTerm.trim());
      const cleanedSearch = isPhoneSearch ? searchTerm.trim().replace(/[\s()-]/g, '') : searchTerm.trim();

      const response = await fetch('/api/search-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm: cleanedSearch }),
      })

      if (response.ok) {
        const data = await response.json()
        setFoundInvites(data.invites)
        
        if (data.invites.length === 1) {
          // Se só encontrou um convite, seleciona automaticamente
          setSelectedInvite(data.invites[0])
          // Pré-seleciona convidados já confirmados
          const confirmedIds = data.invites[0].guests
            .filter((guest: Guest) => guest.confirmed)
            .map((guest: Guest) => guest.id)
          setSelectedGuests(confirmedIds)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Convite não encontrado')
      }
    } catch (error) {
      setError('Erro ao buscar convite. Tente novamente.')
    } finally {
      setIsSearching(false)
    }
  }

  const selectInvite = (invite: Invite) => {
    setSelectedInvite(invite)
    // Pré-seleciona convidados já confirmados
    const confirmedIds = invite.guests
      .filter(guest => guest.confirmed)
      .map(guest => guest.id)
    setSelectedGuests(confirmedIds)
  }

  const toggleGuest = (guestId: number) => {
    setSelectedGuests(prev => 
      prev.includes(guestId) 
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    )
  }

  const handleConfirm = async () => {
    if (!selectedInvite) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch('/api/confirm-guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guestIds: selectedGuests }),
      })

      if (response.ok) {
        // Buscar mensagem de agradecimento personalizada
        try {
          const settingsResponse = await fetch('/api/admin/settings')
          if (settingsResponse.ok) {
            const settings = await settingsResponse.json()
            setThankYouMessage(settings.thankYouMessage || "Obrigado pela confirmação! Sua presença é muito importante para nós. 💕")
          }
        } catch (error) {
          setThankYouMessage("Obrigado pela confirmação! Sua presença é muito importante para nós. 💕")
        }
        
        setIsSubmitted(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao confirmar presença')
      }
    } catch (error) {
      setError('Erro ao confirmar presença. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSearchTerm("")
    setFoundInvites([])
    setSelectedInvite(null)
    setSelectedGuests([])
    setIsSubmitted(false)
    setError("")
  }

  if (isSubmitted && selectedInvite) {
    return (
      <section id="rsvp" className="py-20 bg-secondary/10">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="font-serif text-2xl text-slate-800">
                Confirmação Realizada!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-slate-700 mb-4">
                Obrigado, <strong>{selectedInvite.nameOnInvite}</strong>!
              </p>
              <p className="text-slate-600 mb-6">
                {thankYouMessage}
                {selectedGuests.length > 0 
                  ? ` Aguardamos ${selectedGuests.length} pessoa${selectedGuests.length > 1 ? 's' : ''} na nossa celebração! 🎉`
                  : ''
                }
              </p>
              <Button 
                onClick={resetForm}
                variant="outline"
                className="bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
              >
                Fazer Nova Confirmação
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section id="rsvp" className="py-20 bg-secondary/10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <Heart className="w-12 h-12 text-primary mx-auto mb-6" />
          <p className="text-lg text-slate-600">
            Sua presença é muito importante para nós. Por favor, confirme sua participação.
          </p>
        </div>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-slate-800 text-center">
              {!selectedInvite ? "Nao foi possivel encontrar seu Convite" : "Selecione os Convidados"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedInvite ? (
              <div className="space-y-6">
                {/* Mostrar busca apenas se não houver token */}
                {!inviteToken && (
                  <p>Seu Link esta quebrado! O campo de confirmação não esta ativo. Entre em contato com o organizador do evento para que lhe envie um novo.</p>
                )}

                {/* Mensagem de carregamento quando tem token */}
                {inviteToken && isSearching && (
                  <div className="text-center p-6">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-600">Carregando seu convite...</p>
                  </div>
                )}

                {error && (
                  <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {foundInvites.length > 1 && (
                  <div className="space-y-2">
                    <Label className="text-slate-800 font-medium">
                      Múltiplos convites encontrados. Selecione o seu:
                    </Label>
                    {foundInvites.map((invite) => (
                      <Button
                        key={invite.id}
                        variant="outline"
                        onClick={() => selectInvite(invite)}
                        className="w-full justify-start bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        {invite.nameOnInvite}
                        {invite.phone && <span className="ml-2 text-slate-500">({invite.phone})</span>}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-1">
                    {selectedInvite.nameOnInvite}
                  </h3>
                  {selectedInvite.phone && (
                    <p className="text-blue-700 text-sm">{selectedInvite.phone}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-800 font-medium">
                    Quem irá comparecer? (Selecione os convidados)
                  </Label>
                  
                  {selectedInvite.guests.map((guest) => (
                    <div key={guest.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <Checkbox
                        id={`guest-${guest.id}`}
                        checked={selectedGuests.includes(guest.id)}
                        onCheckedChange={() => toggleGuest(guest.id)}
                      />
                      <Label 
                        htmlFor={`guest-${guest.id}`}
                        className="flex-1 text-slate-800 cursor-pointer"
                      >
                        {guest.fullName}
                      </Label>
                      {guest.confirmed && (
                        <div title="Já confirmado anteriormente">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  {/* <Button 
                    variant="outline"
                    onClick={() => setSelectedInvite(null)}
                    className="flex-1 bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
                  >
                    Voltar
                  </Button> */}
                  <Button 
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="flex-1 bg-primary text-white hover:bg-primary/90"
                  >
                    {isSubmitting ? "Confirmando..." : "Confirmar Presença"}
                  </Button>
                </div>

                {error && (
                  <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
