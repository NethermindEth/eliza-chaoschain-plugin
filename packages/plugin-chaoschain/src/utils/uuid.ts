import { UUID } from '@elizaos/core';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Generate a UUID-like identifier from the counter
export const generateDeterministicUUID = (counter: number): UUID => {
    const counterString = counter.toString();
    const hash = createHash("sha256").update(counterString).digest("hex");
    return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}` as UUID;
};

export const generateUUID = (): UUID => {
    return uuidv4() as UUID;
};
