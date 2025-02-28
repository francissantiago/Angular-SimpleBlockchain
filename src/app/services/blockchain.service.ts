import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class BlockchainService {
  blockchain: any[] = [];
  difficulty: number = 3;
  blockTimeTarget: number = 5000; // 5 segundos por bloco
  lastBlockTime: number = Date.now();

  constructor() {
    this.createGenesisBlock();
  }

  private createGenesisBlock() {
    const genesisBlock = {
      index: 0,
      timestamp: new Date().toISOString(),
      data: 'Bloco Gênesis',
      previousHash: '0',
      nonce: 0,
      hash: this.calculateHash(0, new Date().toISOString(), 'Bloco Gênesis', '0', 0),
    };
    this.blockchain.push(genesisBlock);
  }

  private calculateHash(index: number, timestamp: string, data: string, previousHash: string, nonce: number): string {
    return CryptoJS.SHA256(index + timestamp + data + previousHash + nonce).toString();
  }

  private async mineBlock(index: number, timestamp: string, data: string, previousHash: string): Promise<any> {
    let nonce = 0;
    let hash = '';

    return new Promise((resolve) => {
      const mineLoop = () => {
        do {
          nonce++;
          hash = this.calculateHash(index, timestamp, data, previousHash, nonce);
        } while (!hash.startsWith('0'.repeat(this.difficulty)));

        resolve({ nonce, hash });
      };

      setTimeout(mineLoop, 0); // Permite que a UI continue responsiva
    });
  }

  async addBlock(data: string, onMiningStart: () => void, onMiningEnd: (block: any) => void) {
    const previousBlock = this.blockchain[this.blockchain.length - 1];
    const index = previousBlock.index + 1;
    const timestamp = new Date().toISOString();

    onMiningStart();

    const startTime = Date.now();
    const { nonce, hash } = await this.mineBlock(index, timestamp, data, previousBlock.hash);
    const miningDuration = Date.now() - startTime;

    const newBlock = {
      index,
      timestamp,
      data,
      previousHash: previousBlock.hash,
      nonce,
      hash,
    };

    this.blockchain.push(newBlock);

    // Autoajuste da dificuldade
    this.adjustDifficulty(miningDuration);

    onMiningEnd(newBlock);
  }

  private adjustDifficulty(miningDuration: number) {
    if (miningDuration < this.blockTimeTarget / 2) {
      this.difficulty++;
    } else if (miningDuration > this.blockTimeTarget * 2) {
      this.difficulty = Math.max(1, this.difficulty - 1);
    }
  }

  isValid(): boolean {
    for (let i = 1; i < this.blockchain.length; i++) {
      const currentBlock = this.blockchain[i];
      const previousBlock = this.blockchain[i - 1];

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      if (currentBlock.hash !== this.calculateHash(currentBlock.index, currentBlock.timestamp, currentBlock.data, currentBlock.previousHash, currentBlock.nonce)) {
        return false;
      }
    }
    return true;
  }
}
