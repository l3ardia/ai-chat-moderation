import express from "express";
import * as message from './message'

const router = express.Router();

router.post('/message/send', message.send.post);

export default router;