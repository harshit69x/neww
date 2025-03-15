import React, { useState } from "react"
import { ProductType } from "@/lib/supabase"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TypeFormProps = {
  onSubmit: (typeData: Partial<ProductType>) => void
  onEdit: (oldType: string, newType: string) => void
  existingTypes: string[]
}

export const TypeForm: React.FC<TypeFormProps> = ({ onSubmit, onEdit, existingTypes = [] }) => {
  const [typeData, setTypeData] = useState<Partial<ProductType>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [selectedType, setSelectedType] = useState("")
  const [editValue, setEditValue] = useState("")

  // Function to capitalize first letter of each word
  const capitalizeWords = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTypeData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const currentType = typeData.Type?.trim() || ""

    if (!currentType) {
      toast.error("Please enter a type name")
      return
    }

    const normalizedInput = currentType.toLowerCase()
    const normalizedExistingTypes = existingTypes.map(type => type.toLowerCase())

    if (normalizedExistingTypes.includes(normalizedInput)) {
      toast.error("Type already exists. Please enter a unique type.")
      return
    }

    const formattedType = capitalizeWords(currentType)
    onSubmit({ ...typeData, Type: formattedType })
    setTypeData({})
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !editValue) {
      toast.error("Please select a type and enter new name")
      return
    }

    const normalizedInput = editValue.toLowerCase()
    const normalizedExistingTypes = existingTypes
      .filter(type => type !== selectedType)
      .map(type => type.toLowerCase())

    if (normalizedExistingTypes.includes(normalizedInput)) {
      toast.error("Type name already exists")
      return
    }

    const formattedType = capitalizeWords(editValue)
    onEdit(selectedType, formattedType)
    setIsEditing(false)
    setSelectedType("")
    setEditValue("")
  }

  return (
    <>
      {!isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type Name
            </label>
            <input
              type="text"
              id="type"
              name="Type"
              value={typeData.Type || ""}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-2 border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Type
            </button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" /> Edit Existing
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Type to Edit
              </label>
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a type" />
                </SelectTrigger>
                <SelectContent>
                  {existingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedType && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Type Name
                </label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-2 border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Update Type
            </button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                setSelectedType("")
                setEditValue("")
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
      <ToastContainer />
    </>
  )
}