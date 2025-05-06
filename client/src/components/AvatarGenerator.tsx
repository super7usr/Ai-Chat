import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { generateImage, ImageGenerationRequest } from '@/lib/api'
import { Loader2 } from 'lucide-react'

interface AvatarGeneratorProps {
  onImageGenerated: (imageUrl: string) => void
}

export default function AvatarGenerator({ onImageGenerated }: AvatarGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<'vivid' | 'natural'>('vivid')
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)

  const generateMutation = useMutation({
    mutationFn: (request: ImageGenerationRequest) => generateImage(request),
    onSuccess: (data) => {
      setGeneratedImageUrl(data.url)
      onImageGenerated(data.url)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    generateMutation.mutate({
      prompt,
      style,
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-dark-card">
      <CardHeader>
        <CardTitle className="text-center">Generate Character Avatar</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="prompt"
              placeholder="Describe your character in detail (e.g., attractive woman in her 20s with long blonde wavy hair, fair skin, bright eyes, wearing elegant clothing)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] bg-dark-input text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="style" className="text-sm font-medium">
              Style
            </label>
            <Select
              value={style}
              onValueChange={(value) => setStyle(value as 'vivid' | 'natural')}
            >
              <SelectTrigger id="style" className="bg-dark-input text-white">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent className="bg-dark-dropdown">
                <SelectItem value="vivid">Vivid</SelectItem>
                <SelectItem value="natural">Natural</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-purple-600"
              disabled={generateMutation.isPending || !prompt.trim()}
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Avatar'
              )}
            </Button>
          </div>
        </form>

        {generatedImageUrl && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Generated Avatar</h3>
            <div 
              className="border border-dark-border rounded-lg overflow-hidden cursor-pointer"
              onClick={() => {
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70';
                modal.onclick = () => document.body.removeChild(modal);
                
                const content = document.createElement('div');
                content.className = 'relative max-w-4xl w-[90%] max-h-[90vh] bg-dark-card rounded-lg overflow-hidden';
                content.onclick = (e) => e.stopPropagation();
                
                const img = document.createElement('img');
                img.src = generatedImageUrl || '';
                img.className = 'w-full h-auto object-contain';
                
                const controls = document.createElement('div');
                controls.className = 'absolute top-2 right-2 z-10 flex gap-2';
                
                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'p-2 bg-dark-card/80 hover:bg-dark-card rounded-full';
                downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
                downloadBtn.onclick = () => {
                  const link = document.createElement('a');
                  link.href = generatedImageUrl || '';
                  link.download = `avatar-${Date.now()}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                };
                
                const closeBtn = document.createElement('button');
                closeBtn.className = 'p-2 bg-dark-card/80 hover:bg-dark-card rounded-full';
                closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
                closeBtn.onclick = () => document.body.removeChild(modal);
                
                controls.appendChild(downloadBtn);
                controls.appendChild(closeBtn);
                content.appendChild(img);
                content.appendChild(controls);
                modal.appendChild(content);
                document.body.appendChild(modal);
              }}
            >
              <img 
                src={generatedImageUrl} 
                alt="Generated avatar" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {generatedImageUrl && (
          <Button 
            variant="outline" 
            onClick={() => onImageGenerated(generatedImageUrl)}
            className="mt-4"
          >
            Use This Avatar
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}