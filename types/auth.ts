// types/auth.ts
import type { User } from "next-auth"

export interface AuthUser extends User {
  id: string
  role: "admin" | "editor" | "user" | "premium" | "luxury"
  email: string
  name: string
  image?: string
}