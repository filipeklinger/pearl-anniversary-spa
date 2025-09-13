"use client"

import { ChevronDown, Heart, MapPin, Calendar, Navigation, Phone, Car, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import RSVPForm from "@/components/rsvp-form-new"
import PhotoGallery from "@/components/photo-gallery"
import AudioPlayer from "@/components/audio-player"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function HomePage() {
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('invite')
    if (token) {
      setInviteToken(token)
    }
  }, [searchParams])
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-dvh flex items-center justify-center overflow-hidden">
        {/* Background with pearl texture */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-background via-card to-secondary/20"
          style={{
            backgroundImage: `url('/elegant-pearl-necklace-on-silk-fabric--soft-lighti.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-background/60" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="mb-8">
            <Heart className="w-16 h-16 text-primary mx-auto mb-6 animate-pulse" />
            <h1 className="font-serif text-6xl md:text-8xl font-bold text-slate-800 mb-4 text-balance">
              Robson <span className="text-primary">&</span> Roseli
            </h1>
            <div className="w-32 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-2xl md:text-3xl text-slate-700 font-light mb-2">Bodas de Pérola</p>
            <p className="text-lg md:text-xl text-slate-600">30 Anos de Amor e Cumplicidade</p>
          </div>
        </div>

        {/* Admin Access Button */}
        <div className="absolute top-4 right-4">
          <Link href="/admin/login">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 pb-safe left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-primary" />
        </div>
      </section>

      {/* Nossa História Section */}
      <section id="historia" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-800 mb-8">Nossa História</h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-12"></div>

          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none text-slate-700">
                <p className="text-xl leading-relaxed mb-6">
                  Há 30 anos, dois corações se uniram em uma promessa de amor eterno. Robson e Roseli construíram juntos
                  uma história repleta de momentos especiais, desafios superados e sonhos realizados.
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  Como pérolas que se formam com o tempo, paciência e cuidado, nosso amor cresceu e se fortaleceu a cada
                  dia. Três décadas de cumplicidade, risadas, lágrimas e um amor que só cresce.
                </p>
                <p className="text-lg leading-relaxed">
                  Agora, queremos celebrar este marco especial ao lado de quem mais amamos. Venha fazer parte desta
                  celebração única e ajude-nos a brindar aos próximos 30 anos de nossa jornada juntos.
                </p>
              </div>

              <div className="mt-12">
                <h3 className="font-serif text-2xl font-bold text-slate-800 mb-6">Momentos Especiais</h3>
                <PhotoGallery />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Doações Section */}
      <section id="doacoes" className="py-20 px-4 bg-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-800 mb-8">
            Sua Presença é o Maior Presente
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-12"></div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-slate-800 mb-4">Doação de Alimentos</h3>
                  <p className="text-slate-700 leading-relaxed mb-6">
                    Em vez de presentes, pedimos que tragam alimento não perecível. Juntos, vamos espalhar amor e
                    solidariedade para famílias necessitadas.
                  </p>
                  <div className="text-sm text-slate-600">
                    <p>Sugestões: arroz, feijão, óleo, açúcar, macarrão, leite em pó</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-slate-800 mb-4">Contribuição PIX</h3>
                  <p className="text-slate-700 leading-relaxed mb-6">
                    Prefere contribuir via PIX? O valor será destinado à compra de
                    mantimentos para doação.
                  </p>
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <p className="font-mono text-sm text-slate-800">PIX: rgabrich.zap@gmail.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* RSVP Form Section */}
      <section id="rsvp" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-800 mb-8">Confirme sua Presença</h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-12"></div>

          <RSVPForm inviteToken={inviteToken} />
        </div>
      </section>

      {/* Local e Informações Section */}
      <section id="local" className="py-20 px-4 bg-secondary/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-800 mb-8">Local da Celebração</h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Informações do Local */}
            <div className="space-y-8">
              <Card className="bg-card border-border shadow-lg">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-slate-800 mb-2">Sítio Alto da Boa Vista</h3>
                      {/* <p className="text-slate-600">Um espaço elegante para nossa celebração especial</p> */}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-800">Endereço</p>
                          <p className="text-slate-600">
                            Rua Vereador Carlos Canedo PT 40
                            <br />
                            Pedro do Rio, Petrópolis - RJ
                            <br />
                            CEP: 25600-000
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-800">Data e Horário</p>
                          <p className="text-slate-600">
                            Sábado, 08 de Novembro de 2025
                            <br />
                            14:00 hrs
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-800">Contato do Local</p>
                          <p className="text-slate-600">
                            (24) 9999-8888
                            <br />
                            contato@sitiodaboavista.com.br
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Car className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-slate-800">Estacionamento</p>
                          <p className="text-slate-600">
                            Estacionamento gratuito disponível
                            <br />
                            Amplo espaço para veículos
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() =>
                          window.open(
                            "https://maps.google.com/?q=Rua+Vereador+Carlos+Canedo+PT+40+Pedro+do+Rio+Petrópolis+RJ+25600-000",
                            "_blank",
                          )
                        }
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Abrir no Google Maps
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instruções de Como Chegar */}
              <Card className="bg-card border-border shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-serif text-xl font-bold text-slate-800 mb-4">Como Chegar</h4>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div>
                      <p className="font-medium text-slate-800">De Carro:</p>
                      <p>
                        Pela BR-040, siga até Petrópolis, depois tome a direção de Pedro do Rio. O sítio fica na região
                        do Alto da Boa Vista.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Transporte Público:</p>
                      <p>Ônibus até Pedro do Rio, depois táxi ou Uber até o Sítio Alto da Boa Vista.</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Uber/Taxi:</p>
                      <p>Informe o endereço: "Rua Vereador Carlos Canedo PT 40 - Pedro do Rio, Petrópolis - RJ"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mapa */}
            <div className="lg:sticky lg:top-8">
              <Card className="bg-card border-border shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square lg:aspect-[4/3] bg-secondary/20 relative">
                    {/* Placeholder para o mapa - em produção seria um iframe do Google Maps */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                        <h4 className="font-serif text-xl font-bold text-slate-800 mb-2">Localização do Evento</h4>
                        <p className="text-slate-600 mb-4">
                          Rua Vereador Carlos Canedo PT 40
                          <br />
                          Pedro do Rio, Petrópolis - RJ
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              "https://maps.google.com/?q=Rua+Vereador+Carlos+Canedo+PT+40+Pedro+do+Rio+Petrópolis+RJ+25600-000",
                              "_blank",
                            )
                          }
                        >
                          Ver no Maps
                        </Button>
                      </div>
                    </div>

                    {/* Mapa interativo - substitua por iframe real do Google Maps */}
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975!2d-43.1729!3d-22.5097!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9bde4f8b8b8b8b8b%3A0x8b8b8b8b8b8b8b8b!2sRua%20Vereador%20Carlos%20Canedo%2C%20Pedro%20do%20Rio%2C%20Petr%C3%B3polis%20-%20RJ%2C%2025600-000!5e0!3m2!1spt-BR!2sbr!4v1"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-slate-400">
            Desenvolvido por{" "}
            <a
              href="https://filipeklinger.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600 transition-colors"
            >
              Filipe Klinger
            </a>
          </p>
        </div>
      </footer>

      {/* Audio Player */}
      <AudioPlayer />
    </div>
  )
}
