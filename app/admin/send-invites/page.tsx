"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, MessageCircle, Search, ExternalLink, ArrowLeft, Send, RefreshCw, RotateCcw } from "lucide-react"
import Link from "next/link"

interface Invite {
  id: number
  nameOnInvite: string
  phone?: string
  token?: string
  guestCount: number
}

export default function SendInvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [filteredInvites, setFilteredInvites] = useState<Invite[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchInvites()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredInvites(invites)
    } else {
      const filtered = invites.filter(invite =>
        invite.nameOnInvite.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invite.phone && invite.phone.includes(searchTerm))
      )
      setFilteredInvites(filtered)
    }
  }, [searchTerm, invites])

  const fetchInvites = async () => {
    try {
      // Add cache-busting parameter and no-cache headers to ensure fresh data
      const response = await fetch(`/api/admin/invites/send-list?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setInvites(data.invites)
        setFilteredInvites(data.invites)
      }
    } catch (error) {
      console.error('Erro ao carregar convites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateInviteUrl = (token: string) => {
    const baseUrl = window.location.origin
    return `${baseUrl}?invite=${token}`
  }

  const copyToClipboard = async (token: string, inviteName: string) => {
    if (!token) {
      alert('Este convite não possui um token válido')
      return
    }
    
    const url = generateInviteUrl(token)
    try {
      await navigator.clipboard.writeText(url)
      setCopySuccess(inviteName)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (error) {
      console.error('Erro ao copiar link:', error)
      alert('Erro ao copiar link')
    }
  }

  const sendWhatsApp = (token: string, phone: string, inviteName: string) => {
    if (!token) {
      alert('Este convite não possui um token válido')
      return
    }
    
    if (!phone) {
      alert('Este convite não possui número de telefone')
      return
    }
    
    const url = generateInviteUrl(token)
    const message = `Olá! Aqui está o link para confirmar presença nas Bodas de Pérola: ${url}`
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const generateToken = async (inviteId: number) => {
    try {
      const response = await fetch('/api/admin/invites/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteId }),
      })

      if (response.ok) {
        const data = await response.json()
        // Atualizar o convite na lista local
        setInvites(prev => prev.map(invite => 
          invite.id === inviteId 
            ? { ...invite, token: data.token }
            : invite
        ))
      }
    } catch (error) {
      console.error('Erro ao gerar token:', error)
      alert('Erro ao gerar token')
    }
  }

  const regenerateToken = async (inviteId: number, inviteName: string) => {
    const confirmMessage = `⚠️ Atenção!\n\nVocê está prestes a gerar um novo token para "${inviteName}".\n\n❌ O link antigo deixará de funcionar permanentemente.\n✅ Um novo link será criado.\n\nTem certeza que deseja continuar?`
    
    if (window.confirm(confirmMessage)) {
      try {
        const response = await fetch('/api/admin/invites/generate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inviteId }),
        })

        if (response.ok) {
          const data = await response.json()
          // Atualizar o convite na lista local
          setInvites(prev => prev.map(invite => 
            invite.id === inviteId 
              ? { ...invite, token: data.token }
              : invite
          ))
          alert(`✅ Novo token gerado com sucesso para "${inviteName}"!\n\nO link anterior não funciona mais.`)
        }
      } catch (error) {
        console.error('Erro ao regenerar token:', error)
        alert('Erro ao regenerar token')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Carregando convites...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-6 w-6" />
                Envio de Convites
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Lista de convites com links seguros para compartilhamento
              </p>
            </div>
            
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="search">Buscar convite</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsLoading(true)
                  fetchInvites()
                }}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredInvites.map((invite) => (
              <Card key={invite.id} className="border">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{invite.nameOnInvite}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {invite.phone && (
                          <p>📱 {invite.phone}</p>
                        )}
                        <p>👥 {invite.guestCount} convidado(s)</p>
                        {invite.token && (
                          <p className="text-xs font-mono bg-gray-100 p-1 rounded">
                            Token: {invite.token.substring(0, 8)}...
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      {invite.token ? (
                        <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => regenerateToken(invite.id, invite.nameOnInvite)}
                            className="flex items-center gap-2 text-orange-600 border-orange-200 hover:border-orange-600"
                            title="Gerar novo token (o link atual deixará de funcionar)"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Novo Token
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(invite.token!, invite.nameOnInvite)}
                            className="flex items-center gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            {copySuccess === invite.nameOnInvite ? 'Copiado!' : 'Copiar Link'}
                          </Button>
                          
                          
                          
                          {invite.phone && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => sendWhatsApp(invite.token!, invite.phone!, invite.nameOnInvite)}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            >
                              <MessageCircle className="h-4 w-4" />
                              WhatsApp
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateToken(invite.id)}
                          className="flex items-center gap-2"
                        >
                          Gerar Token
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredInvites.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  {searchTerm ? 'Nenhum convite encontrado com esse termo' : 'Nenhum convite encontrado'}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}