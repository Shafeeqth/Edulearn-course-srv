import { IsString, IsNotEmpty, IsArray } from "class-validator";

export class AddQuizRequestDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsString({ each: true })
  questions: string[];
}
