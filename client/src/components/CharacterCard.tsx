import { Character } from "@shared/schema"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { truncateText } from "@/lib/utils"

interface CharacterCardProps {
  character: Character
  onClick: (character: Character) => void
}

export default function CharacterCard({ character, onClick }: CharacterCardProps) {
  return (
    <Card 
      className="bg-dark-card rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
      onClick={() => onClick(character)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={character.imageUrl} 
          alt={character.name}
          className="w-full h-64 object-cover transition duration-300 hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 px-2 py-1 rounded text-xs">
          {character.age}
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
          <Button 
            className="bg-primary hover:bg-purple-600 text-white"
            onClick={(e) => {
              e.stopPropagation()
              onClick(character)
            }}
          >
            Chat Now
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold">{character.name}</h3>
        <p className="text-sm text-gray-300 line-clamp-2">
          {truncateText(character.description, 100)}
        </p>
      </div>
    </Card>
  )
}
