import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Save, Role, GameState, World, GameNode, Npc, User } from '../entities';
import { AgentService } from '../agent/agent.service';
import { CharacterService } from './services/character.service';
import { NodeService } from './services/node.service';
import { BattleService } from './services/battle.service';
import { RealmService } from './services/realm.service';
import { StructuredGameState, WorldOutline, StoryOutline } from '../shared/interfaces';
import { REALM_CONFIG, calculateDerivedStats } from '../shared/constants';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  // 内存缓存（Demo 简化版，正式版用 Redis）
  private worldOutlineCache = new Map<number, WorldOutline>();
  private storyOutlineCache = new Map<number, StoryOutline>();

  constructor(
    @InjectRepository(Save) private saveRepo: Repository<Save>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(GameState) private gameStateRepo: Repository<GameState>,
    @InjectRepository(World) private worldRepo: Repository<World>,
    @InjectRepository(GameNode) private nodeRepo: Repository<GameNode>,
    @InjectRepository(Npc) private npcRepo: Repository<Npc>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private agentService: AgentService,
    private characterService: CharacterService,
    private nodeService: NodeService,
    private battleService: BattleService,
    private realmService: RealmService,
  ) {}

  /**
   * 掷骰创角
   */
  async rollCharacter() {
    const roll = this.characterService.rollCharacter();
    return { code: 0, msg: 'ok', data: roll };
  }

  /**
   * 确认角色，开始新游戏
   */
  async confirmCharacter(roll: any) {
    // 确保有默认用户（Demo 简化）
    let user = await this.userRepo.findOne({ where: { id: 1 } });
    if (!user) {
      user = this.userRepo.create({ nickname: '修仙者', wxOpenid: null, aliUserId: null });
      await this.userRepo.save(user);
    }

    // 创建存档
    const save = this.saveRepo.create({
      userId: user.id,
      name: roll.name,
      status: 'active',
    });
    await this.saveRepo.save(save);

    // 创建角色
    const role = this.roleRepo.create({
      saveId: save.id,
      name: roll.name,
      jing: roll.jing,
      qi: roll.qi,
      shen: roll.shen,
      talent: roll.talent,
      wisdom: roll.wisdom,
      luck: roll.luck,
      realm: '练气初期',
      exp: 0,
      age: 16,
      maxAge: 80 + roll.qi * 2,
    });
    await this.roleRepo.save(role);

    // Agent3: 生成世界
    const worldOutline = await this.agentService.generateWorld('练气初期', '凡界');
    this.worldOutlineCache.set(save.id, worldOutline);

    // 保存世界
    const world = this.worldRepo.create({
      saveId: save.id,
      name: worldOutline.name,
      worldType: '凡界',
      geography: worldOutline.geography,
      history: worldOutline.history,
      factions: worldOutline.factions,
      rules: worldOutline.rules,
      maxRealm: worldOutline.maxRealm,
      status: 'current',
      seq: 1,
    });
    await this.worldRepo.save(world);

    // Agent1: 生成故事大纲
    const storyOutline = await this.agentService.generateStory(worldOutline, roll.name, '练气初期');
    this.storyOutlineCache.set(save.id, storyOutline);

    // 保存 NPC
    for (const npcInfo of storyOutline.npcs) {
      const npc = this.npcRepo.create({
        saveId: save.id,
        name: npcInfo.name,
        type: npcInfo.type,
        personality: npcInfo.personality,
        affinity: npcInfo.initialAffinity,
        status: '在世',
        metadata: { plotRole: npcInfo.plotRole },
      });
      await this.npcRepo.save(npc);
    }

    // 创建游戏状态
    const initialState: StructuredGameState = {
      baseAttrs: { jing: roll.jing, qi: roll.qi, shen: roll.shen },
      character: {
        realm: '练气初期',
        exp: 0,
        age: 16,
        maxAge: 80 + roll.qi * 2,
        talent: roll.talent,
        wisdom: roll.wisdom,
        luck: roll.luck,
      },
      inventory: [],
      skills: [],
      npcRelations: {},
      karmaDebts: [],
      worldFlags: [],
    };

    // 将 NPC 关系加入状态
    for (const npcInfo of storyOutline.npcs) {
      initialState.npcRelations[npcInfo.name] = {
        status: '在世',
        affinity: npcInfo.initialAffinity,
      };
    }

    const gameState = this.gameStateRepo.create({
      saveId: save.id,
      state: initialState,
      summary: null,
      summaryVersion: 0,
    });
    await this.gameStateRepo.save(gameState);

    // Agent2: 生成初始引导节点
    const guideNodes = await this.agentService.generateNodes(
      worldOutline, storyOutline, initialState, [], 1,
    );

    // 保存引导节点
    let firstNode: any = null;
    if (guideNodes.length > 0) {
      const nodeData = guideNodes[0];
      const node = this.nodeRepo.create({
        saveId: save.id,
        realm: '练气初期',
        nodeType: nodeData.type,
        subType: nodeData.subType || null,
        text: nodeData.text,
        choices: nodeData.choices,
        stateChanges: nodeData.stateChanges,
        isPregenerated: 0,
        chosenIndex: null,
      });
      await this.nodeRepo.save(node);
      firstNode = { id: node.id, ...nodeData };
    }

    const derived = calculateDerivedStats(initialState.baseAttrs);

    return {
      code: 0,
      msg: 'ok',
      data: {
        saveId: save.id,
        character: {
          name: roll.name,
          ...initialState.baseAttrs,
          ...initialState.character,
          derived,
        },
        world: {
          name: worldOutline.name,
          geography: worldOutline.geography,
          factions: worldOutline.factions,
        },
        story: {
          background: storyOutline.background,
          tone: storyOutline.storyTone,
        },
        npcs: storyOutline.npcs,
        firstNode,
      },
    };
  }

  /**
   * 获取游戏状态
   */
  async getGameState(saveId: number) {
    const save = await this.saveRepo.findOne({ where: { id: saveId } });
    if (!save) return { code: 404, msg: '存档不存在', data: null };

    const role = await this.roleRepo.findOne({ where: { saveId } });
    const gameState = await this.gameStateRepo.findOne({ where: { saveId } });
    const world = await this.worldRepo.findOne({ where: { saveId, status: 'current' } });
    const npcs = await this.npcRepo.find({ where: { saveId } });

    const derived = role ? calculateDerivedStats({ jing: role.jing, qi: role.qi, shen: role.shen }) : null;

    return {
      code: 0,
      msg: 'ok',
      data: {
        save,
        character: role ? { ...role, derived } : null,
        gameState: gameState?.state || null,
        world,
        npcs,
      },
    };
  }

  /**
   * 生成下一个节点（修炼推进）
   */
  async generateNextNode(saveId: number) {
    const gameState = await this.gameStateRepo.findOne({ where: { saveId } });
    if (!gameState) return { code: 404, msg: '游戏状态不存在', data: null };

    const state = gameState.state;

    // 检查寿元
    if (state.character.age >= state.character.maxAge) {
      return this.handleEnding(saveId, 'lifespan', state);
    }

    // 获取缓存的世界/故事大纲
    const worldOutline = await this.getWorldOutline(saveId);
    const storyOutline = await this.getStoryOutline(saveId);

    // 获取最近节点摘要
    const recentNodes = await this.nodeRepo.find({
      where: { saveId },
      order: { createdAt: 'DESC' },
      take: 5,
    });
    const recentSummary = recentNodes.map(n => `[${n.nodeType}] ${n.text.substring(0, 30)}...`);

    // Agent2: 生成节点
    const nodes = await this.agentService.generateNodes(
      worldOutline, storyOutline, state, recentSummary, 1,
    );

    if (!nodes.length) {
      return { code: 500, msg: '节点生成失败', data: null };
    }

    const nodeData = nodes[0];

    // 修炼日志：增加经验和年龄
    const expGain = 20 + Math.floor(Math.random() * 30);
    const ageGain = 5 + Math.floor(Math.random() * 10);

    state.character.exp += expGain;
    state.character.age += ageGain;

    // 保存状态
    gameState.state = state;
    await this.gameStateRepo.save(gameState);

    // 保存节点
    const node = this.nodeRepo.create({
      saveId,
      realm: state.character.realm,
      nodeType: nodeData.type,
      subType: nodeData.subType || null,
      text: nodeData.text,
      choices: nodeData.choices,
      stateChanges: nodeData.stateChanges,
      isPregenerated: 0,
      chosenIndex: null,
    });
    await this.nodeRepo.save(node);

    // 检查突破条件
    const realmConfig = REALM_CONFIG[state.character.realm];
    const canBreakthrough = realmConfig && state.character.exp >= realmConfig.expThreshold;

    const derived = calculateDerivedStats(state.baseAttrs);

    return {
      code: 0,
      msg: 'ok',
      data: {
        log: {
          text: `灵气流转间，修为精进。经验+${expGain}，年龄+${ageGain}岁。`,
          expGain,
          ageGain,
        },
        node: { id: node.id, ...nodeData },
        character: { ...state.character, derived },
        canBreakthrough,
      },
    };
  }

  /**
   * 玩家做出选择
   */
  async makeChoice(saveId: number, nodeId: number, choiceIndex: number) {
    const gameState = await this.gameStateRepo.findOne({ where: { saveId } });
    if (!gameState) return { code: 404, msg: '游戏状态不存在', data: null };

    const node = await this.nodeRepo.findOne({ where: { id: nodeId } });
    if (!node) return { code: 404, msg: '节点不存在', data: null };

    const state = gameState.state;
    const choices = node.choices || [];
    const choiceText = choices[choiceIndex]?.text || `选项${choiceIndex + 1}`;

    // 记录选择
    node.chosenIndex = choiceIndex;
    await this.nodeRepo.save(node);

    // 获取世界/故事大纲
    const worldOutline = await this.getWorldOutline(saveId);
    const storyOutline = await this.getStoryOutline(saveId);

    // Agent2: 生成选择后的叙事
    const result = await this.agentService.generateNarrativeAfterChoice(
      worldOutline, storyOutline, state, choiceText, node.text,
    );

    // 应用状态变更
    const stateChanges = node.stateChanges || result.stateChanges;
    if (stateChanges) {
      this.nodeService.applyStateChanges(state, stateChanges);
    }

    // 检查战斗类型节点
    let battleResult: any = null;
    if (node.nodeType === 'BATTLE' && choiceIndex === 0) {
      battleResult = this.battleService.resolveBattle(state);
      if (battleResult.result === 'DEATH') {
        return this.handleEnding(saveId, 'death', state);
      }
    }

    // 检查寿元
    if (state.character.age >= state.character.maxAge) {
      return this.handleEnding(saveId, 'lifespan', state);
    }

    // 同步角色表
    await this.syncRoleFromState(saveId, state);

    // 保存游戏状态
    gameState.state = state;
    await this.gameStateRepo.save(gameState);

    // 检查突破条件
    const realmConfig = REALM_CONFIG[state.character.realm];
    const canBreakthrough = realmConfig && state.character.exp >= realmConfig.expThreshold;

    const derived = calculateDerivedStats(state.baseAttrs);

    return {
      code: 0,
      msg: 'ok',
      data: {
        narrative: result.narrative,
        stateChanges,
        character: { ...state.character, ...state.baseAttrs, derived },
        battleResult,
        canBreakthrough,
        isEnding: false,
      },
    };
  }

  /**
   * 尝试境界突破
   */
  async tryBreakthrough(saveId: number) {
    const gameState = await this.gameStateRepo.findOne({ where: { saveId } });
    if (!gameState) return { code: 404, msg: '游戏状态不存在', data: null };

    const state = gameState.state;
    const result = this.realmService.tryBreakthrough(state);

    if (result.success) {
      // 同步角色表
      await this.syncRoleFromState(saveId, state);
      // 保存状态
      gameState.state = state;
      await this.gameStateRepo.save(gameState);
    }

    const derived = calculateDerivedStats(state.baseAttrs);

    return {
      code: 0,
      msg: 'ok',
      data: {
        ...result,
        character: { ...state.character, ...state.baseAttrs, derived },
      },
    };
  }

  /**
   * 获取存档列表
   */
  async getSaves(userId: number) {
    const saves = await this.saveRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });

    const result: any[] = [];
    for (const save of saves) {
      const role = await this.roleRepo.findOne({ where: { saveId: save.id } });
      result.push({
        ...save,
        character: role ? { name: role.name, realm: role.realm, age: role.age } : null,
      });
    }

    return { code: 0, msg: 'ok', data: result };
  }

  /**
   * 获取游戏历史
   */
  async getHistory(saveId: number) {
    const nodes = await this.nodeRepo.find({
      where: { saveId },
      order: { createdAt: 'ASC' },
    });

    return {
      code: 0,
      msg: 'ok',
      data: nodes.map(n => ({
        id: n.id,
        type: n.nodeType,
        subType: n.subType,
        text: n.text,
        choices: n.choices,
        chosenIndex: n.chosenIndex,
        createdAt: n.createdAt,
      })),
    };
  }

  // ── 私有方法 ──────────────────────────────────────────

  private async handleEnding(saveId: number, type: string, state: StructuredGameState) {
    const save = await this.saveRepo.findOne({ where: { id: saveId } });
    if (save) {
      save.status = 'ended';
      save.endingType = type;
      await this.saveRepo.save(save);
    }

    const endingNarratives: Record<string, string> = {
      ascension: `历经无数磨难，${state.character.realm}巅峰的修为终于迎来质变。九色仙云自天际飘来，大道呼唤声震彻整个世界。渡劫成功，飞升仙界——这一刻，凡界将永远记住这个名字。`,
      death: `修仙路上总有风险，这一次的危机终究没能度过。元神消散之际，回想修行路上的点点滴滴，虽有遗憾，但从未后悔踏上这条路。`,
      lifespan: `岁月如白驹过隙，大限已至。端坐于洞府之中，感受生命之火缓缓熄灭，心中无怨无悔——修行${state.character.age}载，已是无憾。`,
    };

    const derived = calculateDerivedStats(state.baseAttrs);

    return {
      code: 0,
      msg: 'ok',
      data: {
        isEnding: true,
        ending: {
          type,
          narrative: endingNarratives[type] || endingNarratives.lifespan,
          summary: `修行${state.character.age}年，达到${state.character.realm}，经历了无数风雨。`,
        },
        character: { ...state.character, ...state.baseAttrs, derived },
      },
    };
  }

  private async syncRoleFromState(saveId: number, state: StructuredGameState) {
    const role = await this.roleRepo.findOne({ where: { saveId } });
    if (role) {
      role.jing = state.baseAttrs.jing;
      role.qi = state.baseAttrs.qi;
      role.shen = state.baseAttrs.shen;
      role.realm = state.character.realm;
      role.exp = state.character.exp;
      role.age = state.character.age;
      role.maxAge = state.character.maxAge;
      await this.roleRepo.save(role);
    }
  }

  private async getWorldOutline(saveId: number): Promise<WorldOutline> {
    if (this.worldOutlineCache.has(saveId)) {
      return this.worldOutlineCache.get(saveId)!;
    }
    const world = await this.worldRepo.findOne({ where: { saveId, status: 'current' } });
    if (!world) {
      // fallback
      return this.agentService.generateWorld('练气初期', '凡界');
    }
    const outline: WorldOutline = {
      name: world.name,
      geography: world.geography || '',
      history: world.history || '',
      factions: world.factions || [],
      rules: world.rules || [],
      maxRealm: world.maxRealm,
    };
    this.worldOutlineCache.set(saveId, outline);
    return outline;
  }

  private async getStoryOutline(saveId: number): Promise<StoryOutline> {
    if (this.storyOutlineCache.has(saveId)) {
      return this.storyOutlineCache.get(saveId)!;
    }
    // 从 NPC 数据重建
    const npcs = await this.npcRepo.find({ where: { saveId } });
    const outline: StoryOutline = {
      background: '',
      npcs: npcs.map(n => ({
        name: n.name,
        type: n.type as any,
        personality: n.personality || '',
        initialAffinity: n.affinity,
        plotRole: n.metadata?.plotRole || '',
      })),
      destinyAnchors: [],
      storyTone: '先苦后甜，逆境翻盘',
    };
    this.storyOutlineCache.set(saveId, outline);
    return outline;
  }
}
