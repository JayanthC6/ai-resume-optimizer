import { IsString, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class AnalyzeMarketDto {
  @IsString()
  resumeId!: string;

  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  jobDescriptions!: string[];
}
