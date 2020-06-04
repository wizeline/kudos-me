const express = require('express');

const router = express.Router();

const { asyncMiddleware } = require('../middleware');
const slackController = require('../controller/slack-controller');

router.post(
  '/commands/kudos-me',
  asyncMiddleware(slackController.commandKudos),
);


router.post(
  '/commands/wize-poll',
  asyncMiddleware(slackController.wizePoll),
);

router.post(
  '/commands/interactive-endpoint',
  asyncMiddleware(slackController.interactive),
);

module.exports = router;
