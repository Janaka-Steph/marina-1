/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-constant-condition */
import axios from 'axios';

export const APIURL = process.env.EXPLORER || `http://localhost:3001`;

export function sleep(ms: number): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function faucet(address: string, amount: number, asset?: string): Promise<string> {
  try {
    const { status, data } = await axios.post(`${APIURL}/faucet`, { address, amount, asset });
    if (status !== 200) {
      throw new Error('Invalid address');
    }
    const { txId } = data;
    return txId;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/**
 * Mint
 * @param address
 * @param quantity
 * @param name
 * @param ticker
 * @param precision
 * @returns mint data
 */
export async function mint(
  address: string,
  quantity: number,
  name?: string,
  ticker?: string,
  precision?: number
): Promise<{ asset: string; txid: string }> {
  try {
    const { status, data } = await axios.post(`${APIURL}/mint`, {
      address,
      quantity,
      name,
      ticker,
      precision,
    });
    if (status !== 200) {
      throw new Error('Invalid address');
    }
    await sleep(6000);
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function broadcastTx(hex: string): Promise<string> {
  try {
    return (await axios.post(`${APIURL}/tx`, hex)).data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
