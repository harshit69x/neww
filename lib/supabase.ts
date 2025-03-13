import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for interacting with your database
const supabaseUrl = "https://sysytlpmmbguerybcyvw.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5c3l0bHBtbWJndWVyeWJjeXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDgwMzYsImV4cCI6MjA1NzI4NDAzNn0.fqoKBX7NghHp1otkvJMlnQo_IAmPzM8XSjg4Yq2FLyo"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Product = {
  Pid: number
  Product: string
  Type: string
  Tid: number
  ProductImg: string
  Mrp: number
  Sp: number
  Brand: string
  Bid: number
  Quantity:number
}

export type Brand = {
  Bid: number
  Brand: string
}

export type ProductType = {
  Tid: number
  Type: string
}

