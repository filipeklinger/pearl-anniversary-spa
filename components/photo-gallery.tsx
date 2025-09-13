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
	{ id: 1, src: "/galery/Eu_Ro_1.webp", alt: "Photo 1" },
	{ id: 2, src: "/galery/Eu_Ro_2.webp", alt: "Photo 2" },
	{ id: 3, src: "/galery/Eu_Ro_3.webp", alt: "Photo 3" },
	{ id: 4, src: "/galery/Eu_Ro_4.webp", alt: "Photo 4" },
	{ id: 5, src: "/galery/Eu_Ro_5.webp", alt: "Photo 5" },
	{ id: 6, src: "/galery/Eu_Ro_6.webp", alt: "Photo 6" },
	{ id: 7, src: "/galery/Eu_Ro_7.webp", alt: "Photo 7" },
	{ id: 8, src: "/galery/Eu_Ro_8.webp", alt: "Photo 8" },
	{ id: 9, src: "/galery/Eu_Ro_9.webp", alt: "Photo 9" },
	{ id: 10, src: "/galery/Eu_Ro_10.webp", alt: "Photo 10" },
	{ id: 11, src: "/galery/Eu_Ro_11.webp", alt: "Photo 11" },
	{ id: 12, src: "/galery/Eu_Ro_12.webp", alt: "Photo 12" },
	{ id: 13, src: "/galery/Eu_Ro_13.webp", alt: "Photo 13" },
	{ id: 14, src: "/galery/Eu_Ro_14.webp", alt: "Photo 14" },
	{ id: 15, src: "/galery/Eu_Ro_15.webp", alt: "Photo 15" },
	{ id: 16, src: "/galery/Eu_Ro_16.webp", alt: "Photo 16" },
	{ id: 17, src: "/galery/Eu_Ro_17.webp", alt: "Photo 17" },
	{ id: 18, src: "/galery/Eu_Ro_18.webp", alt: "Photo 18" },
	{ id: 19, src: "/galery/Eu_Ro_19.webp", alt: "Photo 19" },
	{ id: 20, src: "/galery/Eu_Ro_20.webp", alt: "Photo 20" },
	{ id: 21, src: "/galery/Eu_Ro_21.webp", alt: "Photo 21" },
	{ id: 22, src: "/galery/Eu_Ro_22.webp", alt: "Photo 22" },
	{ id: 23, src: "/galery/Eu_Ro_23.webp", alt: "Photo 23" },
	{ id: 24, src: "/galery/Eu_Ro_24.webp", alt: "Photo 24" },
	{ id: 25, src: "/galery/Eu_Ro_25.webp", alt: "Photo 25" },
	{ id: 26, src: "/galery/Eu_Ro_26.webp", alt: "Photo 26" },
	{ id: 27, src: "/galery/Eu_Ro_27.webp", alt: "Photo 27" },
	{ id: 28, src: "/galery/Eu_Ro_28.webp", alt: "Photo 28" },
	{ id: 29, src: "/galery/Eu_Ro_29.webp", alt: "Photo 29" },
	{ id: 30, src: "/galery/Eu_Ro_30.webp", alt: "Photo 30" },
	{ id: 31, src: "/galery/Eu_Ro_31.webp", alt: "Photo 31" },
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
								className="max-w-full max-h-[85vh] object-contain mx-auto"
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
