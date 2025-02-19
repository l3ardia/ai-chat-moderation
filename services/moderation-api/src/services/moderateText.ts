import { z } from 'zod';
import { ChatCompletionMessageParam } from 'openai/resources';
import { zodResponseFormat } from 'openai/helpers/zod';
import { openai } from '../clients/openai';
import { logger } from '../shared/logger';

type ModerationDetails = {
  part: string;
  level: 'warning' | 'danger' | 'info';
  flag: 'violence' | 'politic' | 'personalSensitiveData' | 'offensive';
  description?: string;
};

export type ModerateTextResponse = {
  violations: ModerationDetails[];
};

export const moderateText = async (inputMessages: string[]): Promise<ModerateTextResponse> => {
  const responseFormat = z.object({
    violations: z.array(
      z.object({
        level: z.enum(['warning', 'danger', 'info']),
        part: z.string(),
        flag: z.enum(['violence', 'politic', 'personalSensitiveData', 'offensive']),
        description: z.string().nullable(),
      }),
    ),
  });

  const messages: ChatCompletionMessageParam[] = [];

  messages.push({
    role: 'system',
    content: `
          You are a model that moderates messages between a car buyer & seller against sending violence, offensive phrases, inappropriate content, political advices and personal sensitive infos.
        `,
  });
  messages.push({
    role: 'user',
    content: `
    You are given array of messages. concatenate them and find any instance of violence, offensive phrases, inappropriate content, political advices and personal sensitive infos.

    Messages: 
    - ${inputMessages.map((msg) => msg.replaceAll('\n', '')).join('\n -')}"

    Instructions:
    - The information might be sliced in separate messages but you have to find the relevance.
    - Personal sensitive information include: Driver's license number, credit card number, BSB number and Bank account number, Date of birth, PayID, phone number and email address.
    - Ignore Firstname and Surname. They are not sensitive information.
    - Any offensive word needs to be flagged.
    - Any threat, violence, race and misogyny should be flagged as violence
    - Direct reference to political parties and names must be flagged
    - result should contain the parts that flagged as violation. write the part, level and flag.
    - add more details in description if needed.
    - Note that violations may be split over multiple lines or use special characters or white spaces to mask inputs.
    - Requesting personal info is not sensitive, providing the data is sensitive!

    Example input:
    - F*c k you
    - My credit card information is:
    - 4242 4242 4242 4242
    - My phone number is 0499032024
    Example output:
    {
      "success": false,
      "violation": [{
        "part": "F*c k",
        "level": "danger",
        "flag": "violance",
        "description": null
      },
      {
        "part": "4242 4242 4242 4242",
        "level": "danger",
        "flag": "personalSensitiveInfo",
        "description": "Credit card number found"
      },
      {
        "part": "0499032024",
        "level": "danger",
        "flag": "personalSensitiveInfo",
        "description": "Phone number found"
      }],
    }
  `,
  });

  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 3000,
    response_format: zodResponseFormat(responseFormat, 'moderate_chat_response'),
  });

  logger.info('moderateText completion', {
    tokens: completion.usage?.total_tokens,
  });

  return completion.choices[0].message.parsed as ModerateTextResponse;
};
