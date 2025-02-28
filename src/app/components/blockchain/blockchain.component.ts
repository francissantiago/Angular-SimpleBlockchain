import { Component, inject, OnInit } from '@angular/core';
import { BlockchainService } from '../../services/blockchain.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blockchain',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './blockchain.component.html',
  styleUrl: './blockchain.component.scss'
})
export class BlockchainComponent implements OnInit {
  newBlockData: string = '';
  isBlockchainValid: boolean = true;
  blockchainService = inject(BlockchainService);
  isMining: boolean = false;
  miningStatus: string = '';
  currentIndex = 0;

  ngOnInit(): void { }

  addBlock() {
    if (this.newBlockData.trim()) {
      this.isMining = true;
      this.miningStatus = `⛏️ Mineração do bloco iniciada...`;

      this.blockchainService.addBlock(
        this.newBlockData,
        () => {
          this.miningStatus = `⛏️ Minerando... Isso pode levar alguns segundos`;
        },
        (newBlock) => {
          this.isMining = false;
          this.miningStatus = `✅ Bloco ${newBlock.index} minerado com sucesso! 🚀`;
          this.newBlockData = '';
          this.checkBlockchainIntegrity();
        }
      );
    }
  }

  checkBlockchainIntegrity() {
    this.isBlockchainValid = this.blockchainService.isValid();
  }

  previousBlock() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextBlock() {
    if (this.currentIndex < this.blockchainService.blockchain.length - 1) {
      this.currentIndex++;
    }
  }
}
