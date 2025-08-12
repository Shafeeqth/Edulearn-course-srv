import { IsString, IsNotEmpty, IsInt, Min, Max } from "class-validator";

export class UpdateReviewRequestDto {
  @IsString()
  @IsNotEmpty()
  review_id: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;
}
