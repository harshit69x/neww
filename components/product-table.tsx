"use client"

import { useState, useEffect, Dispatch, SetStateAction } from "react"
import type { Product, Brand, ProductType } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface ProductTableProps {
  products: Product[]
  loading: boolean
  onDelete: (productId: number) => void
  onUpdateQuantity: (productId: number, quantity: number) => void
  setProducts: Dispatch<SetStateAction<Product[]>>
}

export function ProductTable({ products, loading, onDelete, onUpdateQuantity, setProducts }: ProductTableProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Product>>({})
  const [brands, setBrands] = useState<Brand[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])

  useEffect(() => {
    fetchBrandsAndTypes()
  }, [])

  const fetchBrandsAndTypes = async () => {
    try {
      const { data: brandsData, error: brandsError } = await supabase.from("Brands").select("*")
      if (brandsError) throw brandsError
      setBrands(brandsData || [])

      const { data: typesData, error: typesError } = await supabase.from("Type").select("*")
      if (typesError) throw typesError
      setProductTypes(typesData || [])
    } catch (error) {
      console.error("Error fetching brands and types:", error)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.Product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.Brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.Type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
  }

  const confirmDelete = () => {
    if (productToDelete) {
      onDelete(productToDelete.Pid)
      setProductToDelete(null)
    }
  }

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.Pid)
    setEditFormData(product)
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validate MRP and SP
    if (name === 'Mrp') {
      const mrp = parseFloat(value);
      const currentSp = editFormData.Sp ? parseFloat(editFormData.Sp.toString()) : 0;
      
      if (currentSp > mrp) {
        alert('Selling price cannot be greater than MRP');
        return;
      }
    }

    if (name === 'Sp') {
      const sp = parseFloat(value);
      const currentMrp = editFormData.Mrp ? parseFloat(editFormData.Mrp.toString()) : 0;
      
      if (sp > currentMrp) {
        alert('Selling price cannot be greater than MRP');
        return;
      }
    }

    setEditFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'Mrp' || name === 'Sp' ? parseFloat(value) : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'Brand') {
      // Extract the base product name by removing the old brand name
      const oldBrand = editFormData.Brand || ''
      const currentProduct = editFormData.Product || ''
      const baseProductName = currentProduct.replace(oldBrand, '').trim()
      
      // Create new product name with new brand
      const newProductName = `${value} ${baseProductName}`
      
      setEditFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        Product: newProductName
      }))
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSaveClick = async (productId: number) => {
    try {
      // Convert prices properly - don't multiply by 100
      const mrp = parseFloat(editFormData.Mrp?.toString() || '0')
      const sp = parseFloat(editFormData.Sp?.toString() || '0')

      if (sp > mrp) {
        toast({
          title: "Validation Error",
          description: "Selling price cannot be greater than MRP",
          variant: "destructive"
        })
        return
      }

      // Get the brand and create combined product name
      const brand = editFormData.Brand || ''
      const baseProductName = editFormData.Product?.replace(brand, '').trim() || ''
      const combinedProductName = `${brand} ${baseProductName}`

      const updatedData = {
        ...editFormData,
        Product: combinedProductName,
        Mrp: mrp, // Don't multiply by 100
        Sp: sp,   // Don't multiply by 100
        Bid: brands.find(b => b.Brand === editFormData.Brand)?.Bid || null,
        Tid: productTypes.find(t => t.Type === editFormData.Type)?.Tid || null
      }

      const { error } = await supabase
        .from('Products')
        .update(updatedData)
        .eq('Pid', productId)

      if (error) throw error

      // Update local state without any price conversion
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.Pid === productId ? { 
            ...product, 
            ...updatedData,
            Product: combinedProductName,
            Mrp: mrp, // Keep original values
            Sp: sp
          } : product
        )
      )

      setEditingProductId(null)
      setEditFormData({})

      toast({
        title: "Success",
        description: "Product updated successfully"
      })

    } catch (error: any) {
      console.error('Error updating product:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive"
      })
    }
  }

  const formatPrice = (price: number | null | undefined) => {
    if (typeof price !== 'number') return '₹0.00';
    return `₹${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">{filteredProducts.length} products</div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">MRP</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.Pid}>
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <img
                        src={product.ProductImg || "/placeholder.svg?height=40&width=40"}
                        alt={product.Product}
                        className="object-cover"
                        width={40}
                        height={40}
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=40&width=40"
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {editingProductId === product.Pid ? (
                      <Input
                        type="text"
                        name="Product"
                        value={editFormData.Product || ""}
                        onChange={handleEditChange}
                      />
                    ) : (
                      product.Product
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProductId === product.Pid ? (
                      <Select
                        value={editFormData.Brand || ""}
                        onValueChange={(value) => handleSelectChange("Brand", value)}
                      >
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
                    ) : (
                      product.Brand
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProductId === product.Pid ? (
                      <Select
                        value={editFormData.Type || ""}
                        onValueChange={(value) => handleSelectChange("Type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {productTypes.map((type) => (
                            <SelectItem key={type.Tid} value={type.Type}>
                              {type.Type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      product.Type
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingProductId === product.Pid ? (
                      <Input
                        type="number"
                        name="Mrp"
                        value={editFormData.Mrp || ''}
                        onChange={handleEditChange}
                        min={editFormData.Sp || 0}
                        step="0.01"
                      />
                    ) : (
                      formatPrice(product.Mrp)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingProductId === product.Pid ? (
                      <Input
                        type="number"
                        name="Sp"
                        value={editFormData.Sp || ''}
                        onChange={handleEditChange}
                        max={editFormData.Mrp || Infinity}
                        step="0.01"
                      />
                    ) : (
                      formatPrice(product.Sp)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <button onClick={() => onUpdateQuantity(product.Pid, product.Quantity - 1)}>-</button>
                    {product.Quantity}
                    <button onClick={() => onUpdateQuantity(product.Pid, product.Quantity + 1)}>+</button>
                  </TableCell>
                  <TableCell>
                    {editingProductId === product.Pid ? (
                      <Button onClick={() => handleSaveClick(product.Pid)}>Save</Button>
                    ) : (
                      <Button onClick={() => handleEditClick(product)}>Edit</Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(product)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{productToDelete?.Product}" from your inventory. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

