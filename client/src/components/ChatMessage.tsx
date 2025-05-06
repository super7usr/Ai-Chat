import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChatMessage as ChatMessageType } from "@shared/schema"
import { Loader2, Image as ImageIcon } from "lucide-react"
import { extractPoseInfo, getPoseStyles } from "@/lib/imageUtils"
import ImagePreviewModal from "./ImagePreviewModal"

interface ChatMessageProps {
  message: ChatMessageType
  isLoading?: boolean
  characterImage?: string
}

export default function ChatMessage({ message, isLoading = false, characterImage }: ChatMessageProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const isUser = message.isUser
  const messageType = message.messageType || "text"
  
  // For image messages, determine if we need to apply pose effects
  let imgSrc = characterImage
  let imgStyle = {}
  
  if (messageType === "image" && !isUser) {
    // Extract pose information from the content if available
    const { url, pose } = extractPoseInfo(message.content)
    
    // Get pose styles based on the prompt
    const { filter, transform } = getPoseStyles(pose)
    
    // Set the image source and style
    imgSrc = url || characterImage
    if (filter || transform) {
      imgStyle = { filter, transform }
    }
  }
  
  return (
    <div
      className={cn(
        "max-w-[80%] px-4 py-3 rounded-[18px] mb-2 relative",
        isUser 
          ? "bg-primary text-white ml-auto rounded-br-[4px]" 
          : "bg-[#333333] text-white mr-auto rounded-bl-[4px]",
        messageType === "image" ? "p-2" : ""
      )}
    >
      {isLoading ? (
        <div className="flex items-center gap-2 min-h-[24px]">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-800 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-gray-800 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-gray-800 rounded-full animate-bounce"></span>
          </div>
          <span className="text-sm text-gray-900 font-medium">Typing...</span>
        </div>
      ) : messageType === "image" ? (
        <div className="overflow-hidden rounded-md">
          {isUser ? (
            // For user, show their image prompt in a nice format
            <div className="p-2">
              <div className="flex items-center mb-2">
                <div className="bg-purple-600/30 p-1 rounded">
                  <ImageIcon className="h-4 w-4 text-purple-300" />
                </div>
                <span className="text-xs ml-2 font-medium text-purple-300">Image Request</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">"{message.content}"</p>
            </div>
          ) : (
            // For AI, show the character image with applied pose effects
            <div className="relative">
              <div 
                className="overflow-hidden rounded-md bg-[#222] shadow-lg cursor-pointer" 
                style={{ padding: '4px' }}
                onClick={() => setIsPreviewOpen(true)}
              >
                <div className="relative">
                  <img 
                    src={imgSrc} 
                    alt="Character image" 
                    className="w-full object-cover rounded-md transition-all duration-300" 
                    style={imgStyle}
                  />
                  {/* Subtle overlay effect to enhance visual appearance */}
                  <div className="absolute inset-0 rounded-md bg-gradient-to-b from-transparent to-purple-900/20 pointer-events-none"></div>
                </div>
                <div className="text-xs mt-2 text-center text-purple-300 pb-1">
                  {message.content.includes('?pose=') ? (
                    <>
                      <span className="font-medium">Pose:</span> {decodeURIComponent(message.content.split('?pose=')[1]).replace(/^(.)/, match => match.toUpperCase())}
                    </>
                  ) : 'Default pose'}
                </div>
              </div>
              <ImagePreviewModal 
                imageUrl={imgSrc || ""} 
                isOpen={isPreviewOpen} 
                onClose={() => setIsPreviewOpen(false)} 
              />
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      )}
    </div>
  )
}
