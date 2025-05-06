import { useState, useEffect } from "react"
import { AIModel } from "@shared/schema"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"

interface ModelSelectorProps {
  value: string
  onChange: (value: string) => void
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { data: models, isLoading } = useQuery({
    queryKey: ['/api/models'],
  })

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className="bg-dark-card border-dark-border text-sm w-[180px]">
          <SelectValue placeholder="Loading models..." />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-dark-card border-dark-border text-sm w-[180px]">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent className="bg-dark-card border-dark-border text-white">
        {models?.map((model: AIModel) => (
          <SelectItem key={model.id} value={model.value} className="text-white hover:bg-dark-border">
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
