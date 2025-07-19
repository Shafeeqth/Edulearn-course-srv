export abstract class DomainException extends Error {
  abstract errorCode: string;
  constructor(message: string) {
    super(message);
    this.name = "DomainException";
  }
  abstract serializeError(): { message: string; field?: string }[];
}

export class CourseNotFoundException extends DomainException {
  errorCode: string = "CourseNotFoundException";
  constructor(id: string) {
    super(`Course with ID ${id} not found`);
  }

  serializeError(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
export class CourseAlreadyExistException extends DomainException {
  errorCode: string = "CourseAlreadyExistException";
  constructor(title: string) {
    super(`Course with title ${title} already exist`);
  }
  serializeError(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
export class UserDomainException extends DomainException {
  errorCode: string = "UserDomainException";
  constructor(message: string) {
    super(message);
  }
  serializeError(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}

export class EnrollmentNotFoundException extends DomainException {
  errorCode: string = "EnrollmentNotFoundException";
  constructor(message: string) {
    super(message);
  }

  serializeError(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}

export class SectionNotFoundException extends DomainException {
  errorCode: string = "SectionNotFoundException";
  constructor(message: string) {
    super(message);
  }

  serializeError(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
export class LessonNotFoundException extends DomainException {
  errorCode: string = "LessonNotFoundException";
  constructor(message: string) {
    super(message);
  }

  serializeError(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}

export class AlreadyEnrolledException extends DomainException {
  errorCode: string = "AlreadyEnrolledException";
  constructor(message: string) {
    super(message);
  }

  serializeError(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
export class ProgressEntryAlreadyExistException extends DomainException {
  errorCode: string = "ProgressEntryAlreadyExistException";
  constructor(message: string) {
    super(message);
  }

  serializeError(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
export class ProgressNotFoundException extends DomainException {
  errorCode: string = "ProgressNotFoundException";
  constructor(message: string) {
    super(message);
  }

  serializeError(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
export class QuizNotFoundException extends DomainException {
  errorCode: string = "QuizNotFoundException";
  constructor(message: string) {
    super(message);
  }

  serializeError(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
export class ReviewNotFoundException extends DomainException {
  errorCode: string = "ReviewNotFoundException";
  constructor(message: string) {
    super(message);
  }

  serializeError(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
export class AlreadyReviewedException extends DomainException {
  errorCode: string = "AlreadyReviewedException";
  constructor(message: string) {
    super(message);
  }

  serializeError(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
export class ReviewException extends DomainException {
  errorCode: string = "ReviewedException";
  constructor(message: string) {
    super(message);
  }

  serializeError(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}

