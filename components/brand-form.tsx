import React, { useState } from "react"
import { Brand } from "@/lib/supabase"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

type BrandFormProps = {
  onSubmit: (brandData: Partial<Brand>) => void
  existingBrands: string[]
}

export const BrandForm: React.FC<BrandFormProps> = ({ onSubmit, existingBrands = [] }) => {
  const [brandData, setBrandData] = useState<Partial<Brand>>({})

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

    if (existingBrands.includes(currentBrand)) {
      toast.error("Brand already exists. Please enter a unique brand.")
      return
    }

    onSubmit(brandData)
    setBrandData({}) // Clear form after submission
  }

  return (
    <>
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
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Brand
        </button>
      </form>
      <ToastContainer />
    </>
  )
}

