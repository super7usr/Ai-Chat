import * as React from "react"
import { cn } from "@/lib/utils"
import { useLocation } from "wouter"
import { Home, PlusCircle, MessageSquare, Crown, Settings, Compass } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  isMobile?: boolean
  onClose?: () => void
}

export function Sidebar({ className, isMobile, onClose, ...props }: SidebarProps) {
  const [location, setLocation] = useLocation()

  const sidebarItems = [
    {
      name: "Discover",
      href: "/",
      icon: Compass,
      active: location === "/" || location === ""
    },
    {
      name: "Create",
      href: "/create",
      icon: PlusCircle,
      active: location.startsWith("/create")
    },
    {
      name: "Chats",
      href: "/chats",
      icon: MessageSquare,
      active: location.startsWith("/chats")
    },
    {
      name: "Membership",
      href: "/membership",
      icon: Crown,
      active: location.startsWith("/membership")
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      active: location.startsWith("/settings")
    }
  ]

  const handleItemClick = () => {
    if (isMobile && onClose) {
      onClose()
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-dark-lighter border-r border-dark-border",
        className
      )}
      {...props}
    >
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">
          naji<span className="text-xs text-white ml-1">AI</span>
        </h1>
        {isMobile && onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1 rounded-full hover:bg-dark-card"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
            </svg>
          </button>
        )}
      </div>
      
      <nav className="mt-6 flex-1">
        <ul>
          {sidebarItems.map((item) => (
            <li key={item.name}>
              <div
                onClick={() => {
                  handleItemClick();
                  setLocation(item.href);
                }}
                className={cn(
                  "px-6 py-3 flex items-center text-gray-300 hover:bg-dark-card hover:text-white transition cursor-pointer",
                  item.active && "bg-dark-card text-white"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.name}</span>
              </div>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 text-xs text-gray-500">
        <span className="cursor-pointer hover:text-gray-400 transition">Terms of Service</span>
        <span className="mx-1">·</span>
        <span className="cursor-pointer hover:text-gray-400 transition">Privacy Policy</span>
      </div>
    </div>
  )
}
