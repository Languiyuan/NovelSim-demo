import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class HistoryItem {
  role: string;
  content: string;
}

export class NextNarrativeDto {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HistoryItem)
  history?: HistoryItem[];
}
