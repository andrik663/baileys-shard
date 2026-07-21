export default class ShardError extends Error {
  code: string;

  constructor(message: string, code: string = "UNKNOWN") {
    super(message);
    this.name = "ShardError";
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}