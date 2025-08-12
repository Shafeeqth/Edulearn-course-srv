import { IsString, IsNotEmpty } from "class-validator";

export class AddSectionRequestDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  title: string;
}
