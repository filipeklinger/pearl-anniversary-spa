"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Users } from "lucide-react"

const convitesCadastrados = [
  { nomeConvite: "Família Silva", pessoas: ["João Silva", "Maria Silva", "Pedro Silva"] },
  { nomeConvite: "Família Santos", pessoas: ["Ana Santos", "Carlos Santos"] },
  {
    nomeConvite: "Família Oliveira",
    pessoas: ["Roberto Oliveira", "Lucia Oliveira", "Bruno Oliveira", "Carla Oliveira"],
  },
  { nomeConvite: "Amigos da Faculdade", pessoas: ["Marcos", "Patricia", "Fernando"] },
  { nomeConvite: "Vizinhos", pessoas: ["Dona Rosa", "Seu José"] },
]

export default function RSVPForm() {
  const [formData, setFormData] = useState({
    nomeConvite: "",
    observacoes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [sugestoes, setSugestoes] = useState<string[]>([])
  const [pessoasConvite, setPessoasConvite] = useState<string[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

  useEffect(() => {
    if (formData.nomeConvite.length > 0) {
      const sugestoesFiltradas = convitesCadastrados
        .filter((convite) => convite.nomeConvite.toLowerCase().includes(formData.nomeConvite.toLowerCase()))
        .map((convite) => convite.nomeConvite)
      setSugestoes(sugestoesFiltradas)
      setMostrarSugestoes(true)
    } else {
      setSugestoes([])
      setMostrarSugestoes(false)
      setPessoasConvite([])
    }
  }, [formData.nomeConvite])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simular envio do formulário
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selecionarConvite = (nomeConvite: string) => {
    setFormData((prev) => ({ ...prev, nomeConvite }))
    setMostrarSugestoes(false)

    const convite = convitesCadastrados.find((c) => c.nomeConvite === nomeConvite)
    if (convite) {
      setPessoasConvite(convite.pessoas)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="bg-card border-border shadow-lg max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-slate-800 mb-4">Confirmação Recebida!</h3>
          <p className="text-slate-700 leading-relaxed">
            Obrigado por confirmar sua presença! Estamos ansiosos para celebrar este momento especial com você.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border shadow-lg max-w-2xl mx-auto">
      <CardHeader className="text-center pb-6">
        <CardTitle className="font-serif text-3xl font-bold text-slate-800">Confirme sua Presença</CardTitle>
        <p className="text-slate-600">Ajude-nos a organizar nossa celebração preenchendo as informações abaixo</p>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative">
            <Label htmlFor="nomeConvite" className="text-slate-800 font-medium">
              Nome no Convite *
            </Label>
            <Input
              id="nomeConvite"
              type="text"
              placeholder="Digite o nome do convite"
              value={formData.nomeConvite}
              onChange={(e) => handleInputChange("nomeConvite", e.target.value)}
              onFocus={() => formData.nomeConvite.length > 0 && setMostrarSugestoes(true)}
              required
              className="bg-input border-border"
            />

            {mostrarSugestoes && sugestoes.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-border rounded-md shadow-lg mt-1">
                {sugestoes.map((sugestao, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-secondary/10 cursor-pointer text-slate-800"
                    onClick={() => selecionarConvite(sugestao)}
                  >
                    {sugestao}
                  </div>
                ))}
              </div>
            )}
          </div>

          {pessoasConvite.length > 0 && (
            <div className="space-y-2">
              <Label className="text-slate-800 font-medium">Pessoas no Convite:</Label>
              <div className="bg-secondary/5 border border-border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-slate-700 font-medium">{pessoasConvite.length} pessoa(s)</span>
                </div>
                <ul className="space-y-1">
                  {pessoasConvite.map((pessoa, index) => (
                    <li key={index} className="text-slate-600">
                      • {pessoa}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-slate-800 font-medium">
              Observações (opcional)
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Alguma observação especial, restrição alimentar ou mensagem para o casal..."
              value={formData.observacoes}
              onChange={(e) => handleInputChange("observacoes", e.target.value)}
              className="bg-input border-border text-slate-800 min-h-[100px]"
            />
          </div>

          {/* Botão de Envio */}
          <Button
            type="submit"
            disabled={!formData.nomeConvite || isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg font-medium"
          >
            {isSubmitting ? "Enviando..." : "Confirmar Presença"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
