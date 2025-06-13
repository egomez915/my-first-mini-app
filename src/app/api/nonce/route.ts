import { NextResponse } from "next/server";

export async function GET() {
  // Genera un nonce seguro y sin guiones (alfanumérico)
  const nonce = crypto.randomUUID().replace(/-/g, ""); // Ejemplo: "bb7e4a19c3e14b0d9f5c2e8c6b55dafe"
  return NextResponse.json({ nonce });
}
