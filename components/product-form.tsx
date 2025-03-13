"use client"

import type React from "react"

import { useState } from "react"
import type { Brand, ProductType } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductFormProps {
  brands: Brand[]
  productTypes: ProductType[]
  onSubmit: (productData: any) => void
}

export function ProductForm({ brands, productTypes, onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState({
    Product: "",
    Type: "",
    Tid: "",
    ProductImg: "",
    Mrp: "",
    Sp: "",
    Brand: "",
    Bid: "",
    Quantity: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "Brand") {
      const selectedBrand = brands.find((b) => b.Brand === value)
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        Bid: selectedBrand?.Bid.toString() || "",
      }))
    } else if (name === "Type") {
      const selectedType = productTypes.find((t) => t.Type === value)
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        Tid: selectedType?.Tid.toString() || "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Convert numeric fields
    const productData = {
      ...formData,
      Mrp: Number.parseFloat(formData.Mrp),
      Sp: Number.parseFloat(formData.Sp),
      Tid: Number.parseInt(formData.Tid),
      Bid: Number.parseInt(formData.Bid),
    }

    // Validation: Check if selling price is less than MRP
    if (productData.Sp >= productData.Mrp) {
      setError("Selling price must be less than MRP.")
      setIsSubmitting(false)
      return
    }

    try {
      await onSubmit(productData)

      // Reset form after successful submission
      setFormData({
        Product: "",
        Type: "",
        Tid: "",
        ProductImg: "",
        Mrp: "",
        Sp: "",
        Brand: "",
        Bid: "",
        Quantity: 0,
      })
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="Product">Product Name</Label>
          <Input
            id="Product"
            name="Product"
            value={formData.Product}
            onChange={handleChange}
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="Brand">Brand</Label>
          <Select value={formData.Brand} onValueChange={(value) => handleSelectChange("Brand", value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.Bid} value={brand.Brand}>
                  {brand.Brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="Type">Product Type</Label>
          <Select value={formData.Type} onValueChange={(value) => handleSelectChange("Type", value)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select product type" />
            </SelectTrigger>
            <SelectContent>
              {productTypes.map((type) => (
                <SelectItem key={type.Tid} value={type.Type}>
                  {type.Type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ProductImg">Product Image URL</Label>
          <Input
            id="ProductImg"
            name="ProductImg"
            value={formData.ProductImg}
            onChange={handleChange}
            placeholder="Enter image URL"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="Mrp">MRP</Label>
          <Input
            id="Mrp"
            name="Mrp"
            type="number"
            value={formData.Mrp}
            onChange={handleChange}
            placeholder="Enter MRP"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="Sp">Selling Price</Label>
          <Input
            id="Sp"
            name="Sp"
            type="number"
            value={formData.Sp}
            onChange={handleChange}
            placeholder="Enter selling price"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="Quantity"
            type="number"
            value={formData.Quantity}
            onChange={handleChange}
            min="0"
          />
        </div>
      </div>

      {formData.ProductImg && (
        <Card className="p-4 flex justify-center">
          <img
            src={formData.ProductImg || "/placeholder.svg"}
            alt="Product preview"
            className="max-h-40 object-contain"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=160&width=160"
            }}
          />
        </Card>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adding Product..." : "Add Product"}
      </Button>
    </form>
  )
}

