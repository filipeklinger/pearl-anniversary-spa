"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Settings, Save, ArrowLeft, UserPlus, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function AdminSettings() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const [settings, setSettings] = useState({
    thankYouMessage: "",
    confirmationDeadline: "",
  })
  const [newAdmin, setNewAdmin] = useState({
    email: "",
    password: "",
    confirmPassword: ""
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

  const handleCreateAdmin = async () => {
    if (newAdmin.password !== newAdmin.confirmPassword) {
      setMessage("As senhas não coincidem!")
      return
    }

    if (newAdmin.password.length < 6) {
      setMessage("A senha deve ter pelo menos 6 caracteres!")
      return
    }

    setIsCreatingAdmin(true)
    setMessage("")

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newAdmin.email,
          password: newAdmin.password,
        }),
      })

      if (response.ok) {
        setMessage("Admin criado com sucesso!")
        setNewAdmin({ email: "", password: "", confirmPassword: "" })
        setTimeout(() => setMessage(""), 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setMessage(`Erro ao criar admin: ${errorData.message || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao criar admin:', error)
      setMessage("Erro ao criar admin. Tente novamente.")
    } finally {
      setIsCreatingAdmin(false)
    }
  }

  const handleDeleteAllData = async () => {
    const confirmText = window.prompt(
      `🚨 PERIGO EXTREMO! 🚨\n\n` +
      `Você está prestes a DELETAR TODOS OS DADOS:\n\n` +
      `• TODOS os convites\n` +
      `• TODOS os convidados\n` +
      `• TODAS as confirmações\n` +
      `• TODAS as configurações\n\n` +
      `Esta ação é IRREVERSÍVEL!\n` +
      `Todos os dados serão perdidos para sempre!\n\n` +
      `Digite "DELETAR TUDO" para confirmar:`
    )

    if (confirmText !== "DELETAR TUDO") {
      if (confirmText) {
        alert("Confirmação incorreta. Operação cancelada por segurança.")
      }
      return
    }

    const doubleCheck = window.confirm(
      `ÚLTIMA CONFIRMAÇÃO!\n\n` +
      `Tem ABSOLUTA CERTEZA que deseja deletar TODOS os dados?\n\n` +
      `Esta ação NÃO pode ser desfeita!`
    )

    if (!doubleCheck) return

    setIsDeletingAll(true)
    setMessage("")

    try {
      const response = await fetch('/api/admin/delete-all-data', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmText: confirmText,
        }),
      })

      if (response.ok) {
        setMessage("✅ Todos os dados foram deletados com sucesso!")
        // Reset local state
        setSettings({
          thankYouMessage: "Obrigado pela confirmação! Sua presença é muito importante para nós. 💕",
          confirmationDeadline: "",
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        setMessage(`❌ Erro ao deletar dados: ${errorData.message || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao deletar dados:', error)
      setMessage("❌ Erro ao deletar dados. Tente novamente.")
    } finally {
      setIsDeletingAll(false)
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

          {/* Cadastro de Admin */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Cadastrar Novo Administrador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adminEmail">Email do Administrador</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@exemplo.com"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="adminPassword">Senha</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={newAdmin.confirmPassword}
                  onChange={(e) => setNewAdmin(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Digite a senha novamente"
                  className="mt-2"
                />
              </div>
              <Button
                onClick={handleCreateAdmin}
                disabled={isCreatingAdmin || !newAdmin.email || !newAdmin.password || !newAdmin.confirmPassword}
                className="w-full"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isCreatingAdmin ? "Criando..." : "Criar Administrador"}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                Zona de Perigo
              </CardTitle>
              <p className="text-sm text-red-600">
                Ações irreversíveis que podem causar perda permanente de dados.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-700 mb-2">Deletar Todos os Dados</h3>
                <p className="text-sm text-red-600 mb-4">
                  Esta ação irá deletar permanentemente:
                </p>
                <ul className="text-sm text-red-600 mb-4 list-disc list-inside space-y-1">
                  <li>Todos os convites cadastrados</li>
                  <li>Todos os convidados</li>
                  <li>Todas as confirmações de presença</li>
                  <li>Todas as configurações personalizadas</li>
                </ul>
                <p className="text-sm font-semibold text-red-700 mb-4">
                  ⚠️ Esta ação NÃO pode ser desfeita!
                </p>
                <Button
                  onClick={handleDeleteAllData}
                  disabled={isDeletingAll}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeletingAll ? "Deletando..." : "Deletar Todos os Dados"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
