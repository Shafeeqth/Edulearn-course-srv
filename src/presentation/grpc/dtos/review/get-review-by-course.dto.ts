import { IsString, IsNotEmpty } from "class-validator";

export class GetReviewsByCourseRequestDto {
  @IsString()
  @IsNotEmpty()
  course_id: string;
}
