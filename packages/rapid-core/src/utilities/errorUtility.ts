export function newError(type: string, message?: string, cause?: any) {
  const error = new Error(
    message, {
      cause,
    }
  );
  error.name = type;
  return error;
}

export function newDatabaseError(message?: string, cause?: any) {
  return newError("DatabaseError", message, cause);
}

export function newEntityOperationError(message?: string, cause?: any) {
  return newError("EntityOperationError", message, cause);
}