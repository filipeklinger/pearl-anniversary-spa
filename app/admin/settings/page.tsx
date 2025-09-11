"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Settings, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminSettings() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    thankYouMessage: "",
    confirmationDeadline: "",
  })
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/admin/login")
      return
    }
    fetchSettings()
  }, [session, status, router])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({
          thankYouMessage: data.thankYouMessage || "Obrigado pela confirmação! Sua presença é muito importante para nós. 💕",
          confirmationDeadline: data.confirmationDeadline || "",
        })
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSetting = async (key: string, value: string) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar configuração')
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      throw error
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage("")

    try {
      await Promise.all([
        saveSetting('thankYouMessage', settings.thankYouMessage),
        saveSetting('confirmationDeadline', settings.confirmationDeadline),
      ])

      setMessage("Configurações salvas com sucesso!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Erro ao salvar configurações. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <Settings className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-800">Configurações</h1>
              <p className="text-slate-600 text-sm">Bodas de Pérola - Robson & Roseli</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Mensagem de Agradecimento */}
          <Card>
            <CardHeader>
              <CardTitle>Mensagem de Agradecimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="thankYouMessage">
                  Mensagem exibida após confirmação de presença
                </Label>
                <Textarea
                  id="thankYouMessage"
                  value={settings.thankYouMessage}
                  onChange={(e) => setSettings(prev => ({ ...prev, thankYouMessage: e.target.value }))}
                  placeholder="Digite a mensagem de agradecimento..."
                  rows={4}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Esta mensagem será personalizada com o nome do convite automaticamente.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Limite */}
          <Card>
            <CardHeader>
              <CardTitle>Data Limite para Confirmações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="confirmationDeadline">
                  Data e hora limite para confirmações
                </Label>
                <Input
                  id="confirmationDeadline"
                  type="datetime-local"
                  value={settings.confirmationDeadline}
                  onChange={(e) => setSettings(prev => ({ ...prev, confirmationDeadline: e.target.value }))}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Após esta data, o formulário de confirmação será desabilitado.
                  Deixe em branco para não ter limite.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botão Salvar */}
          <div className="flex justify-end gap-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>

          {/* Mensagem de feedback */}
          {message && (
            <div className={`text-center p-3 rounded-lg ${
              message.includes("sucesso") 
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
