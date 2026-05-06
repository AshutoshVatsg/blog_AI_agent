const { body } = require('express-validator');

exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

exports.loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.postValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('paragraphs')
    .isArray({ min: 1 })
    .withMessage('Post must have at least one paragraph'),
  body('paragraphs.*.content')
    .trim()
    .notEmpty()
    .withMessage('Paragraph content cannot be empty'),
];

exports.commentValidation = [
  body('content').trim().notEmpty().withMessage('Comment content is required'),
];

exports.consensusValidation = [
  body('mindChanging')
    .isInt({ min: 1, max: 10 })
    .withMessage('Mind-changing must be 1-10'),
  body('originality')
    .isInt({ min: 1, max: 10 })
    .withMessage('Originality must be 1-10'),
  body('clarity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Clarity must be 1-10'),
];

exports.reactionValidation = [
  body('paragraphIndex')
    .isInt({ min: 0 })
    .withMessage('Paragraph index is required'),
  body('emoji')
    .isIn(['👍', '❤️', '😂', '😮', '😢'])
    .withMessage('Invalid emoji'),
];

exports.claimValidation = [
  body('paragraphIndex')
    .isInt({ min: 0 })
    .withMessage('Paragraph index is required'),
  body('claimText').trim().notEmpty().withMessage('Claim text is required'),
  body('startOffset').isInt({ min: 0 }).withMessage('Start offset is required'),
  body('endOffset').isInt({ min: 0 }).withMessage('End offset is required'),
];

exports.claimVoteValidation = [
  body('verdict')
    .isIn(['verified', 'misleading', 'needs_source'])
    .withMessage('Invalid verdict'),
];
