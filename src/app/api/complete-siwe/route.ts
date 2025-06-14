import { NextRequest, NextResponse } from 'next/server';
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js';

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export async function POST(req: NextRequest) {
  const { payload, nonce } = (await req.json()) as IRequestPayload;
  // Aquí podrías validar el nonce contra una cookie o base de datos si lo deseas
  try {
    const validMessage = await verifySiweMessage(payload, nonce);
    if (validMessage.isValid && payload.address) {
      return NextResponse.json({
        status: 'success',
        address: payload.address,
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid signature or address',
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
    });
  }
} 