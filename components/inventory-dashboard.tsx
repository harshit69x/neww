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

export function InventoryDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

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

      // Fetch brands
      const { data: brandsData, error: brandsError } = await supabase.from("Brands").select("*")

      if (brandsError) throw brandsError
      setBrands(brandsData || [])
      console.log('brands are')
      console.log(brandsData)
      // Fetch product types - assuming there's a ProductTypes table
      // If not, we can extract unique types from products
      const { data: typesData, error: typesError } = await supabase.from("Type").select("*")

      if (typesError) {
        // If table doesn't exist, extract unique types from products
        const uniqueTypes = [...new Set(productsData?.map((p) => p.Type))].map((type, index) => ({
          Tid: index + 1,
          Type: type as string,
        }))
        setProductTypes(uniqueTypes)
        console.log('types are')
        console.log(uniqueTypes)
      } else {
        setProductTypes(typesData || [])
        console.log('types are')
        console.log(typesData)
      }
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

  const handleDeleteProduct = async (productId: number) => {
    try {
      const { error } = await supabase.from("Products").delete().eq("Pid", productId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })

      // No need to manually update state as the realtime subscription will handle it
    } catch (error: any) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">Add, view, and manage your product inventory</p>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="add-product">Add Product</TabsTrigger>
          <TabsTrigger value="add-brand">Add Brand</TabsTrigger>
          <TabsTrigger value="add-type">Add Type</TabsTrigger>
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
                onDelete={handleDeleteProduct}
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
        <TabsContent value="add-brand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Brand</CardTitle>
              <CardDescription>Add a new brand to your inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <BrandForm onSubmit={handleAddBrand} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="add-type" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Type</CardTitle>
              <CardDescription>Add a new type to your inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <TypeForm onSubmit={handleAddType} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

