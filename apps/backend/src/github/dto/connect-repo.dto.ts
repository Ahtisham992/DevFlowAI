import { IsString, IsUrl, IsNotEmpty } from 'class-validator';

export class ConnectRepoDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsUrl()
  @IsNotEmpty()
  repoUrl: string;
}
