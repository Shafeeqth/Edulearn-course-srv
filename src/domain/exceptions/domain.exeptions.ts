export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainException";
  }
}

export class CourseNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Course with ID ${id} not found`);
  }
}
export class CourseAlreadyExistException extends DomainException {
  constructor(title: string) {
    super(`Course with title ${title} already exist`);
  }
}

export class EnrollmentNotFoundException extends DomainException {
  constructor(userId: string, courseId: string) {
    super(`Enrollment for user ${userId} and course ${courseId} not found`);
  }
}
