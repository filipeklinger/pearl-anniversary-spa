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
    src: "/romantic-couple-wedding-photo-vintage-style.jpg",
    alt: "Robson e Roseli no dia do casamento",
    caption: "Nosso grande dia - 08 de novembro de 1995",
  },
  {
    id: 2,
    src: "/happy-couple-celebrating-anniversary-with-family.jpg",
    alt: "Celebração de aniversário em família",
    caption: "Comemorando 25 anos juntos",
  },
  {
    id: 3,
    src: "/couple-traveling-together-vacation-photo.jpg",
    alt: "Robson e Roseli viajando",
    caption: "Explorando o mundo juntos",
  },
  {
    id: 4,
    src: "/couple-at-home-cozy-moment-together.jpg",
    alt: "Momento em casa",
    caption: "Momentos especiais em casa",
  },
  {
    id: 5,
    src: "/couple-with-children-family-portrait.jpg",
    alt: "Foto em família",
    caption: "Nossa família crescendo",
  },
  {
    id: 6,
    src: "/couple-dancing-together-romantic-moment.jpg",
    alt: "Robson e Roseli dançando",
    caption: "Sempre dançando pela vida",
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
              className="absolute -top-12 right-0 text-white hover:text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-white hover:bg-white/20"
              onClick={prevPhoto}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white hover:bg-white/20"
              onClick={nextPhoto}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>

            {/* Image */}
            <div className="text-center">
              <img
                src={selectedPhoto.src || "/placeholder.svg"}
                alt={selectedPhoto.alt}
                className="max-w-full max-h-[70vh] object-contain mx-auto"
              />
              {selectedPhoto.caption && <p className="text-white mt-4 text-lg font-light">{selectedPhoto.caption}</p>}
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
