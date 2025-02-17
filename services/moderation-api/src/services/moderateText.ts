import { z } from 'zod';
import { ChatCompletionMessageParam } from 'openai/resources';
import { zodResponseFormat } from 'openai/helpers/zod';
import { openai } from '../clients/openai';
import { logger } from '../shared/logger';

type ModerationDetails = {
  index: number;
  part: string;
  level: 'warning' | 'danger' | 'info',
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
        index: z.number(),
        level: z.enum(['warning', 'danger', 'info']),
        part: z.string(),
        flag: z.enum(['violence', 'politic', 'personalSensitiveData', 'offensive']),
        description: z.string().nullable()
      }),
    ),
  });

  const messages: ChatCompletionMessageParam[] = [];

  messages.push({
    role: 'system',
    content: `
          You are a model that moderates messages against sending violence, offensive phrases, political advices and personal sensitive infos.
        `,
  });
  messages.push({
    role: 'user',
    content: `
    You are given array of messages. concatenate them and find any instance of violence, personal sensitive information, offensive text and political advices.

    Messages: 
    - ${inputMessages.map((msg) => msg.replaceAll('\n', '')).join('\n -')}"

    Instructions:
    - The information might be sliced in separate messages but you have to find the relevance.
    - Personal sensitive information include: Driver's license number, credit card number, BSB number and Bank account number and Date of birth. Be conservative with your usage of "personalSensitiveData". Personal Sensitive data must be explicitly presented. Just flag it if and only if the data is presented. for example "What is your BSB number?" is not flagged because still no BSB number is provided.
    - Ignore Firstname, Surname, email and phone number, as they are not sensitive information.
    - Any offensive word needs to be flagged. Be conservative with your usage of "offensive" words. Offensive words should be explicitly presented. otherwise it is not offensive.
    - Any threat, violence, race and misogyny should be flagged as violence
    - Direct reference to political parties and names must be flagged
    - result should contain the parts that flagged as violation. put message index (the line number starting from 0), including the part and flag.
    - add more details in description if needed.
    - Note that to consider something as violation the data should be specifically provided. For example if user says that "I will give you my bank account information" but the user dosn't send the bank account number it is not considered as violation.

    Example input:
    - Fuck you
    - My credit card information is:
    - 4242 4242 4242 4242
    - My phone number is 0499032024
    Example output:
    {
      "success": false,
      "violation": [{
        "index": 0,
        "part": "Fuck",
        "flag": "violance",
        "description": null
      },
      {
        "index": 0,
        "part": "4242 4242 4242 4242",
        "flag": "personalSensitiveInfo",
        "description": "Credit card number found"
      }      
      ],
    }
  `,
  });

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 3000,
    response_format: zodResponseFormat(
      responseFormat,
      "moderate_chat_response"
    ),
  });
  
  logger.info("moderateText completion", {
    tokens: completion.usage?.total_tokens,
  });

  return completion.choices[0].message.parsed as ModerateTextResponse;
  
};
