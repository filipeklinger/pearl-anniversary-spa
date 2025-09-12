import React from 'react'
import { X } from 'lucide-react'
import { Button } from './button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Modal({ isOpen, onClose, children, title, size = 'lg' }: ModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-[95vw] sm:max-w-md',
    md: 'max-w-[95vw] sm:max-w-lg', 
    lg: 'max-w-[95vw] sm:max-w-2xl lg:max-w-4xl',
    xl: 'max-w-[95vw] sm:max-w-4xl lg:max-w-6xl',
    full: 'max-w-[95vw] sm:max-w-7xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh] overflow-hidden mt-2 sm:mt-0 mx-auto`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  )
}