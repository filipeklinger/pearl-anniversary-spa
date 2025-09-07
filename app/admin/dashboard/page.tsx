"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Gift, LogOut, Download, Calendar, MapPin } from "lucide-react"

interface RSVP {
  id: string
  nome: string
  tipoDoacao: "alimento" | "pix"
  numeroConvidados: string
  observacoes: string
  dataConfirmacao: string
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("admin-authenticated")
    if (!auth) {
      router.push("/admin/login")
      return
    }
    setIsAuthenticated(true)

    // Dados de exemplo - em produção viria de uma API
    const mockRSVPs: RSVP[] = [
      {
        id: "1",
        nome: "Maria Silva",
        tipoDoacao: "alimento",
        numeroConvidados: "2",
        observacoes: "Parabéns pelo casamento! Levarei arroz e feijão.",
        dataConfirmacao: "2024-11-15T10:30:00",
      },
      {
        id: "2",
        nome: "João Santos",
        tipoDoacao: "pix",
        numeroConvidados: "1",
        observacoes: "",
        dataConfirmacao: "2024-11-16T14:20:00",
      },
      {
        id: "3",
        nome: "Ana Costa e família",
        tipoDoacao: "alimento",
        numeroConvidados: "4",
        observacoes: "Muito feliz por vocês! Levaremos óleo e açúcar.",
        dataConfirmacao: "2024-11-17T09:15:00",
      },
      {
        id: "4",
        nome: "Carlos Oliveira",
        tipoDoacao: "pix",
        numeroConvidados: "2",
        observacoes: "Que Deus abençoe sempre vocês dois!",
        dataConfirmacao: "2024-11-18T16:45:00",
      },
    ]
    setRsvps(mockRSVPs)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("admin-authenticated")
    router.push("/admin/login")
  }

  const exportData = () => {
    const csvContent = [
      ["Nome", "Tipo de Doação", "Número de Convidados", "Observações", "Data de Confirmação"],
      ...rsvps.map((rsvp) => [
        rsvp.nome,
        rsvp.tipoDoacao === "alimento" ? "Alimento" : "PIX",
        rsvp.numeroConvidados,
        rsvp.observacoes,
        new Date(rsvp.dataConfirmacao).toLocaleString("pt-BR"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "confirmacoes-bodas-perola.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!isAuthenticated) {
    return <div>Carregando...</div>
  }

  const totalConvidados = rsvps.reduce((sum, rsvp) => sum + Number.parseInt(rsvp.numeroConvidados), 0)
  const totalAlimentos = rsvps.filter((rsvp) => rsvp.tipoDoacao === "alimento").length
  const totalPix = rsvps.filter((rsvp) => rsvp.tipoDoacao === "pix").length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-serif text-2xl font-bold text-card-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground text-sm">Bodas de Pérola - Robson & Roseli</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Estatísticas */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{rsvps.length}</p>
                  <p className="text-muted-foreground text-sm">Confirmações</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{totalConvidados}</p>
                  <p className="text-muted-foreground text-sm">Total de Convidados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{totalAlimentos}</p>
                  <p className="text-muted-foreground text-sm">Doações de Alimento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{totalPix}</p>
                  <p className="text-muted-foreground text-sm">Contribuições PIX</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Confirmações */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-2xl font-bold text-card-foreground">
              Confirmações de Presença
            </CardTitle>
            <Button onClick={exportData} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {rsvps.map((rsvp) => (
                <div
                  key={rsvp.id}
                  className="p-4 border border-border rounded-lg hover:bg-secondary/5 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-card-foreground text-lg">{rsvp.nome}</h3>
                        <Badge variant={rsvp.tipoDoacao === "alimento" ? "default" : "secondary"} className="text-xs">
                          {rsvp.tipoDoacao === "alimento" ? "Alimento" : "PIX"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {rsvp.numeroConvidados} pessoa(s)
                        </span>
                        <span>Confirmado em {new Date(rsvp.dataConfirmacao).toLocaleDateString("pt-BR")}</span>
                      </div>
                      {rsvp.observacoes && <p className="text-sm text-muted-foreground italic">"{rsvp.observacoes}"</p>}
                    </div>
                  </div>
                </div>
              ))}

              {rsvps.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma confirmação ainda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações do Evento */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-bold text-card-foreground">Informações do Evento</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-medium">Data:</span>
                  <span>15 de Dezembro, 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c-2.67 0-8-1.34-8-4v-2c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2c0 2.66-5.33 4-8 4z" />
                  </svg>
                  <span className="font-medium">Horário:</span>
                  <span>19:00 às 23:00</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="font-medium">Local:</span>
                  <span>Salão de Festas Pérola</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span className="font-medium">PIX:</span>
                  <span className="font-mono text-sm">robson.roseli@email.com</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
