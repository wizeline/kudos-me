const { HELP_MESSAGE } = require('../message');

const HELP_AND_SUGESSTION = {
  type: 'context',
  elements: [
    {
      type: 'mrkdwn',
      text: HELP_MESSAGE,
    },
  ],
};

function getInvalidPollHelp(userId, command, text = '') {
  return {
    response_type: 'ephemeral',
    blocks: [
      getWelcomeUserSection(userId),
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Your poll: \`\`\`${command} ${text}\`\`\` is *invalid*. Please recreate your poll.`,
        },
      },
      getSampleCommandSection(command),
      HELP_AND_SUGESSTION,
    ],
  };
}

function getPollHelp(userId, command) {
  return {
    response_type: 'ephemeral',
    blocks: [
      getWelcomeUserSection(userId),
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Thanks for reaching out \`${command}\`.`,
        },
      },
      getSampleCommandSection(command),
      HELP_AND_SUGESSTION,
    ],
  };
}

function getWelcomeUserSection(userId) {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `Hi <@${userId}>,`,
    },
  };
}

function getSampleCommandSection(command) {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text:
        'Here are some examples of valid polls:'
        + `\n\`${command} "what ?" "a" "b" \``
        + `\n\`${command} "when ?" "a" "b" single\``
        + `\n\`${command} "where ?" "a" "b" anonymous\``
        + `\n\`${command} "who ?" "a" "b" single anonymous\``
        + '\nThe default options of poll are `identified` with `multiple` choices.',
    },
  };
}

module.exports = {
  HELP_MESSAGE,
  getInvalidPollHelp,
  getPollHelp,
};
