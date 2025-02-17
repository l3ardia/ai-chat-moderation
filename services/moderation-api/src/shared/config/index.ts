import convict from 'convict';
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(".env.local") });

const schema = convict({
  ENV: {
    type: String,
    default: 'local',
    env: 'ENV',
  },
  OPENAI_API_KEY: {
    type: String,
    default: '',
    env: 'OPENAI_API_KEY'
  }
});

// Validate the loaded config matches the schema
schema.validate({ allowed: 'strict' });

export const config = schema.getProperties();
