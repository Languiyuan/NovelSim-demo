import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('api/game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  /** 掷骰创角 */
  @Post('roll-character')
  async rollCharacter() {
    return this.gameService.rollCharacter();
  }

  /** 确认角色，开始新游戏 */
  @Post('confirm-character')
  async confirmCharacter(@Body() body: { roll: any }) {
    return this.gameService.confirmCharacter(body.roll);
  }

  /** 获取当前游戏状态 */
  @Get('state/:saveId')
  async getGameState(@Param('saveId') saveId: number) {
    return this.gameService.getGameState(saveId);
  }

  /** 推进修炼（生成下一个节点） */
  @Post('next/:saveId')
  async getNextNode(@Param('saveId') saveId: number) {
    return this.gameService.generateNextNode(saveId);
  }

  /** 玩家做出选择 */
  @Post('choose')
  async makeChoice(@Body() body: { saveId: number; nodeId: number; choiceIndex: number }) {
    return this.gameService.makeChoice(body.saveId, body.nodeId, body.choiceIndex);
  }

  /** 尝试突破 */
  @Post('breakthrough/:saveId')
  async breakthrough(@Param('saveId') saveId: number) {
    return this.gameService.tryBreakthrough(saveId);
  }

  /** 获取存档列表 */
  @Get('saves')
  async getSaves(@Query('userId') userId: number) {
    return this.gameService.getSaves(userId || 1);
  }

  /** 获取游戏历史节点 */
  @Get('history/:saveId')
  async getHistory(@Param('saveId') saveId: number) {
    return this.gameService.getHistory(saveId);
  }
}
