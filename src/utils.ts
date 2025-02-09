import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseJson(str: string) {
  try {
    return JSON.parse(str)
  } catch (error) {
    console.log('issue parsing JSON', error)
    return {}
  }
}