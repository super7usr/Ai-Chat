import { useState } from "react"
import { Sidebar } from "@/components/ui/sidebar"
import { Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="w-64 hidden lg:block">
        <Sidebar className="h-full" />
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
          <div className="w-64 h-full">
            <Sidebar 
              className="h-full" 
              isMobile={true} 
              onClose={() => setIsMobileMenuOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-dark-lighter p-4 flex items-center justify-between border-b border-dark-border">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-400" 
            onClick={toggleMobileMenu}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-primary">
            naji<span className="text-xs text-white ml-1">AI</span>
          </h1>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <User className="h-6 w-6" />
          </Button>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
