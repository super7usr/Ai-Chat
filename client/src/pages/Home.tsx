import { useState } from "react"
import Layout from "@/components/Layout"
import CharacterCard from "@/components/CharacterCard"
import { Character } from "@shared/schema"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocation } from "wouter"
import { generateSessionId } from "@/lib/utils"

export default function Home() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [, setLocation] = useLocation()

  const { data: characters, isLoading } = useQuery<Character[]>({
    queryKey: ['/api/characters'], // Removed selectedCategory
    select: (data) => data as Character[]
  })

  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character)
    setIsModalOpen(true)
  }

  const handleStartChat = () => {
    if (selectedCharacter) {
      const sessionId = generateSessionId()
      setLocation(`/chat/${selectedCharacter.id}/${sessionId}`)
    }
    setIsModalOpen(false)
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Choose your partner</h2>
          <div className="flex space-x-2">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setLocation('/create')}
            >
              Create Character
            </Button>
            <Button className="bg-primary hover:bg-purple-600 text-white">
              Sign in
            </Button>
          </div>
        </div>

        <div className="pb-6"> {/*Removed category buttons div */}
          <h2 className="text-2xl font-bold mb-4">All Characters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            // Loading skeletons
            Array(8).fill(0).map((_, index) => (
              <div key={index} className="bg-dark-card rounded-lg overflow-hidden">
                <Skeleton className="w-full h-64" />
                <div className="p-4">
                  <Skeleton className="h-5 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                </div>
              </div>
            ))
          ) : (
            characters && characters.map((character: Character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onClick={handleCharacterClick}
              />
            ))
          )}
        </div>
      </div>

      {/* Character details modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-dark-lighter text-white border-dark-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedCharacter?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedCharacter && (
            <>
              <div className="mb-4">
                <img 
                  src={selectedCharacter.imageUrl} 
                  alt={selectedCharacter.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>

              <DialogDescription className="text-gray-300">
                <h4 className="font-bold text-white mb-2">About</h4>
                <p>{selectedCharacter.description}</p>
              </DialogDescription>

              <DialogFooter className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-primary hover:bg-purple-600" onClick={handleStartChat}>
                  Start Chat
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  )
}