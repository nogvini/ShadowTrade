import CryptoJS from 'crypto-js';
import type { EncryptedData, LNMarketsCredentials } from '@/types/backend';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'shadowtrade-default-key-change-in-production';

/**
 * Criptografa dados sensíveis usando AES-256
 */
export function encrypt(data: string): EncryptedData {
  try {
    const salt = CryptoJS.lib.WordArray.random(128/8);
    const iv = CryptoJS.lib.WordArray.random(128/8);
    
    const key = CryptoJS.PBKDF2(ENCRYPTION_KEY, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return {
      encryptedData: encrypted.toString(),
      iv: iv.toString(CryptoJS.enc.Hex),
      salt: salt.toString(CryptoJS.enc.Hex)
    };
  } catch (error) {
    throw new Error(`Erro na criptografia: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Descriptografa dados usando AES-256
 */
export function decrypt(encryptedData: EncryptedData): string {
  try {
    const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
    const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
    
    const key = CryptoJS.PBKDF2(ENCRYPTION_KEY, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData.encryptedData, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error(`Erro na descriptografia: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Criptografa credenciais da LNMarkets
 */
export function encryptCredentials(credentials: LNMarketsCredentials): {
  encryptedApiKey: EncryptedData;
  encryptedApiSecret: EncryptedData;
  encryptedPassphrase: EncryptedData;
} {
  return {
    encryptedApiKey: encrypt(credentials.apiKey),
    encryptedApiSecret: encrypt(credentials.apiSecret),
    encryptedPassphrase: encrypt(credentials.passphrase)
  };
}

/**
 * Descriptografa credenciais da LNMarkets
 */
export function decryptCredentials(
  encryptedApiKey: EncryptedData,
  encryptedApiSecret: EncryptedData,
  encryptedPassphrase: EncryptedData,
  network: 'mainnet' | 'testnet' = 'mainnet'
): LNMarketsCredentials {
  return {
    apiKey: decrypt(encryptedApiKey),
    apiSecret: decrypt(encryptedApiSecret),
    passphrase: decrypt(encryptedPassphrase),
    network
  };
}

/**
 * Gera hash seguro para senhas
 */
export function hashPassword(password: string): string {
  const salt = CryptoJS.lib.WordArray.random(128/8);
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  });
  
  return salt.toString(CryptoJS.enc.Hex) + ':' + hash.toString(CryptoJS.enc.Hex);
}

/**
 * Verifica senha contra hash
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [saltHex, hashHex] = hashedPassword.split(':');
    const salt = CryptoJS.enc.Hex.parse(saltHex);
    
    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    return hash.toString(CryptoJS.enc.Hex) === hashHex;
  } catch (error) {
    return false;
  }
} 