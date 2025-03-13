import React, { useState } from "react"
import { Brand } from "@/lib/supabase"

type BrandFormProps = {
  onSubmit: (brandData: Partial<Brand>) => void
}

export const BrandForm: React.FC<BrandFormProps> = ({ onSubmit }) => {
  const [brandData, setBrandData] = useState<Partial<Brand>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBrandData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(brandData)
  }

  return (
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Add Brand
      </button>
    </form>
  )
}