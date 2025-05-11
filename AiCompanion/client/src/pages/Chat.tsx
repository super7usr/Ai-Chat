import { useState, useEffect, useRef } from "react"
import { useParams, useLocation } from "wouter"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Character, ChatMessage as ChatMessageType, InsertMessage } from "@shared/schema"
import { ChatCompletionMessage, sendChatMessage, saveMessage } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MessageSquare, Image as ImageIcon } from "lucide-react"
import ChatMessage from "@/components/ChatMessage"
import ModelSelector from "@/components/ModelSelector"
import { cn } from "@/lib/utils"

export default function Chat() {
  const { characterId, sessionId } = useParams()
  const [, setLocation] = useLocation()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>("provider-4/gpt-4.1")
  const [messageType, setMessageType] = useState<"text" | "image">("text")
  const queryClient = useQueryClient()

  // Character query
  const { data: character, isLoading: isLoadingCharacter } = useQuery<Character>({
    queryKey: [`/api/characters/${characterId}`],
    enabled: !!characterId,
  })

  // Messages query
  const { data: messages, isLoading: isLoadingMessages } = useQuery<ChatMessageType[]>({
    queryKey: [`/api/messages/${characterId}/${sessionId}`],
    enabled: !!characterId && !!sessionId
  })

  // Get character welcome message if no messages exist
  useEffect(() => {
    if (character && messages?.length === 0) {
      const initialMessage: InsertMessage = {
        characterId: parseInt(characterId!),
        sessionId: sessionId!,
        content: character.welcomeMessage,
        isUser: false,
        messageType: "text"
      }
      
      saveMessageMutation.mutate(initialMessage)
    }
  }, [character, messages, characterId, sessionId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Save message mutation
  const saveMessageMutation = useMutation({
    mutationFn: (message: InsertMessage) => saveMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${characterId}/${sessionId}`] })
    }
  })

  // Send message function
  const handleSendMessage = async () => {
    if (!message.trim() || !character) return

    // Save user message
    const userMessage: InsertMessage = {
      characterId: parseInt(characterId!),
      sessionId: sessionId!,
      content: message,
      isUser: true,
      messageType: messageType
    }
    
    saveMessageMutation.mutate(userMessage)
    setMessage("")
    setIsTyping(true)
    scrollToBottom()

    try {
      // If this is an image message, generate a posed version of the character's image
      if (messageType === "image") {
        try {
          setIsTyping(true);
          // First save the character's text response
          const textResponse: InsertMessage = {
            characterId: parseInt(characterId!),
            sessionId: sessionId!,
            content: `I'll create an image of ${message}`,
            isUser: false,
            messageType: "text"
          }
          saveMessageMutation.mutate(textResponse);
          
          // Then generate and save the image
          const response = await fetch('/api/images/generations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `Photorealistic portrait photo of ${character.description}, ${message}`,
              style: 'natural'
            })
          });
          
          const data = await response.json();
          
          if (!data.url) {
            throw new Error('No image URL returned');
          }

          // Create and save the AI response with the generated image
          const aiMessage: InsertMessage = {
            characterId: parseInt(characterId!),
            sessionId: sessionId!,
            content: data.url,
            isUser: false,
            messageType: "image"
          }
          
          saveMessageMutation.mutate(aiMessage)
        } catch (error) {
          console.error('Error generating image:', error);
          // Send error message when image generation fails
          const errorMessage: InsertMessage = {
            characterId: parseInt(characterId!),
            sessionId: sessionId!,
            content: "Sorry, I couldn't generate that image right now. Please try again later.",
            isUser: false,
            messageType: "text"
          }
          saveMessageMutation.mutate(errorMessage);
        } finally {
          setIsTyping(false);
        }
        return;
      }
      
      // Create placeholder for AI response
      const aiPlaceholder: ChatMessageType = {
        id: -1,
        characterId: parseInt(characterId!),
        sessionId: sessionId!,
        content: "",
        isUser: false,
        createdAt: new Date(),
        messageType: "text"
      }

      // Prepare messages for the API
      const systemContent = `You are ${character.name}, a chat companion with the following personality: ${character.description}. Respond in character, keeping replies concise (1-3 sentences max), conversational, and engaging. Never break character or mention that you are an AI.`
      
      const apiMessages: ChatCompletionMessage[] = [
        { role: "system", content: systemContent },
        { role: "user", content: message }
      ]

      // Send to API
      const response = await sendChatMessage({
        model: selectedModel,
        messages: apiMessages,
        character: {
          id: character.id,
          name: character.name,
          description: character.description
        }
      })

      const aiResponse = response.choices[0].message.content

      // Save AI response
      const aiMessage: InsertMessage = {
        characterId: parseInt(characterId!),
        sessionId: sessionId!,
        content: aiResponse,
        isUser: false,
        messageType: "text"
      }
      
      saveMessageMutation.mutate(aiMessage)
    } catch (error) {
      console.error("Error sending message:", error)
      
      // Save error message if API fails
      const errorMessage: InsertMessage = {
        characterId: parseInt(characterId!),
        sessionId: sessionId!,
        content: "Sorry, I couldn't process that message. Please try again in a moment.",
        isUser: false,
        messageType: "text"
      }
      
      saveMessageMutation.mutate(errorMessage)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const goBack = () => {
    setLocation("/")
  }

  if (isLoadingCharacter) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Chat header */}
      <div className="bg-dark-lighter p-4 flex items-center justify-between border-b border-dark-border">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={goBack} className="mr-3 text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
              <img 
                src={character?.imageUrl} 
                alt={character?.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h3 className="font-bold">{character?.name}</h3>
              <div className="flex items-center text-xs text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <ModelSelector 
            value={selectedModel} 
            onChange={setSelectedModel} 
          />
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isLoadingMessages ? (
          <div className="flex justify-center p-4">Loading messages...</div>
        ) : (
          <>
            {messages?.map((msg: ChatMessageType) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                characterImage={character?.imageUrl}
              />
            ))}
            
            {isTyping && (
              <div className="mb-4">
                <ChatMessage 
                  message={{
                    id: -1,
                    characterId: parseInt(characterId!),
                    sessionId: sessionId!,
                    content: "",
                    isUser: false,
                    messageType: "text",
                    createdAt: new Date()
                  }} 
                  isLoading={true}
                  characterImage={character?.imageUrl}
                />
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-dark-border bg-dark-lighter">
        {/* Message type toggle */}
        <div className="flex justify-center mb-2">
          <div className="flex bg-dark-card p-1 rounded-lg mb-2">
            <button
              className={cn(
                "px-4 py-1 rounded-md flex items-center",
                messageType === "text" 
                  ? "bg-primary text-white" 
                  : "text-gray-400 hover:text-white"
              )}
              onClick={() => setMessageType("text")}
              disabled={isTyping}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Text
            </button>
            <button
              className={cn(
                "px-4 py-1 rounded-md flex items-center",
                messageType === "image" 
                  ? "bg-primary text-white" 
                  : "text-gray-400 hover:text-white"
              )}
              onClick={() => setMessageType("image")}
              disabled={isTyping}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Image
            </button>
          </div>
        </div>

        {messageType === "text" ? (
          <div className="flex">
            <Input
              className="flex-1 bg-dark-card border-dark-border rounded-l-lg px-4 py-2 focus-visible:ring-primary focus-visible:ring-offset-0"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isTyping}
              style={{ color: '#3b82f6', fontWeight: '600' }}
            />
            <Button
              className="bg-primary hover:bg-purple-600 text-white rounded-l-none"
              onClick={handleSendMessage}
              disabled={isTyping || !message.trim()}
            >
              Send
            </Button>
          </div>
        ) : (
          <div className="flex">
            <Input
              className="flex-1 bg-dark-card border-dark-border rounded-l-lg px-4 py-2 focus-visible:ring-primary focus-visible:ring-offset-0"
              placeholder="Describe the image you want..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isTyping}
              style={{ color: '#3b82f6', fontWeight: '600' }}
            />
            <Button
              className="bg-primary hover:bg-purple-600 text-white rounded-l-none"
              onClick={handleSendMessage}
              disabled={isTyping || !message.trim()}
            >
              Generate
            </Button>
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2 text-center">
          {/* Message type hints */}
          {messageType === "text" ? (
            "Press Enter to send message"
          ) : (
            "Describe the image you want to generate"
          )}
        </div>
      </div>
    </div>
  )
}
