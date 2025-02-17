import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import indexRouter from './routes';
import * as OpenApiValidator from 'express-openapi-validator';
import bodyParser from 'body-parser';
import { logger } from './shared/logger';
import { config } from './shared/config';

var app = express();

// Use cookie-parser middleware
app.use(cookieParser());

app.use(bodyParser.json());

app.use(cors());

const apiSpec = path.resolve(__dirname, './openapi.yml');

app.use('/spec', express.static(apiSpec));

app.use(
  OpenApiValidator.middleware({
    ignoreUndocumented: true,
    apiSpec,
    validateRequests: true,
    validateResponses: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use((err, req, res, next) => {
  logger.error(err.message, { err });

  res.status(err.status || 500).json({
    code: err.status === 400 ? 'bad_request' : 'error',
    message: err.message,
    errors: req.app.get('env') === 'development' ? err.errors : {}
  });
});

export default app;
