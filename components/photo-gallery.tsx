"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface Photo {
  id: number
  src: string
  alt: string
  caption?: string
}

const photos: Photo[] = [
  {
    id: 1,
    src: "/galery/casamento_aliancas_1995.webp",
    alt: "Alianças de casamento de Robson e Roseli",
    caption: "Nossas alianças",
  },
  {
    id: 2,
    src: "/galery/casamento_em_frente_igreja_1995.webp",
    alt: "Robson e Roseli em frente à igreja no dia do casamento",
    caption: "Nosso grande dia em frente à igreja - 1995",
  },
  {
    id: 3,
    src: "/galery/familia_com_recen_nascido_2004.webp",
    alt: "Família com recém-nascido",
    caption: "Nossa família crescendo",
  },
  {
    id: 4,
    src: "/galery/praia_2005.webp",
    alt: "Robson e Roseli na praia",
    caption: "Momentos especiais na praia",
  },
  {
    id: 5,
    src: "/galery/no_quintal_de_casa_2008.webp",
    alt: "No quintal de casa",
    caption: "Relaxando no quintal de casa",
  },
  {
    id: 6,
    src: "/galery/praia_2020.webp",
    alt: "Robson e Roseli na praia",
    caption: "Aproveitando a praia juntos",
  },
  {
    id: 7,
    src: "/galery/na_areia_da_praia_2021.webp",
    alt: "Na areia da praia",
    caption: "Curtindo na areia da praia",
  },
  {
    id: 8,
    src: "/galery/na_praia_do_amor_2021.webp",
    alt: "Na praia do amor",
    caption: "Na romântica praia do amor",
  },
  {
    id: 9,
    src: "/galery/dia_a_dia_2022.webp",
    alt: "Momento do dia a dia",
    caption: "Nosso dia a dia especial",
  },
  {
    id: 10,
    src: "/galery/em_familia_2022.webp",
    alt: "Foto em família",
    caption: "Momentos preciosos em família",
  },
  {
    id: 11,
    src: "/galery/natal_2023.webp",
    alt: "Celebração de Natal",
    caption: "Celebrando o Natal juntos",
  },
  {
    id: 12,
    src: "/galery/passeio_2023.webp",
    alt: "Passeio de casal",
    caption: "Explorando novos lugares juntos",
  },
  {
    id: 13,
    src: "/galery/surpresa_com_flores_2023.webp",
    alt: "Surpresa com flores",
    caption: "Surpresa romântica com flores",
  },
  {
    id: 14,
    src: "/galery/jantar_2024.webp",
    alt: "Jantar romântico",
    caption: "Jantar especial a dois",
  },
  {
    id: 15,
    src: "/galery/passeio_2024.webp",
    alt: "Passeio de casal",
    caption: "Mais aventuras juntos",
  },
  {
    id: 16,
    src: "/galery/em_casa-2025.webp",
    alt: "Momento em casa",
    caption: "Aconchego de casa",
  },
  {
    id: 17,
    src: "/galery/passeio_2025.webp",
    alt: "Passeio de casal",
    caption: "Continuando nossa jornada juntos",
  },
]

export default function PhotoGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo)
    setCurrentIndex(photos.findIndex((p) => p.id === photo.id))
  }

  const closeLightbox = () => {
    setSelectedPhoto(null)
  }

  const nextPhoto = () => {
    const nextIndex = (currentIndex + 1) % photos.length
    setCurrentIndex(nextIndex)
    setSelectedPhoto(photos[nextIndex])
  }

  const prevPhoto = () => {
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length
    setCurrentIndex(prevIndex)
    setSelectedPhoto(photos[prevIndex])
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {photos.map((photo) => (
          <Card
            key={photo.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
            onClick={() => openLightbox(photo)}
          >
            <CardContent className="p-0">
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={photo.src || "/placeholder.svg"}
                  alt={photo.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white border-1 border-amber-50/20 hover:text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white border-1 border-amber-100 hover:text-white hover:bg-white/20"
              onClick={prevPhoto}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white border-1 border-amber-100 hover:text-white hover:bg-white/20"
              onClick={nextPhoto}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>

            {/* Image */}
            <div className="text-center">
              <img
                src={selectedPhoto.src || "/placeholder.svg"}
                alt={selectedPhoto.alt}
                className="max-w-full max-h-[80vh] object-contain mx-auto"
              />
              {/* {selectedPhoto.caption && <p className="text-white mt-4 text-lg font-light">{selectedPhoto.caption}</p>} */}
              <p className="text-white/70 text-sm mt-2">
                {currentIndex + 1} de {photos.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
