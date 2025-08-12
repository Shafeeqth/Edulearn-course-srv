import { IsString, IsNotEmpty } from "class-validator";
import { CreateSectionRequest } from "src/infrastructure/grpc/generated/course";

export class CreateSectionRequestDto implements CreateSectionRequest {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  title: string;
}
