import { UserDto } from '@miniledger/contracts';

declare global {
  namespace Express {
    interface Request {
      user?: UserDto;
      requestId?: string;
    }
  }
}
