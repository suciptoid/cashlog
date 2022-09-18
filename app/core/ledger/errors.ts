export class LedgerError extends Error {
  constructor(message?: string) {
    if (!message) {
      super("Ledger unknown error");
    } else {
      super(message);
    }
  }
}
export class BookNotExists extends LedgerError {
  constructor() {
    super("Book not exists");
  }
}
