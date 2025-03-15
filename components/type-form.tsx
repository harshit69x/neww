import React, { useState } from "react"
import { ProductType } from "@/lib/supabase"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

type TypeFormProps = {
  onSubmit: (typeData: Partial<ProductType>) => void
  existingTypes: string[]
}

export const TypeForm: React.FC<TypeFormProps> = ({ onSubmit, existingTypes = [] }) => {
  const [typeData, setTypeData] = useState<Partial<ProductType>>({})

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

    if (Array.isArray(existingTypes) && existingTypes.includes(currentType)) {
      toast.error("Type already exists. Please enter a unique type.")
      return
    }

    onSubmit(typeData)
    setTypeData({}) // Clear form after submission
  }

  return (
    <>
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
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Type
        </button>
      </form>
      <ToastContainer />
    </>
  )
}