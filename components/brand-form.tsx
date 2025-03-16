import React, { useState } from "react"
import { Brand } from "@/lib/supabase"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Pencil, Trash2 } from "lucide-react" // Add Trash2 icon
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type BrandFormProps = {
  onSubmit: (brandData: Partial<Brand>) => void
  onEdit: (oldBrand: string, newBrand: string) => void
  onDelete: (brand: string) => void // Add delete handler prop
  existingBrands: string[]
}

export const BrandForm: React.FC<BrandFormProps> = ({ 
  onSubmit, 
  onEdit, 
  onDelete, // Add delete handler
  existingBrands = [] 
}) => {
  const [brandData, setBrandData] = useState<Partial<Brand>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState("")
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
    setBrandData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const currentBrand = brandData.Brand?.trim() || ""

    if (!currentBrand) {
      toast.error("Please enter a brand name")
      return
    }

    const normalizedInput = currentBrand.toLowerCase()
    const normalizedExistingBrands = existingBrands.map(brand => brand.toLowerCase())

    if (normalizedExistingBrands.includes(normalizedInput)) {
      toast.error("Brand already exists. Please enter a unique brand.")
      return
    }

    const formattedBrand = capitalizeWords(currentBrand)
    onSubmit({ ...brandData, Brand: formattedBrand })
    setBrandData({})
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBrand || !editValue) {
      toast.error("Please select a brand and enter new name")
      return
    }

    const normalizedInput = editValue.toLowerCase()
    const normalizedExistingBrands = existingBrands
      .filter(brand => brand !== selectedBrand)
      .map(brand => brand.toLowerCase())

    if (normalizedExistingBrands.includes(normalizedInput)) {
      toast.error("Brand name already exists")
      return
    }

    const formattedBrand = capitalizeWords(editValue)
    onEdit(selectedBrand, formattedBrand)
    setIsEditing(false)
    setSelectedBrand("")
    setEditValue("")
  }

  const handleDelete = () => {
    if (!selectedBrand) {
      toast.error("Please select a brand to delete")
      return
    }

    if (window.confirm(`Are you sure you want to delete brand "${selectedBrand}"?`)) {
      onDelete(selectedBrand)
      setIsEditing(false)
      setSelectedBrand("")
      setEditValue("")
    }
  }

  return (
    <>
      {!isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
              Brand Name
            </label>
            <input
              type="text"
              id="brand"
              name="Brand"
              value={brandData.Brand || ""}
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
              Add Brand
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
                Select Brand to Edit
              </label>
              <Select
                value={selectedBrand}
                onValueChange={setSelectedBrand}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a brand" />
                </SelectTrigger>
                <SelectContent>
                  {existingBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedBrand && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Brand Name
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
              Update Brand
            </button>
            {selectedBrand && (
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                setSelectedBrand("")
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

