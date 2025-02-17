import { Request, Response } from 'express';
import { paths } from '../../../../types/openapi';
import { moderateText } from '../../../../services/moderateText';

type PostResponse200 = paths['/message/send']['post']['responses']['200']['content']['application/json'];
type PostResponse400 = paths['/message/send']['post']['responses']['400']['content']['application/json'];
type PostRequestBody = paths['/message/send']['post']['requestBody']['content']['application/json'];

export const post = async (req: Request, res: Response, next) => {
  const { messages } = req.body as PostRequestBody;

  if (messages.length === 0 || messages.filter((x) => x.trim() !== '')?.length === 0) {
    res.status(400).json({
      message: 'Empty messages',
    } as PostResponse400);
    return;
  }

  try {
    const moderationResult = await moderateText(messages);

    res.status(200).json({
        success: !moderationResult.violations.some(x => x.level === 'danger'),
        ...moderationResult
    } as PostResponse200);
    return;
  } catch (error) {
    next(error);
  }
};
