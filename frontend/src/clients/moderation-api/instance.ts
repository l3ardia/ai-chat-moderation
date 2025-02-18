import { ModerationApi } from './ModerationApi';

export const moderationApi = new ModerationApi({
  BASE: process.env.NEXT_PUBLIC_MODERATION_API_ENDPOINT,
});
