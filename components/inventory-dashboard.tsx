"use client"

import { useEffect, useState } from "react"
import { supabase, type Product, type Brand, type ProductType } from "@/lib/supabase"
import { ProductForm } from "@/components/product-form"
import { ProductTable } from "@/components/product-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { BrandForm } from "@/components/brand-form"
import { TypeForm } from "@/components/type-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function InventoryDashboard() {
  const [products, setProducts] = useState<Product[]>([])

  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [types, setTypes] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])

  useEffect(() => {
    fetchData()
    setupRealtimeSubscription()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase.from("Products").select("*")

      if (productsError) throw productsError
      setProducts(productsData || [])

      // Fetch brands and store their names
      const { data: brandsData, error: brandsError } = await supabase.from("Brands").select("*")
      if (brandsError) throw brandsError
      const existingBrandNames = brandsData.map(brand => brand.Brand)
      setBrands(brandsData || [])

      // Fetch types and store their names
      const { data: typesData, error: typesError } = await supabase.from("Type").select("*")
      if (typesError) throw typesError
      const existingTypeNames = typesData.map(type => type.Type)
      setTypes(existingTypeNames || [])
      setProductTypes(typesData || [])

    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("inventory-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "Products" }, (payload) => {
        console.log("Change received!", payload)
        fetchData() // Refresh data when changes occur

        // Show toast notification based on the event
        if (payload.eventType === "INSERT") {
          toast({
            title: "Product Added",
            description: "A new product has been added to inventory",
          })
        } else if (payload.eventType === "DELETE") {
          toast({
            title: "Product Deleted",
            description: "A product has been removed from inventory",
          })
        } else if (payload.eventType === "UPDATE") {
          toast({
            title: "Product Updated",
            description: "A product has been updated in inventory",
          })
        }
      })
      .subscribe()

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleAddProduct = async (productData: Partial<Product>) => {
    try {
      // Fetch the latest Pid
      const { data: latestProduct, error: fetchError } = await supabase
        .from("Products")
        .select("Pid")
        .order("Pid", { ascending: false })
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError

      // Increment the Pid for the new product
      const newPid = latestProduct ? latestProduct.Pid + 1 : 1

      // Combine brand name and product name
      const combinedProductName = productData.Brand ? `${productData.Brand} ${productData.Product}`.trim() : productData.Product

      // Create new product data with combined product name
      const newProductData = { ...productData, Pid: newPid, Product: combinedProductName }

      // Insert the new product with the incremented Pid
      const { data, error } = await supabase.from("Products").insert([newProductData]).select()

      if (error) throw error

      toast({
        title: "Success",
        description: "Product added successfully",
      })

      // No need to manually update state as the realtime subscription will handle it
    } catch (error: any) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProducts = async (productIds: number[]) => {
    try {
      const { error } = await supabase.from("Products").delete().in("Pid", productIds)

      if (error) throw error

      toast({
        title: "Success",
        description: "Products deleted successfully",
      })

      // No need to manually update state as the realtime subscription will handle it
    } catch (error: any) {
      console.error("Error deleting products:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete products",
        variant: "destructive",
      })
    }
  }

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    try {
      const { error } = await supabase
        .from("Products")
        .update({ Quantity: quantity })
        .eq("Pid", productId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Product quantity updated successfully",
      })

      // Refresh data to reflect the updated quantity
      fetchData()
    } catch (error: any) {
      console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      })
    }
  }

  const handleAddBrand = async (brandData: Partial<Brand>) => {
    try {
      // Check if brand already exists
      const { data: existingBrand } = await supabase
        .from("Brands")
        .select("Brand")
        .eq("Brand", brandData.Brand)
        .single()

      if (existingBrand) {
        toast({
          title: "Error",
          description: "This brand already exists",
          variant: "destructive",
        })
        return
      }

      // Fetch the latest Bid
      const { data: latestBrand, error: fetchError } = await supabase
        .from("Brands")
        .select("Bid")
        .order("Bid", { ascending: false })
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError

      // Increment the Bid for the new brand
      const newBid = latestBrand ? latestBrand.Bid + 1 : 1
      const newBrandData = { ...brandData, Bid: newBid }

      // Insert the new brand with the incremented Bid
      const { data, error } = await supabase.from("Brands").insert([newBrandData]).select()

      if (error) throw error

      toast({
        title: "Success",
        description: "Brand added successfully",
      })
    } catch (error: any) {
      console.error("Error adding brand:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add brand",
        variant: "destructive",
      })
    }
  }

  const handleAddType = async (typeData: Partial<ProductType>) => {
    try {
      // Check if type already exists
      const { data: existingType } = await supabase
        .from("Type")
        .select("Type")
        .eq("Type", typeData.Type)
        .single()

      if (existingType) {
        toast({
          title: "Error",
          description: "This type already exists",
          variant: "destructive",
        })
        return
      }

      // Fetch the latest Tid
      const { data: latestType, error: fetchError } = await supabase
        .from("Type")
        .select("Tid")
        .order("Tid", { ascending: false })
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError

      // Increment the Tid for the new type
      const newTid = latestType ? latestType.Tid + 1 : 1
      const newTypeData = { ...typeData, Tid: newTid }

      // Insert the new type with the incremented Tid
      const { data, error } = await supabase.from("Type").insert([newTypeData]).select()

      if (error) throw error

      toast({
        title: "Success",
        description: "Type added successfully",
      })
    } catch (error: any) {
      console.error("Error adding type:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add type",
        variant: "destructive",
      })
    }
  }

  const handleEditBrand = async (oldBrand: string, newBrand: string) => {
    try {
      const { error } = await supabase
        .from("Brands")
        .update({ Brand: newBrand })
        .eq("Brand", oldBrand)

      if (error) throw error

      // Update products with the new brand name
      const { error: productsError } = await supabase
        .from("Products")
        .update({ Brand: newBrand })
        .eq("Brand", oldBrand)

      if (productsError) throw productsError

      toast({
        title: "Success",
        description: "Brand updated successfully",
      })
      
      // Refresh your brands list
      fetchData()
    } catch (error: any) {
      console.error("Error updating brand:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update brand",
        variant: "destructive",
      })
    }
  }

  const handleEditType = async (oldType: string, newType: string) => {
    try {
      const { error } = await supabase
        .from("Type")
        .update({ Type: newType })
        .eq("Type", oldType)

      if (error) throw error

      // Update products with the new type name
      const { error: productsError } = await supabase
        .from("Products")
        .update({ Type: newType })
        .eq("Type", oldType)

      if (productsError) throw productsError

      toast({
        title: "Success",
        description: "Type updated successfully",
      })
      
      // Refresh your types list
      fetchData()
    } catch (error: any) {
      console.error("Error updating type:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update type",
        variant: "destructive",
      })
    }
  }

  const handleTypeSubmit = (typeData: Partial<ProductType>) => {
    // Handle type submission
  }

  const handleBrandSubmit = (brandData: Partial<Brand>) => {
    // Handle brand submission
  }

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Add, view, and manage your product inventory</p>
        </div>

        <Tabs defaultValue="inventory">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="add-product">Add Product</TabsTrigger>
            <TabsTrigger value="manage">Manage Types & Brands</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>View and manage your current inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductTable
                  products={products}
                  loading={loading}
                  onDelete={handleDeleteProducts}
                  onUpdateQuantity={handleUpdateQuantity}
                  setProducts={setProducts}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-product" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
                <CardDescription>Add a new product to your inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductForm
                  brands={brands}
                  productTypes={productTypes}
                  onSubmit={handleAddProduct}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Types & Brands</CardTitle>
                <CardDescription>Add new types and brands to your inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Product Types</h2>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="existing-type">Existing Types</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="View existing types" />
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
                        <TypeForm
                          onSubmit={handleAddType}
                          onEdit={handleEditType}  // Add this line
                          existingTypes={types}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Brands</h2>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="existing-brand">Existing Brands</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="View existing brands" />
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
                        <BrandForm
                          onSubmit={handleAddBrand}
                          onEdit={handleEditBrand}  // Add this line
                          existingBrands={brands.map(b => b.Brand)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

