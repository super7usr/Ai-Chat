import { useState } from 'react'
import { useLocation, Link } from 'wouter'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AvatarGenerator from '@/components/AvatarGenerator'
import Layout from '@/components/Layout'
import { apiRequest } from '@/lib/queryClient'
import { InsertCharacter } from '@shared/schema'
import { Loader2 } from 'lucide-react'

export default function CreateCharacter() {
  const [_, setLocation] = useLocation()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<'details' | 'avatar'>('details')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [formData, setFormData] = useState<Omit<InsertCharacter, 'imageUrl'>>({ 
    name: '',
    age: 20,
    description: '',
    welcomeMessage: '',
    category: 'anime'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 18 : value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const createCharacterMutation = useMutation({
    mutationFn: async (character: InsertCharacter) => {
      const response = await apiRequest('POST', '/api/characters', character)
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] })
      setLocation('/')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 'details') {
      setStep('avatar')
    } else {
      // Submit the complete form
      createCharacterMutation.mutate({
        ...formData,
        imageUrl: avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' // Default image if none generated
      })
    }
  }

  const handleImageGenerated = (imageUrl: string) => {
    setAvatarUrl(imageUrl)
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Create Your AI Character</h1>
        
        {step === 'details' ? (
          <Card className="max-w-2xl mx-auto bg-dark-card">
            <CardHeader>
              <CardTitle className="text-center">Character Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Character name"
                    className="bg-dark-input text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="age" className="text-sm font-medium">Age</label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="18"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="bg-dark-input text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger id="category" className="bg-dark-input text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-dropdown">
                      <SelectItem value="anime">Anime</SelectItem>
                      <SelectItem value="fantasy">Fantasy</SelectItem>
                      <SelectItem value="realism">Realism</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your character's personality, background, interests, etc."
                    className="min-h-[100px] bg-dark-input text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="welcomeMessage" className="text-sm font-medium">Welcome Message</label>
                  <Textarea
                    id="welcomeMessage"
                    name="welcomeMessage"
                    value={formData.welcomeMessage}
                    onChange={handleInputChange}
                    placeholder="The first message your character will say to the user"
                    className="min-h-[100px] bg-dark-input text-white"
                    required
                  />
                </div>
                
                <div className="pt-4 flex space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLocation('/')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary hover:bg-purple-600"
                  >
                    Next: Generate Avatar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <AvatarGenerator onImageGenerated={handleImageGenerated} />
            
            <div className="flex justify-center space-x-4 mt-8">
              <Button 
                variant="outline" 
                onClick={() => setStep('details')}
              >
                Back to Details
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-primary hover:bg-purple-600"
                disabled={createCharacterMutation.isPending}
              >
                {createCharacterMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Character'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
