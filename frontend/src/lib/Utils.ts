import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from 'axios';
import { config } from "@/config/Config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const getAccessToken = localStorage.getItem('accessToken')

// สร้าง axios instance
export const axiosInstance = axios.create({
  baseURL: `${config.apiUrl}`, // URL ของ API ที่ต้องการ
  timeout: 10000, // กำหนด timeout ในการร้องขอ (10 วินาที)
  headers: {
    'Content-Type': 'application/json', // ตั้งค่า headers เริ่มต้น
    'Authorization': `Bearer ${getAccessToken}` // ถ้ามีการใช้ token
  }
});