export class InvalidCredentialsError extends Error {
  constructor(message = "Email ou mot de passe incorrect.") {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}

export class EmailAlreadyUsedError extends Error {
  constructor(message = "Un compte existe déjà avec cette adresse e-mail.") {
    super(message);
    this.name = "EmailAlreadyUsedError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Session expirée ou non autorisée.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
