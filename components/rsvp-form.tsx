"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Users, Gift, DollarSign, Check } from "lucide-react"

export default function RSVPForm() {
  const [formData, setFormData] = useState({
    nome: "",
    tipoDoacao: "",
    numeroConvidados: "",
    observacoes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

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
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-slate-800 font-medium">
              Nome Completo *
            </Label>
            <Input
              id="nome"
              type="text"
              placeholder="Digite seu nome completo"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              required
              className="bg-input border-border"
            />
          </div>

          {/* Tipo de Doação */}
          <div className="space-y-4">
            <Label className="text-slate-800 font-medium">Como você gostaria de contribuir? *</Label>
            <div className="space-y-3">
              <div
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.tipoDoacao === "alimento"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:bg-secondary/5"
                }`}
                onClick={() => handleInputChange("tipoDoacao", "alimento")}
              >
                <div className="flex items-center space-x-3">
                  <Gift className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-slate-800 font-medium">Doação de Alimentos</span>
                    <p className="text-sm text-slate-600">Trarei 1kg de alimento não perecível</p>
                  </div>
                </div>
                {formData.tipoDoacao === "alimento" && <Check className="w-5 h-5 text-primary" />}
              </div>

              <div
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.tipoDoacao === "pix"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:bg-secondary/5"
                }`}
                onClick={() => handleInputChange("tipoDoacao", "pix")}
              >
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-slate-800 font-medium">Contribuição PIX</span>
                    <p className="text-sm text-slate-600">Farei uma transferência via PIX</p>
                  </div>
                </div>
                {formData.tipoDoacao === "pix" && <Check className="w-5 h-5 text-primary" />}
              </div>
            </div>
          </div>

          {/* Número de Convidados */}
          <div className="space-y-2">
            <Label htmlFor="convidados" className="text-slate-800 font-medium">
              Quantas pessoas você trará? *
            </Label>
            <Select
              value={formData.numeroConvidados}
              onValueChange={(value) => handleInputChange("numeroConvidados", value)}
            >
              <SelectTrigger className="bg-input border-border">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-primary" />
                  <SelectValue placeholder="Selecione o número de pessoas" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Apenas eu (1 pessoa)</SelectItem>
                <SelectItem value="2">Eu + 1 acompanhante (2 pessoas)</SelectItem>
                <SelectItem value="3">Eu + 2 acompanhantes (3 pessoas)</SelectItem>
                <SelectItem value="4">Eu + 3 acompanhantes (4 pessoas)</SelectItem>
                <SelectItem value="5">Eu + 4 acompanhantes (5 pessoas)</SelectItem>
                <SelectItem value="6+">Mais de 5 pessoas</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            disabled={!formData.nome || !formData.tipoDoacao || !formData.numeroConvidados || isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg font-medium"
          >
            {isSubmitting ? "Enviando..." : "Confirmar Presença"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
