"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Lock, Eye, EyeOff } from "lucide-react"

export default function AdminLogin() {
  const { data: session, status } = useSession()
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/admin/dashboard")
    }
  }, [session, status, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
        callbackUrl: '/admin/dashboard'
      })

      console.log('Login result:', result) // Debug

      if (result?.error && result.error.length > 0) {
        setError("Email ou senha incorretos")
        setIsLoading(false)
        return;
      }
      // Aguardar um pouco para a sessão ser estabelecida
      setTimeout(() => {
        console.log('Redirecionando para /admin/dashboard') // Debug;
        
        // Tentar redirecionamento múltiplo para garantir
        try {
          router.push("/admin/dashboard");
          window.location.href = "/admin/dashboard";
        } catch {
          
        }
      }, 500);
    } catch (error) {
      console.error('Login error:', error)
      setError("Erro ao fazer login. Tente novamente.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold text-slate-800 mb-2">Área Administrativa</h1>
          <p className="text-slate-600">Bodas de Pérola - Robson & Roseli</p>
        </div>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl font-bold text-slate-800">Acesso Restrito</CardTitle>
            <p className="text-slate-600 text-sm">Entre com suas credenciais para acessar o painel</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-800">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={credentials.email}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-800">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={credentials.password}
                    onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                    required
                    className="bg-input border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-slate-800"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-destructive text-sm text-center p-2 bg-destructive/10 rounded">{error}</div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white border-0"
              >
                <Lock className="w-4 h-4 mr-2" />
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="text-slate-800 hover:text-slate-900 hover:bg-slate-100"
              >
                Voltar ao site
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
