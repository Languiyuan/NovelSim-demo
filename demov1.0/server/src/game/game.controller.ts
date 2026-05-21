import { Controller, Post, Get, Body } from '@nestjs/common';
import { GameService } from './game.service';
import { NextNarrativeDto } from './dto/next-narrative.dto';
import { ChooseOptionDto } from './dto/choose-option.dto';

@Controller('api/game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('start')
  async startGame() {
    return this.gameService.startGame();
  }

  @Post('next')
  async getNextNarrative(@Body() dto: NextNarrativeDto) {
    return this.gameService.getNextNarrative(dto);
  }

  @Post('choose')
  async makeChoice(@Body() dto: ChooseOptionDto) {
    return this.gameService.makeChoice(dto);
  }

  @Get('history')
  async getHistory() {
    return this.gameService.getHistory();
  }
}
