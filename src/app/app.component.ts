import { Component, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CdkDragDrop, CdkDrag, CdkDropList, transferArrayItem } from '@angular/cdk/drag-drop';

interface Nut {
  id: number;
  color: string;
  boltIndex: number;
  shadowColor: string;
}

interface Bolt {
  index: number;
  nuts: Nut[];
  color: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzCardModule, CdkDropList, CdkDrag],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('nutAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  title = 'Nut Sorter Game';
  bolts: Bolt[] = [];
  colors: string[] = [
    '#FF5252', '#FF4081', '#E040FB', '#7C4DFF',
    '#536DFE', '#448AFF', '#40C4FF', '#18FFFF'
  ];
  moves: number = 0;
  gameWon: boolean = false;
  readonly MAX_NUTS_PER_BOLT = 10;

  constructor(private message: NzMessageService) {}

  ngOnInit(): void {
    this.startNewGame();
  }

  getConnectedBolts(currentBoltIndex: number): string[] {
    return this.bolts
      .filter((_, index) => index !== currentBoltIndex)
      .map(bolt => bolt.index.toString());
  }

  startNewGame(): void {
    this.bolts = Array(6).fill(0).map((_, i) => ({
      index: i,
      nuts: [],
      color: this.getRandomGray()
    }));

    const allNuts: Nut[] = [];
    const nutsPerColor = 10;
    let id = 0;

    for (let colorIndex = 0; colorIndex < 5; colorIndex++) {
      const nutColor = this.colors[colorIndex % this.colors.length];
      const shadowColor = this.darkenColor(nutColor, 20);

      for (let i = 0; i < nutsPerColor; i++) {
        allNuts.push({
          id: id++,
          color: nutColor,
          boltIndex: colorIndex,
          shadowColor: shadowColor
        });
      }
    }

    this.shuffleArray(allNuts);

    const nutsPerBolt = Math.floor(allNuts.length / 5);

    for (let i = 0; i < 5; i++) {
      const startIdx = i * nutsPerBolt;
      const endIdx = (i + 1) * nutsPerBolt;
      const nutsForBolt = allNuts.slice(startIdx, endIdx);

      nutsForBolt.forEach(nut => nut.boltIndex = i);
      this.bolts[i].nuts = nutsForBolt;
    }

    this.bolts[5].nuts = [];
    this.moves = 0;
    this.gameWon = false;
  }

  onDrop(event: CdkDragDrop<Nut[]>) {
    if (event.previousContainer === event.container) {
      return;
    }

    const targetBoltIndex = parseInt(event.container.id);
    const targetBolt = this.bolts[targetBoltIndex];

    if (targetBolt.nuts.length >= this.MAX_NUTS_PER_BOLT) {
      this.message.warning(`Максимум ${this.MAX_NUTS_PER_BOLT} гаек на болте!`);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const movedNut = event.container.data[event.currentIndex];
    movedNut.boltIndex = targetBoltIndex;
    this.moves++;
    this.checkWinCondition();
  }

  checkWinCondition(): void {
    for (const bolt of this.bolts) {
      if (bolt.nuts.length === 0) continue;

      const firstColor = bolt.nuts[0].color;
      for (const nut of bolt.nuts) {
        if (nut.color !== firstColor) {
          return;
        }
      }
    }

    this.gameWon = true;
    this.message.success(`Поздравляем! Вы отсортировали гайки за ${this.moves} ходов!`);
  }

  private shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private getRandomGray(): string {
    const brightness = 150 + Math.floor(Math.random() * 60);
    return `rgb(${brightness}, ${brightness}, ${brightness})`;
  }

  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;

    return `#${(
      0x1000000 +
      (R < 0 ? 0 : R) * 0x10000 +
      (G < 0 ? 0 : G) * 0x100 +
      (B < 0 ? 0 : B)
    ).toString(16).slice(1)}`;
  }
}
