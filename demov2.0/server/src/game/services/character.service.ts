import { Injectable } from '@nestjs/common';
import { generateRandomName, BaseAttrs } from '../../shared/constants';

export interface CharacterRoll {
  name: string;
  jing: number;
  qi: number;
  shen: number;
  talent: number;
  wisdom: number;
  luck: number;
  maxAge: number;
}

@Injectable()
export class CharacterService {
  rollCharacter(): CharacterRoll {
    const roll = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const jing = roll(30, 80);
    const qi = roll(30, 80);
    const shen = roll(30, 80);
    const talent = roll(1, 100);
    const wisdom = roll(1, 100);
    const luck = roll(1, 100);
    const maxAge = 80 + qi * 2;

    return {
      name: generateRandomName(),
      jing, qi, shen,
      talent, wisdom, luck,
      maxAge,
    };
  }
}
